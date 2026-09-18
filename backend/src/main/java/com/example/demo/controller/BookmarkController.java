package com.example.demo.controller;

import com.example.demo.domain.Bookmark;
import com.example.demo.domain.Document;
import com.example.demo.domain.User;
import com.example.demo.repository.BookmarkRepository;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public BookmarkController(BookmarkRepository bookmarkRepository, UserRepository userRepository, DocumentRepository documentRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @PostMapping
    public ResponseEntity<?> createBookmark(@RequestBody Map<String, Object> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        Long documentId = Long.valueOf(request.get("documentId").toString());
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) return ResponseEntity.badRequest().body("Document not found");

        Bookmark bm = new Bookmark();
        bm.setUser(user);
        bm.setDocument(docOpt.get());
        bm.setPageNumber(Integer.valueOf(request.get("pageNumber").toString()));
        bm.setSentenceText(request.getOrDefault("sentenceText", "").toString());
        bm.setPersonalNote(request.getOrDefault("personalNote", "").toString());

        bookmarkRepository.save(bm);
        return ResponseEntity.ok(bm);
    }

    @GetMapping
    public ResponseEntity<?> getAllBookmarks(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(bookmarkRepository.findByUserId(user.getId()));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getBookmarksForDoc(@PathVariable Long documentId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        List<Bookmark> list = bookmarkRepository.findByDocumentId(documentId);
        list.removeIf(b -> !b.getUser().getId().equals(user.getId()));
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{bookmarkId}")
    public ResponseEntity<?> deleteBookmark(@PathVariable Long bookmarkId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        Optional<Bookmark> opt = bookmarkRepository.findById(bookmarkId);
        if (opt.isEmpty() || !opt.get().getUser().getId().equals(user.getId())) return ResponseEntity.status(403).build();
        bookmarkRepository.deleteById(bookmarkId);
        return ResponseEntity.ok().build();
    }
}
