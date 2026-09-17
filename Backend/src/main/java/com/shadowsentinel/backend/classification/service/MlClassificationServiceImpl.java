package com.shadowsentinel.backend.classification.service;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.browser.entity.ClassificationEvidence;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.classification.repository.ClassificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Primary
public class MlClassificationServiceImpl implements ClassificationService {

    private static final Logger log = LoggerFactory.getLogger(MlClassificationServiceImpl.class);

    private final HeuristicClassificationServiceImpl fallbackClassifier;
    private final ClassificationRepository classificationRepository;
    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MlClassificationServiceImpl(
            HeuristicClassificationServiceImpl fallbackClassifier,
            ClassificationRepository classificationRepository,
            @Value("${app.ml.service-url:http://localhost:5000}") String mlServiceUrl) {
        this.fallbackClassifier = fallbackClassifier;
        this.classificationRepository = classificationRepository;
        this.restTemplate = new RestTemplate();
        this.mlServiceUrl = mlServiceUrl;
    }

    @Override
    public ClassificationResult classify(BrowserSession session, ClassificationEvidence evidence) {
        try {
            Map<String, Object> requestPayload = new HashMap<>();

            Map<String, Object> evidenceMap = new HashMap<>();
            if (evidence != null) {
                evidenceMap.put("domain", evidence.getDomain());
                evidenceMap.put("hasChatInput", evidence.isHasChatInput());
                evidenceMap.put("hasStreamingDiv", evidence.isHasStreamingDiv());
                evidenceMap.put("hasAiTermsInTitle", evidence.isHasAiTermsInTitle());
                evidenceMap.put("hasAiTermsInMeta", evidence.isHasAiTermsInMeta());
                evidenceMap.put("detectedAiClasses", evidence.getDetectedAiClasses());
                evidenceMap.put("formInteractionRate", evidence.getFormInteractionRate());
                evidenceMap.put("aiConfidenceScore", evidence.getAiConfidenceScore());
                evidenceMap.put("requestCount", evidence.getRequestCount());
                evidenceMap.put("requestFrequency", evidence.getRequestFrequency());
                evidenceMap.put("rapidRequestBurst", evidence.isRapidRequestBurst());
                evidenceMap.put("sseDetected", evidence.isSseDetected());
                evidenceMap.put("totalSseEvents", evidence.getTotalSseEvents());
                evidenceMap.put("interactionCount", evidence.getInteractionCount());
            }

            Map<String, Object> sessionMap = new HashMap<>();
            if (session != null) {
                sessionMap.put("domain", session.getDomain());
                sessionMap.put("requestCount", session.getRequestCount());
                sessionMap.put("interactionCount", session.getInteractionCount());
                sessionMap.put("siteCategory", session.getSiteCategory());
            }

            requestPayload.put("evidence", evidenceMap);
            requestPayload.put("session", sessionMap);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

            Map<String, Object> response = restTemplate.postForObject(
                    mlServiceUrl + "/api/v1/ml/classify",
                    entity,
                    Map.class
            );

            if (response != null && response.containsKey("siteType")) {
                ClassificationResult result = classificationRepository.findByBrowserSessionSessionId(session.getSessionId())
                        .orElseGet(ClassificationResult::new);

                result.setBrowserSession(session);
                result.setSiteType((String) response.get("siteType"));
                result.setAiCapability((String) response.get("aiCapability"));
                result.setGenerationActive(Boolean.TRUE.equals(response.get("generationActive")));
                result.setSiteCategory((String) response.get("siteCategory"));
                result.setConfidenceScore(response.get("confidenceScore") != null ? ((Number) response.get("confidenceScore")).doubleValue() : 50.0);
                result.setClassifiedBy((String) response.getOrDefault("classifiedBy", "ML_HYBRID_MICROSERVICE"));

                return classificationRepository.save(result);
            }
        } catch (Exception ex) {
            log.warn("ML Classification Microservice unavailable ({}), falling back to local baseline heuristic classifier", ex.getMessage());
        }

        // Graceful fallback to local heuristic classifier
        return fallbackClassifier.classify(session, evidence);
    }
}
