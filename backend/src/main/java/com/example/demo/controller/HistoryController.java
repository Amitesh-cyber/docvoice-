package com.example.demo.controller;

import com.example.demo.domain.ListeningHistory;
import com.example.demo.domain.Document;
import com.example.demo.domain.User;
import com.example.demo.repository.ListeningHistoryRepository;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
public class HistoryController {
    private final ListeningHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public HistoryController(ListeningHistoryRepository historyRepository, UserRepository userRepository, DocumentRepository documentRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateHistory(@RequestBody Map<String, Object> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();

        Long documentId = Long.valueOf(request.get("documentId").toString());
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) return ResponseEntity.badRequest().build();

        Optional<ListeningHistory> histOpt = historyRepository.findByUserIdAndDocumentId(user.getId(), documentId);
        ListeningHistory hist = histOpt.orElse(new ListeningHistory());
        
        hist.setUser(user);
        hist.setDocument(docOpt.get());
        hist.setLastPage(Integer.valueOf(request.getOrDefault("lastPage", "1").toString()));
        if(request.containsKey("totalTimeSeconds")) {
            hist.setTotalTimeSeconds(Integer.valueOf(request.get("totalTimeSeconds").toString()));
        }
        if(request.containsKey("pagesListened")) {
            hist.setPagesListened(request.get("pagesListened").toString());
        }
        hist.setLastListenedAt(LocalDateTime.now());
        
        historyRepository.save(hist);
        return ResponseEntity.ok(hist);
    }

    @GetMapping
    public ResponseEntity<?> getHistory(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(historyRepository.findByUserId(user.getId()));
    }
}
