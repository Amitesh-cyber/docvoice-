package com.example.demo.config;

import com.example.demo.domain.Document;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.service.DocumentProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StartupStuckDocumentReprocessor {

    private static final Logger log = LoggerFactory.getLogger(StartupStuckDocumentReprocessor.class);

    private final DocumentRepository documentRepository;
    private final DocumentProcessingService documentProcessingService;

    public StartupStuckDocumentReprocessor(DocumentRepository documentRepository, DocumentProcessingService documentProcessingService) {
        this.documentRepository = documentRepository;
        this.documentProcessingService = documentProcessingService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void reprocessStuckDocumentsOnStartup() {
        log.info("Checking for stuck documents...");
        List<Document> stuck = documentRepository.findByStatusIn(
                List.of("PROCESSING", "FAILED")
        );
        log.info("Found " + stuck.size() + " stuck documents, reprocessing...");
        for (Document doc : stuck) {
            try {
                doc.setStatus("PROCESSING");
                doc.setErrorMessage(null);
                documentRepository.save(doc);
                documentProcessingService.processDocument(doc.getId());
            } catch (Exception e) {
                log.error("Failed to reprocess doc " + doc.getId() + ": " + e.getMessage());
            }
        }
    }
}
