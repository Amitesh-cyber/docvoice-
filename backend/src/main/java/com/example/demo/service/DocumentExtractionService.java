package com.example.demo.service;

import com.example.demo.domain.Document;
import org.springframework.stereotype.Service;

@Service
public class DocumentExtractionService {
    private final DocumentProcessingService documentProcessingService;

    public DocumentExtractionService(DocumentProcessingService documentProcessingService) {
        this.documentProcessingService = documentProcessingService;
    }

    public void processDocument(Document document, byte[] fileBytes, String filename) {
        if (document != null && document.getId() != null) {
            documentProcessingService.processDocument(document.getId());
        }
    }
}
