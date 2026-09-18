package com.example.demo.controller;

import com.example.demo.domain.Document;
import com.example.demo.domain.User;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.DocumentProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentProcessingService documentProcessingService;

    public DocumentController(DocumentRepository documentRepository, UserRepository userRepository, DocumentProcessingService documentProcessingService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentProcessingService = documentProcessingService;
    }

    @GetMapping
    public ResponseEntity<?> getUserDocuments(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Document> documents = documentRepository.findByUserId(user.getId());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(@PathVariable Long id) {
        return documentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("[UPLOAD] Request received from user: {}", email);
        log.info("[UPLOAD] File name: {}, Size: {}, ContentType: {}", file.getOriginalFilename(), file.getSize(), file.getContentType());

        try {
            User user = null;
            if (email != null) {
                user = userRepository.findByEmail(email).orElse(null);
            }
            if (user == null) {
                // If not authenticated or user not found, try to find any existing user or first user for testing
                List<User> allUsers = userRepository.findAll();
                if (!allUsers.isEmpty()) {
                    user = allUsers.get(0);
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found in database. Please log in again.");
                }
            }

            String originalFilename = file.getOriginalFilename();
            String lowerName = originalFilename != null ? originalFilename.toLowerCase() : "";

            String fileType = "PDF";
            if (lowerName.endsWith(".pdf")) {
                fileType = "PDF";
            } else if (lowerName.endsWith(".pptx") || lowerName.endsWith(".ppt")) {
                fileType = "PPTX";
            } else if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
                fileType = "DOCX";
            } else if (file.getContentType() != null) {
                fileType = file.getContentType();
            }

            // Save file to disk
            File uploadDir = new File("./uploads");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String savedFileName = System.currentTimeMillis() + "_" + (originalFilename != null ? originalFilename : "upload");
            File destFile = new File(uploadDir, savedFileName);
            file.transferTo(destFile.getAbsoluteFile());
            log.info("[UPLOAD] File saved to disk at: {}", destFile.getAbsolutePath());

            Document document = new Document();
            document.setUser(user);
            document.setFilename(originalFilename);
            document.setFileType(fileType);
            document.setFilePath(destFile.getAbsolutePath());
            document.setStatus("PROCESSING");
            document = documentRepository.save(document);

            // Process async using new DocumentProcessingService
            documentProcessingService.processDocument(document.getId());

            log.info("[UPLOAD] Successfully saved and triggered processing for document ID: {}", document.getId());
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            log.error("[UPLOAD] ERROR: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}
