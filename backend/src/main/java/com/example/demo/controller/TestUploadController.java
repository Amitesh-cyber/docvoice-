package com.example.demo.controller;

import com.example.demo.domain.Document;
import com.example.demo.domain.User;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.DocumentProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api/test-upload")
public class TestUploadController {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentProcessingService documentProcessingService;

    public TestUploadController(DocumentRepository documentRepository, UserRepository userRepository, DocumentProcessingService documentProcessingService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentProcessingService = documentProcessingService;
    }

    @PostMapping("/local-file")
    public ResponseEntity<?> testUploadLocalFile(@RequestParam String filePath) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                return ResponseEntity.badRequest().body("File does not exist: " + filePath);
            }

            // create dummy user if not exists
            User user = userRepository.findByEmail("test@example.com").orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail("test@example.com");
                user.setName("Test User");
                userRepository.save(user);
            }

            Document document = new Document();
            document.setUser(user);
            document.setFilename(file.getName());
            document.setFilePath(file.getAbsolutePath());
            document.setFileType("PDF");
            document.setStatus("PROCESSING");
            document = documentRepository.save(document);

            documentProcessingService.processDocument(document.getId());

            return ResponseEntity.ok("Processing initiated for Document ID: " + document.getId());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed: " + e.getMessage());
        }
    }
}
