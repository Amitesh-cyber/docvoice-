package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Value("${app.ai.gemini-key-2:}")
    private String geminiKey2;

    @Value("${app.ai.gemini-model:gemini-3.6-flash}")
    private String geminiModel;

    @Value("${app.ai.gemini-base-url:https://generativelanguage.googleapis.com}")
    private String geminiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getEffectiveModel() {
        if (geminiModel == null || geminiModel.isBlank() || "gemini-2.0-flash".equalsIgnoreCase(geminiModel) || "gemini-pro".equalsIgnoreCase(geminiModel)) {
            return "gemini-3.6-flash";
        }
        return geminiModel;
    }

    private final com.example.demo.service.GeminiService geminiService;

    public TestController(com.example.demo.service.GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/gemini")
    public ResponseEntity<String> testGemini() {
        String model = getEffectiveModel();
        String baseUrl = (geminiBaseUrl != null && !geminiBaseUrl.isBlank()) ? geminiBaseUrl : "https://generativelanguage.googleapis.com";
        String url = baseUrl + "/v1beta/models/" + model + ":generateContent?key=" + geminiKey2;

        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", "Say hello in one sentence")
                ))
            )
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            return ResponseEntity.ok("SUCCESS: " + response.getBody());
        } catch (Exception e) {
            return ResponseEntity.ok("FAILED: " + e.getMessage());
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<String> testSummary() {
        String sampleText = "Artificial intelligence and deep learning have revolutionized modern document processing. By transforming text into synthetic speech and generating concise summaries, modern tools empower users to absorb large amounts of textual knowledge in a fraction of the usual time. This enhances accessibility and productivity for learners worldwide.";
        String summary = geminiService.generateSummary(sampleText);
        return ResponseEntity.ok("GENERATED_SUMMARY: " + summary);
    }

    @GetMapping("/ask")
    public ResponseEntity<String> testAsk() {
        String context = "Environmental pollution is the contamination of the physical and biological components of the earth/atmosphere system to such an extent that normal environmental processes are adversely affected.";
        String answer = geminiService.answerQuestion(context, "What is environmental pollution?", null);
        return ResponseEntity.ok("ANSWER: " + answer);
    }
}

