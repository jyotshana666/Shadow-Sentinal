package com.shadowsentinel.backend.risk.service;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.policy.entity.Policy;
import com.shadowsentinel.backend.policy.repository.PolicyRepository;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import com.shadowsentinel.backend.risk.repository.RiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PolicyBasedRiskServiceImpl implements RiskService {

    private final RiskRepository riskRepository;
    private final PolicyRepository policyRepository;

    public PolicyBasedRiskServiceImpl(RiskRepository riskRepository, PolicyRepository policyRepository) {
        this.riskRepository = riskRepository;
        this.policyRepository = policyRepository;
    }

    @Override
    @Transactional
    public RiskAssessment assessRisk(BrowserSession session, ClassificationResult classification) {
        RiskAssessment assessment = riskRepository.findByBrowserSessionSessionId(session.getSessionId())
                .orElseGet(RiskAssessment::new);

        assessment.setBrowserSession(session);

        List<String> reasons = new ArrayList<>();
        String riskLevel = "LOW";

        if (classification != null && "ai_website".equals(classification.getSiteType())) {
            riskLevel = "MEDIUM";
            reasons.add("Visited known AI domain: " + session.getDomain());
        }

        if (classification != null && classification.isGenerationActive()) {
            riskLevel = "HIGH";
            reasons.add("Active AI content generation / SSE stream detected");
        }

        if (session.getInteractionCount() > 15) {
            riskLevel = "HIGH";
            reasons.add("High volume user interaction with AI interface (" + session.getInteractionCount() + " interactions)");
        }

        // Evaluate custom policy rules
        List<Policy> activePolicies = policyRepository.findByEnabled(true);
        for (Policy policy : activePolicies) {
            if (matchesDomain(session.getDomain(), policy.getDomainPattern())) {
                reasons.add("Triggered policy '" + policy.getName() + "' (Action: " + policy.getAction() + ")");
                if (isHigherRisk(policy.getMinRiskLevel(), riskLevel)) {
                    riskLevel = policy.getMinRiskLevel();
                }
            }
        }

        if (reasons.isEmpty()) {
            reasons.add("Standard web session telemetry; no governance policy violations.");
        }

        assessment.setRiskLevel(riskLevel);
        assessment.setReasons(reasons);

        return riskRepository.save(assessment);
    }

    private boolean matchesDomain(String domain, String pattern) {
        if (pattern.equals("*")) return true;
        String regex = pattern.replace(".", "\\.").replace("*", ".*");
        return domain.matches("(?i)" + regex);
    }

    private boolean isHigherRisk(String candidate, String current) {
        int candidateRank = getRiskRank(candidate);
        int currentRank = getRiskRank(current);
        return candidateRank > currentRank;
    }

    private int getRiskRank(String risk) {
        return switch (risk.toUpperCase()) {
            case "CRITICAL" -> 4;
            case "HIGH" -> 3;
            case "MEDIUM" -> 2;
            case "LOW" -> 1;
            default -> 0;
        };
    }
}
