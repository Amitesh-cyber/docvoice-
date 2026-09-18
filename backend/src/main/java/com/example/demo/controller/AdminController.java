package com.example.demo.controller;

import com.example.demo.domain.Document;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.service.DocumentProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final DocumentRepository documentRepository;
    private final DocumentProcessingService documentProcessingService;

    public AdminController(DocumentRepository documentRepository, DocumentProcessingService documentProcessingService) {
        this.documentRepository = documentRepository;
        this.documentProcessingService = documentProcessingService;
    }

    @PostMapping("/reprocess/{documentId}")
    public ResponseEntity<?> reprocessDocument(@PathVariable Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return ResponseEntity.notFound().build();
        }

        // Reset status to PROCESSING
        document.setStatus("PROCESSING");
        // Clear error_message
        document.setErrorMessage(null);
        documentRepository.save(document);

        // Re-run processDocument(documentId)
        documentProcessingService.processDocument(documentId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Reprocessing started for document " + documentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reprocess-all-stuck")
    public ResponseEntity<?> reprocessAllStuck() {
        // Find all docs with status FAILED or PROCESSING
        List<Document> stuck = documentRepository.findByStatusIn(List.of("FAILED", "PROCESSING"));

        for (Document doc : stuck) {
            doc.setStatus("PROCESSING");
            doc.setErrorMessage(null);
            documentRepository.save(doc);
            documentProcessingService.processDocument(doc.getId());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("count", stuck.size());
        response.put("message", "Reprocessed " + stuck.size() + " docs");
        return ResponseEntity.ok(response);
    }
}
