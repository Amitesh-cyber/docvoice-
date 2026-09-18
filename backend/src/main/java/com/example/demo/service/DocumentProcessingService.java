package com.example.demo.service;

import com.example.demo.domain.Document;
import com.example.demo.domain.Page;
import com.example.demo.repository.DocumentRepository;
import com.example.demo.repository.PageRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackageAccess;
import org.apache.poi.hslf.usermodel.HSLFGroupShape;
import org.apache.poi.hslf.usermodel.HSLFShape;
import org.apache.poi.hslf.usermodel.HSLFSlide;
import org.apache.poi.hslf.usermodel.HSLFSlideShow;
import org.apache.poi.hslf.usermodel.HSLFTable;
import org.apache.poi.hslf.usermodel.HSLFTableCell;
import org.apache.poi.hslf.usermodel.HSLFTextShape;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFGroupShape;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTable;
import org.apache.poi.xslf.usermodel.XSLFTableCell;
import org.apache.poi.xslf.usermodel.XSLFTableRow;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentProcessingService {

    private static final Logger log = LoggerFactory.getLogger(DocumentProcessingService.class);

    private final DocumentRepository documentRepository;
    private final PageRepository pageRepository;

    public DocumentProcessingService(DocumentRepository documentRepository, PageRepository pageRepository) {
        this.documentRepository = documentRepository;
        this.pageRepository = pageRepository;
    }

    @Async
    public void processDocument(Long documentId) {
        Document document = documentRepository
                .findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));

        try {
            log.info("=== PROCESSING START: doc " + documentId + " ===");

            // STEP 1: Verify file exists
            String filePath = document.getFilePath();
            File file = filePath != null ? new File(filePath) : new File("");

            if (!file.exists()) {
                // Try alternate paths
                String filename = document.getFilename();
                String[] possiblePaths = {
                        "./uploads/" + filename,
                        "./data/uploads/" + filename,
                        System.getProperty("user.dir") + "/uploads/" + filename,
                        System.getProperty("user.dir") + "/data/uploads/" + filename,
                        "/tmp/uploads/" + filename
                };

                for (String path : possiblePaths) {
                    File f = new File(path);
                    if (f.exists()) {
                        file = f;
                        document.setFilePath(path);
                        log.info("Found file at: " + path);
                        break;
                    }
                }

                if (!file.exists()) {
                    throw new RuntimeException(
                            "File not found at any path. Original path: " + filePath
                    );
                }
            }

            log.info("File found: " + file.getAbsolutePath() + " size: " + file.length() + " bytes");

            // STEP 2: Extract text based on file type
            String fileType = document.getFileType() != null ? document.getFileType().toUpperCase() : "";
            String filename = document.getFilename() != null ? document.getFilename().toLowerCase() : "";

            // Normalize file type based on extension if needed
            if (fileType.contains("PDF") || filename.endsWith(".pdf")) {
                fileType = "PDF";
            } else if (fileType.contains("PPT") || filename.endsWith(".pptx") || filename.endsWith(".ppt")) {
                fileType = "PPTX";
            } else if (fileType.contains("DOC") || filename.endsWith(".docx") || filename.endsWith(".doc")) {
                fileType = "DOCX";
            }

            List<String> pageTexts = new ArrayList<>();

            if (fileType.equals("PDF")) {
                pageTexts = extractPdf(file);
            } else if (fileType.equals("PPTX") || fileType.equals("PPT")) {
                pageTexts = extractPpt(file);
            } else if (fileType.equals("DOCX") || fileType.equals("DOC")) {
                pageTexts = extractDocx(file);
            } else {
                throw new RuntimeException("Unsupported file type: " + fileType);
            }

            log.info("Extracted " + pageTexts.size() + " pages/slides");

            if (pageTexts.isEmpty()) {
                throw new RuntimeException("No text could be extracted from file");
            }

            // STEP 3: Save all pages to database
            // Delete existing pages first to avoid duplicates
            pageRepository.deleteByDocumentId(documentId);

            for (int i = 0; i < pageTexts.size(); i++) {
                Page page = new Page();
                page.setDocument(document);
                page.setPageNumber(i + 1);
                page.setOriginalText(pageTexts.get(i));
                pageRepository.save(page);
                log.info("Saved page " + (i + 1) + " to database");
            }

            // STEP 4: Mark as READY
            document.setStatus("READY");
            document.setTotalPages(pageTexts.size());
            document.setErrorMessage(null);
            documentRepository.save(document);

            log.info("=== PROCESSING COMPLETE: doc " + documentId + " — " + pageTexts.size() + " pages ===");

        } catch (Exception e) {
            log.error("=== PROCESSING FAILED: doc " + documentId + " ===");
            log.error("Error: " + e.getMessage());
            log.error("Stack trace: ", e);

            document.setStatus("FAILED");
            document.setErrorMessage(e.getMessage());
            documentRepository.save(document);
        }
    }

    private List<String> extractPdf(File file) throws Exception {
        List<String> pages = new ArrayList<>();

        try (PDDocument doc = Loader.loadPDF(file)) {
            int total = doc.getNumberOfPages();
            log.info("PDF page count: " + total);

            PDFTextStripper stripper = new PDFTextStripper();

            for (int i = 1; i <= total; i++) {
                stripper.setStartPage(i);
                stripper.setEndPage(i);
                String text = stripper.getText(doc).trim();

                if (text == null || text.isEmpty()) {
                    text = "Page " + i + " content could not be extracted.";
                }

                pages.add(text);
                log.info("PDF page " + i + " extracted: " + text.length() + " chars");
            }
        }

        return pages;
    }

    private List<String> extractPpt(File file) throws Exception {
        try {
            return extractPptx(file);
        } catch (org.apache.poi.openxml4j.exceptions.OLE2NotOfficeXmlFileException oleEx) {
            log.info("File is binary PPT (OLE2), extracting with HSLF: " + file.getName());
            return extractLegacyPpt(file);
        }
    }

    private List<String> extractPptx(File file) throws Exception {
        List<String> slides = new ArrayList<>();

        // Open via OPCPackage on File (RandomAccess/ZipFile) to avoid "Unsupported feature data descriptor" stream error
        try (OPCPackage pkg = OPCPackage.open(file, PackageAccess.READ);
             XMLSlideShow ppt = new XMLSlideShow(pkg)) {
            List<XSLFSlide> slideList = ppt.getSlides();
            log.info("PPTX slide count: " + slideList.size());

            for (int i = 0; i < slideList.size(); i++) {
                XSLFSlide slide = slideList.get(i);
                StringBuilder sb = new StringBuilder();

                // Get slide title first
                if (slide.getSlideLayout() != null) {
                    String layoutName = slide.getSlideLayout().getName();
                    if (layoutName != null) {
                        sb.append(layoutName).append(". ");
                    }
                }

                // Extract all text from all shapes (including tables and nested shapes)
                extractXslfShapes(slide.getShapes(), sb);

                String slideText = sb.toString().trim();

                if (slideText.isEmpty()) {
                    slideText = "Slide " + (i + 1) + " has no text content.";
                }

                slides.add(slideText);
                log.info("PPTX slide " + (i + 1) + " extracted: " + slideText.length() + " chars");
            }
        }

        return slides;
    }

    private void extractXslfShapes(List<XSLFShape> shapes, StringBuilder sb) {
        if (shapes == null) return;
        for (XSLFShape shape : shapes) {
            if (shape instanceof XSLFTextShape textShape) {
                String text = textShape.getText();
                if (text != null && !text.trim().isEmpty()) {
                    sb.append(text.trim()).append(" ");
                }
            } else if (shape instanceof XSLFTable table) {
                for (XSLFTableRow row : table.getRows()) {
                    for (XSLFTableCell cell : row.getCells()) {
                        String text = cell.getText();
                        if (text != null && !text.trim().isEmpty()) {
                            sb.append(text.trim()).append(" ");
                        }
                    }
                }
            } else if (shape instanceof XSLFGroupShape group) {
                extractXslfShapes(group.getShapes(), sb);
            }
        }
    }

    private List<String> extractLegacyPpt(File file) throws Exception {
        List<String> slides = new ArrayList<>();
        try (HSLFSlideShow ppt = new HSLFSlideShow(new org.apache.poi.poifs.filesystem.POIFSFileSystem(file))) {
            List<HSLFSlide> slideList = ppt.getSlides();
            log.info("Legacy PPT slide count: " + slideList.size());

            for (int i = 0; i < slideList.size(); i++) {
                HSLFSlide slide = slideList.get(i);
                StringBuilder sb = new StringBuilder();

                String title = slide.getTitle();
                if (title != null && !title.trim().isEmpty()) {
                    sb.append(title.trim()).append(". ");
                }

                extractHslfShapes(slide.getShapes(), sb);

                String slideText = sb.toString().trim();
                if (slideText.isEmpty()) {
                    slideText = "Slide " + (i + 1) + " has no text content.";
                }

                slides.add(slideText);
                log.info("Legacy PPT slide " + (i + 1) + " extracted: " + slideText.length() + " chars");
            }
        }
        return slides;
    }

    private void extractHslfShapes(List<HSLFShape> shapes, StringBuilder sb) {
        if (shapes == null) return;
        for (HSLFShape shape : shapes) {
            if (shape instanceof HSLFTextShape textShape) {
                String text = textShape.getText();
                if (text != null && !text.trim().isEmpty()) {
                    sb.append(text.trim()).append(" ");
                }
            } else if (shape instanceof HSLFTable table) {
                int rows = table.getNumberOfRows();
                int cols = table.getNumberOfColumns();
                for (int r = 0; r < rows; r++) {
                    for (int c = 0; c < cols; c++) {
                        HSLFTableCell cell = table.getCell(r, c);
                        if (cell != null) {
                            String text = cell.getText();
                            if (text != null && !text.trim().isEmpty()) {
                                sb.append(text.trim()).append(" ");
                            }
                        }
                    }
                }
            } else if (shape instanceof HSLFGroupShape group) {
                extractHslfShapes(group.getShapes(), sb);
            }
        }
    }

    private List<String> extractDocx(File file) throws Exception {
        List<String> pages = new ArrayList<>();
        // Open via OPCPackage on File (RandomAccess/ZipFile) to avoid stream data descriptor errors
        try (OPCPackage pkg = OPCPackage.open(file, PackageAccess.READ);
             XWPFDocument doc = new XWPFDocument(pkg)) {

            StringBuilder currentPage = new StringBuilder();
            int wordCount = 0;

            for (XWPFParagraph p : doc.getParagraphs()) {
                String text = p.getText();
                if (text != null && !text.trim().isEmpty()) {
                    currentPage.append(text.trim()).append("\n");
                    wordCount += text.split("\\s+").length;

                    if (wordCount >= 250) {
                        pages.add(currentPage.toString().trim());
                        currentPage = new StringBuilder();
                        wordCount = 0;
                    }
                }
            }

            if (currentPage.length() > 0) {
                pages.add(currentPage.toString().trim());
            }

            if (pages.isEmpty()) {
                pages.add("Document has no text content.");
            }
        }
        return pages;
    }
}
