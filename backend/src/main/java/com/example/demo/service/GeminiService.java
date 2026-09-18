package com.example.demo.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.ai.gemini-key-1:}")
    private String geminiKey1;

    @Value("${app.ai.gemini-key-2:}")
    private String geminiKey2;

    @Value("${app.ai.gemini-base-url:https://generativelanguage.googleapis.com}")
    private String geminiBaseUrl;

    @Value("${app.ai.gemini-model:gemini-3.6-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getEffectiveModel() {
        if (geminiModel == null || geminiModel.isBlank() || "gemini-2.0-flash".equalsIgnoreCase(geminiModel) || "gemini-pro".equalsIgnoreCase(geminiModel)) {
            // Google API deprecated gemini-pro and gemini-2.0-flash with 404 NOT_FOUND.
            // Automatically upgrade to active stable model gemini-3.6-flash.
            return "gemini-3.6-flash";
        }
        return geminiModel;
    }

    @PostConstruct
    public void validateKeys() {
        if (geminiKey1 == null || geminiKey1.isEmpty() || geminiKey1.equals("placeholder")) {
            log.error("GEMINI_KEY_1 is not configured!");
        } else {
            log.info("Gemini Key 1 loaded: " + geminiKey1.substring(0, Math.min(geminiKey1.length(), 8)) + "...");
        }
        if (geminiKey2 == null || geminiKey2.isEmpty() || geminiKey2.equals("placeholder")) {
            log.error("GEMINI_KEY_2 is not configured!");
        } else {
            log.info("Gemini Key 2 loaded: " + geminiKey2.substring(0, Math.min(geminiKey2.length(), 8)) + "...");
        }
    }

    public String generateSummary(String pageText) {
        // Check cache first
        // (summary already in DB — handled by caller)

        if (pageText == null || pageText.trim().isEmpty()) {
            return "No text available to summarize.";
        }

        // Trim text if too long (Gemini has token limits)
        String trimmedText = pageText.length() > 3000
                ? pageText.substring(0, 3000) + "..."
                : pageText;

        String prompt =
                "Summarize the following text in 3 to 4 " +
                "clear sentences. Write in plain English only. " +
                "Do not use any markdown, asterisks, bold, " +
                "headers, or special characters. " +
                "Do not start with the word Summary. " +
                "Just write a clean paragraph:\n\n" +
                trimmedText;

        String model = getEffectiveModel();
        String summaryUrl = 
                (geminiBaseUrl != null && !geminiBaseUrl.isEmpty() ? geminiBaseUrl : "https://generativelanguage.googleapis.com") +
                "/v1beta/models/" + model +
                ":generateContent?key=" + geminiKey2;

        String audioUrl = 
                (geminiBaseUrl != null && !geminiBaseUrl.isEmpty() ? geminiBaseUrl : "https://generativelanguage.googleapis.com") +
                "/v1beta/models/" + model +
                ":generateContent?key=" + geminiKey1;

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(
                Map.of("parts", List.of(
                        Map.of("text", prompt)
                ))
        ));
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.5);
        generationConfig.put("maxOutputTokens", 1024);
        generationConfig.put("thinkingConfig", Map.of("thinkingBudget", 0));
        body.put("generationConfig", generationConfig);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            summaryUrl, entity, Map.class);

            log.info("Gemini summary status: "
                    + response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.OK
                    && response.getBody() != null) {

                String text = extractText(response.getBody());
                if (text != null && !text.isEmpty()) {
                    log.info("Summary generated successfully: "
                            + text.length() + " chars");
                    return text;
                }
            }

            log.error("Gemini bad response: "
                    + response.getBody());
            return "Summary generation failed.";

        } catch (HttpClientErrorException e) {
            log.error("Gemini 404 error details:");
            log.error("URL used: " + summaryUrl);
            log.error("Status: " + e.getStatusCode());
            log.error("Body: " + e.getResponseBodyAsString());
            return "AI error: " + e.getStatusCode();

        } catch (Exception e) {
            log.warn("Gemini primary model failed: {}. Retrying with fallback model...", e.getMessage());
            // Retry with fallback active model (e.g. gemini-3.8-flash)
            try {
                String fallbackModel = model.equals("gemini-3.8-flash") ? "gemini-3.6-flash" : "gemini-3.8-flash";
                String fallbackUrl = (geminiBaseUrl != null && !geminiBaseUrl.isEmpty() ? geminiBaseUrl : "https://generativelanguage.googleapis.com")
                        + "/v1beta/models/" + fallbackModel + ":generateContent?key=" + geminiKey2;
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(fallbackUrl, entity, Map.class);
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    String text = extractText(response.getBody());
                    if (text != null && !text.isEmpty()) {
                        log.info("Summary generated successfully with fallback model: " + fallbackModel);
                        return text;
                    }
                }
            } catch (Exception ex) {
                log.error("Gemini fallback model also failed: " + ex.getMessage());
            }
            return "Summary unavailable. The AI service is currently experiencing high demand. Please try again in a moment.";
        }
    }

    private String callGemini(String systemPrompt, String userMessage, String apiKey) {
        String model = getEffectiveModel();
        List<String> modelsToTry = new ArrayList<>();
        modelsToTry.add(model);
        if (!modelsToTry.contains("gemini-3.8-flash")) modelsToTry.add("gemini-3.8-flash");
        if (!modelsToTry.contains("gemini-3.6-flash")) modelsToTry.add("gemini-3.6-flash");

        List<String> keysToTry = new ArrayList<>();
        if (apiKey != null && !apiKey.isBlank()) keysToTry.add(apiKey);
        if (geminiKey2 != null && !geminiKey2.isBlank() && !keysToTry.contains(geminiKey2)) keysToTry.add(geminiKey2);
        if (geminiKey1 != null && !geminiKey1.isBlank() && !keysToTry.contains(geminiKey1)) keysToTry.add(geminiKey1);

        String prompt = (systemPrompt != null && !systemPrompt.isBlank())
                ? systemPrompt + "\n\n" + userMessage
                : userMessage;

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 1024);
        generationConfig.put("thinkingConfig", Map.of("thinkingBudget", 0));
        body.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        String baseUrl = (geminiBaseUrl != null && !geminiBaseUrl.isEmpty()) ? geminiBaseUrl : "https://generativelanguage.googleapis.com";
        Exception lastException = null;

        for (String m : modelsToTry) {
            for (String key : keysToTry) {
                String url = baseUrl + "/v1beta/models/" + m + ":generateContent?key=" + key;
                try {
                    ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
                    if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                        String text = extractText(response.getBody());
                        if (text != null && !text.isEmpty()) {
                            log.info("Gemini call succeeded with model: " + m);
                            return text;
                        }
                    }
                } catch (org.springframework.web.client.HttpStatusCodeException e) {
                    lastException = e;
                    int code = e.getStatusCode().value();
                    log.warn("Gemini model {} returned HTTP {}. Trying fallback...", m, code);
                    if (code == 503 || code == 429) {
                        try { Thread.sleep(300); } catch (InterruptedException ignored) {}
                    }
                } catch (Exception e) {
                    lastException = e;
                    log.warn("Gemini model {} error: {}. Trying fallback...", m, e.getMessage());
                }
            }
        }

        if (lastException instanceof org.springframework.web.client.HttpStatusCodeException httpEx) {
            int code = httpEx.getStatusCode().value();
            if (code == 503 || code == 429) {
                return "The AI service is currently experiencing high demand on Google's servers. Please try again in a moment.";
            }
            return "AI error: " + httpEx.getStatusCode();
        }
        return "AI error: " + (lastException != null ? lastException.getMessage() : "Service unavailable");
    }

    private String extractText(Map<?, ?> respBody) {
        if (respBody == null) return null;
        Object candidatesObj = respBody.get("candidates");
        if (!(candidatesObj instanceof List<?> candidates) || candidates.isEmpty()) return null;
        Object candidateObj = candidates.get(0);
        if (!(candidateObj instanceof Map<?, ?> candidate)) return null;
        Object contentObj = candidate.get("content");
        if (!(contentObj instanceof Map<?, ?> content)) return null;
        Object partsObj = content.get("parts");
        if (!(partsObj instanceof List<?> parts) || parts.isEmpty()) return null;

        StringBuilder sb = new StringBuilder();
        for (Object p : parts) {
            if (p instanceof Map<?, ?> map && map.containsKey("text")) {
                Object text = map.get("text");
                if (text != null) {
                    sb.append(text);
                }
            }
        }
        return sb.length() > 0 ? sb.toString().trim() : null;
    }

    public String generateAudio(String text, String languageCode, String voiceType) {
        try {
            if (text != null && text.length() > 200) {
                text = text.substring(0, 197) + "...";
            }
            String encodedText = java.net.URLEncoder.encode(text, "UTF-8").replace("+", "%20");
            return "http://localhost:8080/api/reader/audio?lang=" + languageCode + "&text=" + encodedText;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String summarize(String text, String depth) {
        return generateSummary(text);
    }

    public String translate(String text, String targetLanguageCode) {
        String systemPrompt = "You are a professional translator. Translate the given text accurately into the language code: " + targetLanguageCode + ". Return ONLY the translated text.";
        return callGemini(systemPrompt, text, geminiKey2);
    }

    public String answerQuestion(String context, String question, List<Map<String, String>> history) {
        String systemPrompt = "You are a helpful AI assistant for DocVoice, a document reading application. The user is currently reading a document. Use the provided page content as context to answer questions. If the question is a general doubt or concept question not directly in the document, still answer it helpfully using your general knowledge. Always be clear, concise and friendly.\n\nDocument Context: " + context;

        StringBuilder historyText = new StringBuilder();
        if (history != null) {
            for (Map<String, String> msg : history) {
                historyText.append(msg.get("role")).append(": ").append(msg.get("content")).append("\n");
            }
        }
        String userMessage = historyText.toString() + "\nuser: " + question;
        return callGemini(systemPrompt, userMessage, geminiKey2);
    }

    public String generateEmail(String documentText) {
        String systemPrompt = "You are a professional assistant. Given the following document text, draft a concise and professional email summarizing the main points for a team.";
        return callGemini(systemPrompt, documentText, geminiKey2);
    }

    public String generateReport(String documentText) {
        String systemPrompt = "You are a professional analyst. Given the following document text, generate a structured, executive summary report with bullet points.";
        return callGemini(systemPrompt, documentText, geminiKey2);
    }

    public String extractMeetingNotes(String documentText) {
        String systemPrompt = "You are a meeting assistant. Given the following document text (which may be a transcript or notes), extract the key meeting notes, action items, and decisions made.";
        return callGemini(systemPrompt, documentText, geminiKey2);
    }
}
