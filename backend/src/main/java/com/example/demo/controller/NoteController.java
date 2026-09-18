package com.example.demo.controller;

import com.example.demo.domain.Document;
import com.example.demo.domain.PageNote;
import com.example.demo.domain.User;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.PageNoteRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final PageNoteRepository pageNoteRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public NoteController(PageNoteRepository pageNoteRepository, UserRepository userRepository, DocumentRepository documentRepository) {
        this.pageNoteRepository = pageNoteRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody Map<String, Object> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        Long documentId = Long.valueOf(request.get("documentId").toString());
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) return ResponseEntity.badRequest().body("Document not found");

        PageNote note = new PageNote();
        note.setUser(user);
        note.setDocument(docOpt.get());
        note.setPageNumber(Integer.valueOf(request.get("pageNumber").toString()));
        note.setNoteText(request.getOrDefault("noteText", "").toString());
        note.setHighlightedText(request.getOrDefault("highlightedText", "").toString());
        note.setColor(request.getOrDefault("color", "#fbbf24").toString());

        pageNoteRepository.save(note);
        return ResponseEntity.ok(note);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getNotes(@PathVariable Long documentId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        List<PageNote> notes = pageNoteRepository.findByDocumentId(documentId);
        // Ensure user only sees their own notes
        notes.removeIf(n -> !n.getUser().getId().equals(user.getId()));
        return ResponseEntity.ok(notes);
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<?> updateNote(@PathVariable Long noteId, @RequestBody Map<String, String> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        Optional<PageNote> noteOpt = pageNoteRepository.findById(noteId);
        if (noteOpt.isEmpty()) return ResponseEntity.notFound().build();

        PageNote note = noteOpt.get();
        if (!note.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).build();

        if (request.containsKey("noteText")) note.setNoteText(request.get("noteText"));
        if (request.containsKey("color")) note.setColor(request.get("color"));

        pageNoteRepository.save(note);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable Long noteId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        Optional<PageNote> noteOpt = pageNoteRepository.findById(noteId);
        if (noteOpt.isEmpty()) return ResponseEntity.notFound().build();

        if (!noteOpt.get().getUser().getId().equals(user.getId())) return ResponseEntity.status(403).build();

        pageNoteRepository.deleteById(noteId);
        return ResponseEntity.ok().build();
    }
}
