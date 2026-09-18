package com.example.demo.controller;

import com.example.demo.domain.Page;
import com.example.demo.domain.Translation;
import com.example.demo.repository.PageRepository;
import com.example.demo.repository.TranslationRepository;
import com.example.demo.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reader")
@CrossOrigin(origins = "*")
public class ReaderController {

    private final PageRepository pageRepository;
    private final TranslationRepository translationRepository;
    private final GeminiService geminiService;

    public ReaderController(PageRepository pageRepository, TranslationRepository translationRepository, GeminiService geminiService) {
        this.pageRepository = pageRepository;
        this.translationRepository = translationRepository;
        this.geminiService = geminiService;
    }

    @GetMapping("/document/{documentId}/pages")
    public ResponseEntity<?> getPages(@PathVariable Long documentId) {
        List<Page> pages = pageRepository.findByDocumentIdOrderByPageNumberAsc(documentId);
        return ResponseEntity.ok(pages);
    }

    @PostMapping("/page/{pageId}/summary")
    public ResponseEntity<?> generatePageSummary(@PathVariable Long pageId) {
        Page page = pageRepository.findById(pageId).orElseThrow();
        if (page.getSummaryText() == null || page.getSummaryText().trim().isEmpty() || page.getSummaryText().startsWith("AI error")) {
            String summary = geminiService.generateSummary(page.getOriginalText());
            page.setSummaryText(summary);
            page.setSummaryCachedAt(java.time.LocalDateTime.now());
            page = pageRepository.save(page);
        }
        return ResponseEntity.ok(Map.of("summary", page.getSummaryText()));
    }

    @PostMapping("/page/{pageId}/translate")
    public ResponseEntity<?> translateAndTtsPage(@PathVariable Long pageId, @RequestBody Map<String, String> request) {
        String languageCode = request.get("languageCode");
        String useSummaryStr = request.get("useSummary");
        boolean useSummary = Boolean.parseBoolean(useSummaryStr);

        Page page = pageRepository.findById(pageId).orElseThrow();
        
        // Return existing translation if present
        Translation existing = translationRepository.findByPageIdAndLanguageCode(pageId, languageCode).orElse(null);
        if (existing != null && existing.getAudioUrl() != null && !existing.getAudioUrl().startsWith("http://localhost")) {
            return ResponseEntity.ok(existing);
        }

        String textToProcess = useSummary ? page.getSummaryText() : page.getOriginalText();
        String translatedText = geminiService.translate(textToProcess, languageCode);
        
        Translation translation = existing != null ? existing : new Translation();
        translation.setPage(page);
        translation.setLanguageCode(languageCode);
        translation.setTranslatedText(translatedText);
        translation.setTranslatedCachedAt(java.time.LocalDateTime.now());
        
        translation = translationRepository.save(translation);
        
        try {
            // Generate audio bytes using Google Translate TTS proxy
            org.springframework.web.util.UriComponentsBuilder builder = org.springframework.web.util.UriComponentsBuilder.fromUriString("https://translate.googleapis.com/translate_tts")
                .queryParam("client", "gtx")
                .queryParam("ie", "UTF-8")
                .queryParam("tl", languageCode)
                .queryParam("q", translatedText.length() > 200 ? translatedText.substring(0, 197) + "..." : translatedText);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            byte[] audioBytes = restTemplate.getForObject(builder.build().toUri(), byte[].class);
            
            // Save to local directory
            java.io.File audioDir = new java.io.File("data/audio");
            if (!audioDir.exists()) audioDir.mkdirs();
            
            String filename = "audio_" + translation.getId() + ".mp3";
            java.nio.file.Files.write(java.nio.file.Paths.get(audioDir.getAbsolutePath(), filename), audioBytes);
            
            String localAudioUrl = "/api/reader/stream-audio/" + translation.getId();
            translation.setAudioUrl(localAudioUrl);
            translation.setAudioCachedAt(java.time.LocalDateTime.now());
            translationRepository.save(translation);
            
        } catch (Exception e) {
            e.printStackTrace();
            translation.setAudioUrl(null);
        }

        return ResponseEntity.ok(translation);
    }

    @GetMapping("/stream-audio/{translationId}")
    public ResponseEntity<org.springframework.core.io.Resource> streamAudio(@PathVariable Long translationId) {
        try {
            java.io.File file = new java.io.File("data/audio/audio_" + translationId + ".mp3");
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(file);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.valueOf("audio/mpeg"));
            return new ResponseEntity<>(resource, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/document/{documentId}/qa")
    public ResponseEntity<?> askQuestion(@PathVariable Long documentId, @RequestBody Map<String, Object> request) {
        String question = (String) request.get("question");
        List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");
        
        List<Page> pages = pageRepository.findByDocumentIdOrderByPageNumberAsc(documentId);
        StringBuilder fullContext = new StringBuilder();
        for (Page p : pages) {
            fullContext.append(p.getOriginalText()).append("\n\n");
        }
        
        // Truncate context if it gets too large for API limits, roughly 50,000 chars is safe
        String contextText = fullContext.toString();
        if (contextText.length() > 50000) {
            contextText = contextText.substring(0, 50000) + "... [Context Truncated]";
        }
        
        String answer = geminiService.answerQuestion(contextText, question, history);
        return ResponseEntity.ok(Map.of("answer", answer));
    }


    @GetMapping("/audio")
    public ResponseEntity<byte[]> getProxyAudio(@RequestParam String text, @RequestParam String lang) {
        try {
            org.springframework.web.util.UriComponentsBuilder builder = org.springframework.web.util.UriComponentsBuilder.fromUriString("https://translate.googleapis.com/translate_tts")
                .queryParam("client", "gtx")
                .queryParam("ie", "UTF-8")
                .queryParam("tl", lang)
                .queryParam("q", text);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            byte[] audio = restTemplate.getForObject(builder.build().toUri(), byte[].class);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.valueOf("audio/mpeg"));
            return new ResponseEntity<>(audio, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/test/gemini")
    public ResponseEntity<?> testGemini() {
        String answer = geminiService.answerQuestion("This is a simple test.", "Say hello", null);
        return ResponseEntity.ok(Map.of("response", answer));
    }
}
