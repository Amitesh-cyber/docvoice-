package com.example.demo.controller;

import com.example.demo.domain.Document;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.PageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    private final DocumentRepository documentRepository;
    private final PageRepository pageRepository;

    public DebugController(DocumentRepository documentRepository, PageRepository pageRepository) {
        this.documentRepository = documentRepository;
        this.pageRepository = pageRepository;
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<?> getDocumentDebug(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);

        if (document == null) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("error", "Document not found with ID: " + documentId);
            return ResponseEntity.notFound().build();
        }

        String filePath = document.getFilePath();
        boolean fileExists = filePath != null && new File(filePath).exists();
        long pagesInDb = pageRepository.countByDocumentId(documentId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", document.getId());
        response.put("filename", document.getFilename());
        response.put("status", document.getStatus());
        response.put("filePath", filePath);
        response.put("fileExists", fileExists);
        response.put("totalPages", document.getTotalPages() != null ? document.getTotalPages() : 0);
        response.put("errorMessage", document.getErrorMessage());
        response.put("pagesInDb", pagesInDb);

        return ResponseEntity.ok(response);
    }
}
