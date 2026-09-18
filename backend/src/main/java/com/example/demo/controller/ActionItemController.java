package com.example.demo.controller;
import com.example.demo.domain.ActionItem;
import com.example.demo.domain.Document;
import com.example.demo.domain.User;
import com.example.demo.repository.ActionItemRepository;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai/action-items")
public class ActionItemController {
    private final ActionItemRepository actionItemRepository;
    private final UserRepository userRepository;
    public ActionItemController(ActionItemRepository actionItemRepository, UserRepository userRepository) {
        this.actionItemRepository = actionItemRepository;
        this.userRepository = userRepository;
    }
    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }
    @GetMapping("/{documentId}")
    public ResponseEntity<?> getItems(@PathVariable Long documentId, Authentication authentication) {
        if (getAuthenticatedUser(authentication) == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(actionItemRepository.findByDocumentId(documentId));
    }
    @PutMapping("/{itemId}/complete")
    public ResponseEntity<?> markComplete(@PathVariable Long itemId, Authentication authentication) {
        if (getAuthenticatedUser(authentication) == null) return ResponseEntity.status(401).build();
        Optional<ActionItem> itemOpt = actionItemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            ActionItem item = itemOpt.get();
            item.setIsCompleted(true);
            actionItemRepository.save(item);
            return ResponseEntity.ok(item);
        }
        return ResponseEntity.notFound().build();
    }
}
