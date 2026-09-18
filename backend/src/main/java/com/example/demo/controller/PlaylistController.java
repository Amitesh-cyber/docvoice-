package com.example.demo.controller;
import com.example.demo.domain.Playlist;
import com.example.demo.domain.PlaylistItem;
import com.example.demo.domain.Document;
import com.example.demo.domain.User;
import com.example.demo.repository.PlaylistRepository;
import com.example.demo.repository.PlaylistItemRepository;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {
    private final PlaylistRepository playlistRepository;
    private final PlaylistItemRepository playlistItemRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    public PlaylistController(PlaylistRepository playlistRepository, PlaylistItemRepository playlistItemRepository, UserRepository userRepository, DocumentRepository documentRepository) {
        this.playlistRepository = playlistRepository;
        this.playlistItemRepository = playlistItemRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }
    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }
    @GetMapping
    public ResponseEntity<?> getPlaylists(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(playlistRepository.findByUserId(user.getId()));
    }
    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestBody Map<String, String> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        Playlist p = new Playlist();
        p.setUser(user);
        p.setName(request.get("name"));
        p.setDescription(request.getOrDefault("description", ""));
        playlistRepository.save(p);
        return ResponseEntity.ok(p);
    }
    @PostMapping("/{id}/items")
    public ResponseEntity<?> addItem(@PathVariable Long id, @RequestBody Map<String, Long> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(401).build();
        Optional<Playlist> pOpt = playlistRepository.findById(id);
        Optional<Document> dOpt = documentRepository.findById(request.get("documentId"));
        if (pOpt.isPresent() && dOpt.isPresent()) {
            PlaylistItem item = new PlaylistItem();
            item.setPlaylist(pOpt.get());
            item.setDocument(dOpt.get());
            item.setOrderIndex(0);
            playlistItemRepository.save(item);
            return ResponseEntity.ok(item);
        }
        return ResponseEntity.badRequest().build();
    }
}
