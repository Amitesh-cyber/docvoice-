package com.example.demo.controller;

import com.example.demo.domain.Document;
import com.example.demo.domain.Page;
import com.example.demo.domain.User;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.PageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
public class ExportController {
    private final DocumentRepository documentRepository;
    private final PageRepository pageRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    public ExportController(DocumentRepository documentRepository, PageRepository pageRepository, UserRepository userRepository, GeminiService geminiService) {
        this.documentRepository = documentRepository;
        this.pageRepository = pageRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    private String getFullDocumentText(Long documentId) {
        List<Page> pages = pageRepository.findByDocumentIdOrderByPageNumberAsc(documentId);
        StringBuilder sb = new StringBuilder();
        for (Page p : pages) {
            sb.append(p.getOriginalText()).append("\n\n");
        }
        return sb.toString();
    }

    @PostMapping("/generate-email/{documentId}")
    public ResponseEntity<?> generateEmail(@PathVariable Long documentId, Authentication authentication) {
        if (getAuthenticatedUser(authentication) == null) return ResponseEntity.status(401).build();
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) return ResponseEntity.notFound().build();
        String result = geminiService.generateEmail(getFullDocumentText(documentId));
        return ResponseEntity.ok(Map.of("email", result));
    }

    @PostMapping("/generate-report/{documentId}")
    public ResponseEntity<?> generateReport(@PathVariable Long documentId, Authentication authentication) {
        if (getAuthenticatedUser(authentication) == null) return ResponseEntity.status(401).build();
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) return ResponseEntity.notFound().build();
        String result = geminiService.generateReport(getFullDocumentText(documentId));
        return ResponseEntity.ok(Map.of("report", result));
    }

    @PostMapping("/meeting-notes/{documentId}")
    public ResponseEntity<?> convertMeetingNotes(@PathVariable Long documentId, Authentication authentication) {
        if (getAuthenticatedUser(authentication) == null) return ResponseEntity.status(401).build();
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) return ResponseEntity.notFound().build();
        String result = geminiService.extractMeetingNotes(getFullDocumentText(documentId));
        return ResponseEntity.ok(Map.of("meetingNotes", result));
    }
}
