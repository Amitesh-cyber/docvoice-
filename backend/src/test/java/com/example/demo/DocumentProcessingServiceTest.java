package com.example.demo;

import com.example.demo.domain.Document;
import com.example.demo.domain.Page;
import com.example.demo.domain.User;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.PageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.DocumentProcessingService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DocumentProcessingServiceTest {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentProcessingService documentProcessingService;

    private void waitForCompletion(Long docId) throws InterruptedException {
        long start = System.currentTimeMillis();
        while (System.currentTimeMillis() - start < 10000) {
            Thread.sleep(150);
            Document d = documentRepository.findById(docId).orElse(null);
            if (d != null && !"PROCESSING".equals(d.getStatus())) {
                return;
            }
        }
    }

    private File createValidPdf(String filename) throws Exception {
        File pdfFile = new File(filename);
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                content.newLineAtOffset(100, 700);
                content.showText("Hello DocVoice! This is a valid test PDF document.");
                content.endText();
            }
            doc.save(pdfFile);
        }
        return pdfFile;
    }

    @Test
    public void testPdfBox3LoaderLoadsPdf() throws Exception {
        File pdfFile = createValidPdf("valid_test.pdf");
        try (PDDocument doc = Loader.loadPDF(pdfFile)) {
            assertEquals(1, doc.getNumberOfPages(), "PDF should have 1 page");
            System.out.println("Verified PDFBox 3.x Loader.loadPDF works! Page count: " + doc.getNumberOfPages());
        } finally {
            if (pdfFile.exists()) {
                pdfFile.delete();
            }
        }
    }

    @Test
    public void testProcessPdfDocumentEndToEnd() throws Exception {
        File pdfFile = createValidPdf("pdf_process_test.pdf");
        try {
            User user = userRepository.findByEmail("test_user@docvoice.com").orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail("test_user@docvoice.com");
                user.setName("Test User");
                user.setPasswordHash("hashedpassword");
                user = userRepository.save(user);
            }

            Document doc = new Document();
            doc.setUser(user);
            doc.setFilename("pdf_process_test.pdf");
            doc.setFilePath(pdfFile.getAbsolutePath());
            doc.setFileType("PDF");
            doc.setStatus("PROCESSING");
            doc = documentRepository.save(doc);

            documentProcessingService.processDocument(doc.getId());
            waitForCompletion(doc.getId());

            Document updated = documentRepository.findById(doc.getId()).orElseThrow();
            assertEquals("READY", updated.getStatus(), "Status should be READY. Error was: " + updated.getErrorMessage());
            assertEquals(1, updated.getTotalPages());
            assertNull(updated.getErrorMessage());

            List<Page> pages = pageRepository.findByDocumentIdOrderByPageNumberAsc(doc.getId());
            assertEquals(1, pages.size());
            assertTrue(pages.get(0).getOriginalText().contains("Hello DocVoice"));
            System.out.println("PDF Document processing test PASSED with " + pages.size() + " pages!");
        } finally {
            if (pdfFile.exists()) {
                pdfFile.delete();
            }
        }
    }

    @Test
    public void testPptxProcessingEndToEnd() throws Exception {
        File pptxFile = new File("test_sample.pptx");
        try (XMLSlideShow ppt = new XMLSlideShow()) {
            XSLFSlide slide = ppt.createSlide();
            XSLFTextShape shape = slide.createTextBox();
            shape.setText("Testing Apache POI 5.2.5 slide content for DocVoice.");
            try (FileOutputStream fos = new FileOutputStream(pptxFile)) {
                ppt.write(fos);
            }
        }

        try {
            User user = userRepository.findByEmail("test_user@docvoice.com").orElse(null);
            if (user == null) {
                user = new User();
                user.setEmail("test_user@docvoice.com");
                user.setName("Test User");
                user.setPasswordHash("hashedpassword");
                user = userRepository.save(user);
            }

            Document doc = new Document();
            doc.setUser(user);
            doc.setFilename("test_sample.pptx");
            doc.setFilePath(pptxFile.getAbsolutePath());
            doc.setFileType("PPTX");
            doc.setStatus("PROCESSING");
            doc = documentRepository.save(doc);

            documentProcessingService.processDocument(doc.getId());
            waitForCompletion(doc.getId());

            Document updated = documentRepository.findById(doc.getId()).orElseThrow();
            assertEquals("READY", updated.getStatus(), "Status should be READY. Error was: " + updated.getErrorMessage());
            assertEquals(1, updated.getTotalPages());
            assertNull(updated.getErrorMessage());

            List<Page> pages = pageRepository.findByDocumentIdOrderByPageNumberAsc(doc.getId());
            assertEquals(1, pages.size());
            assertTrue(pages.get(0).getOriginalText().contains("Testing Apache POI 5.2.5"));
            System.out.println("PPTX processing test PASSED: " + pages.get(0).getOriginalText());
        } finally {
            if (pptxFile.exists()) {
                pptxFile.delete();
            }
        }
    }
}
