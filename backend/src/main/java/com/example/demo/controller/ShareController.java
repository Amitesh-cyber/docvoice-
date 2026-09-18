package com.example.demo.controller;

import com.example.demo.domain.SharedSummary;
import com.example.demo.domain.Document;
import com.example.demo.domain.Page;
import com.example.demo.domain.User;
import com.example.demo.repository.SharedSummaryRepository;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.PageRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/share")
public class ShareController {
    private final SharedSummaryRepository sharedSummaryRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final PageRepository pageRepository;

    public ShareController(SharedSummaryRepository sharedSummaryRepository, UserRepository userRepository, DocumentRepository documentRepository, PageRepository pageRepository) {
        this.sharedSummaryRepository = sharedSummaryRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.pageRepository = pageRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @PostMapping("/{documentId}")
    public ResponseEntity<?> generateShareLink(@PathVariable Long documentId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty() || !docOpt.get().getUser().getId().equals(user.getId())) return ResponseEntity.status(403).build();

        SharedSummary share = new SharedSummary();
        share.setUser(user);
        share.setDocument(docOpt.get());
        share.setShareToken(UUID.randomUUID().toString());
        sharedSummaryRepository.save(share);

        return ResponseEntity.ok(Map.of("shareToken", share.getShareToken(), "url", "/share/" + share.getShareToken()));
    }

    @GetMapping("/view/{shareToken}")
    public ResponseEntity<?> viewSharedSummary(@PathVariable String shareToken) {
        Optional<SharedSummary> shareOpt = sharedSummaryRepository.findByShareToken(shareToken);
        if (shareOpt.isEmpty() || !shareOpt.get().getIsActive()) return ResponseEntity.notFound().build();

        Document doc = shareOpt.get().getDocument();
        List<Page> pages = pageRepository.findByDocumentIdOrderByPageNumberAsc(doc.getId());
        
        List<Map<String, Object>> summaries = pages.stream().map(p -> Map.<String, Object>of(
            "pageNumber", p.getPageNumber(),
            "summaryText", p.getSummaryText() != null ? p.getSummaryText() : ""
        )).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "documentName", doc.getFilename(),
            "summaries", summaries
        ));
    }

    @DeleteMapping("/{shareToken}")
    public ResponseEntity<?> deactivateShare(@PathVariable String shareToken, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        
        Optional<SharedSummary> shareOpt = sharedSummaryRepository.findByShareToken(shareToken);
        if (shareOpt.isPresent() && shareOpt.get().getUser().getId().equals(user.getId())) {
            SharedSummary share = shareOpt.get();
            share.setIsActive(false);
            sharedSummaryRepository.save(share);
        }
        return ResponseEntity.ok().build();
    }
}
