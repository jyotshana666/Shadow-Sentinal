package com.shadowsentinel.backend.risk.service;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.policy.entity.Policy;
import com.shadowsentinel.backend.policy.repository.PolicyRepository;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import com.shadowsentinel.backend.risk.repository.RiskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Primary
public class MlRiskServiceImpl implements RiskService {

    private static final Logger log = LoggerFactory.getLogger(MlRiskServiceImpl.class);

    private final PolicyBasedRiskServiceImpl fallbackRiskService;
    private final RiskRepository riskRepository;
    private final PolicyRepository policyRepository;
    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MlRiskServiceImpl(
            PolicyBasedRiskServiceImpl fallbackRiskService,
            RiskRepository riskRepository,
            PolicyRepository policyRepository,
            @Value("${app.ml.service-url:http://localhost:5000}") String mlServiceUrl) {
        this.fallbackRiskService = fallbackRiskService;
        this.riskRepository = riskRepository;
        this.policyRepository = policyRepository;
        this.restTemplate = new RestTemplate();
        this.mlServiceUrl = mlServiceUrl;
    }

    @Override
    public RiskAssessment assessRisk(BrowserSession session, ClassificationResult classification) {
        try {
            Map<String, Object> requestPayload = new HashMap<>();

            Map<String, Object> sessionMap = new HashMap<>();
            if (session != null) {
                sessionMap.put("domain", session.getDomain());
                sessionMap.put("interactionCount", session.getInteractionCount());
                sessionMap.put("sseDetected", session.isSseDetected());
            }

            Map<String, Object> classificationMap = new HashMap<>();
            if (classification != null) {
                classificationMap.put("siteType", classification.getSiteType());
                classificationMap.put("generationActive", classification.isGenerationActive());
            }

            List<Map<String, Object>> policyMaps = new ArrayList<>();
            List<Policy> activePolicies = policyRepository.findByEnabled(true);
            for (Policy p : activePolicies) {
                Map<String, Object> pm = new HashMap<>();
                pm.put("name", p.getName());
                pm.put("domainPattern", p.getDomainPattern());
                pm.put("minRiskLevel", p.getMinRiskLevel());
                pm.put("action", p.getAction());
                pm.put("enabled", p.isEnabled());
                policyMaps.add(pm);
            }

            requestPayload.put("session", sessionMap);
            requestPayload.put("classification", classificationMap);
            requestPayload.put("policies", policyMaps);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

            Map<String, Object> response = restTemplate.postForObject(
                    mlServiceUrl + "/api/v1/ml/assess-risk",
                    entity,
                    Map.class
            );

            if (response != null && response.containsKey("riskLevel")) {
                RiskAssessment assessment = riskRepository.findByBrowserSessionSessionId(session.getSessionId())
                        .orElseGet(RiskAssessment::new);

                assessment.setBrowserSession(session);
                assessment.setRiskLevel((String) response.get("riskLevel"));
                
                List<String> reasons = (List<String>) response.get("reasons");
                assessment.setReasons(reasons != null ? reasons : List.of("ML Risk Evaluation"));

                return riskRepository.save(assessment);
            }
        } catch (Exception ex) {
            log.warn("ML Risk Microservice unavailable ({}), falling back to local policy risk engine", ex.getMessage());
        }

        // Graceful fallback to local Policy-based Risk engine
        return fallbackRiskService.assessRisk(session, classification);
    }
}
