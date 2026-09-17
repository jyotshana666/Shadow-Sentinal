package com.shadowsentinel.backend.risk;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.policy.entity.Policy;
import com.shadowsentinel.backend.policy.repository.PolicyRepository;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import com.shadowsentinel.backend.risk.repository.RiskRepository;
import com.shadowsentinel.backend.risk.service.PolicyBasedRiskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PolicyBasedRiskServiceTest {

    @Mock
    private RiskRepository riskRepository;

    @Mock
    private PolicyRepository policyRepository;

    private PolicyBasedRiskServiceImpl riskService;

    @BeforeEach
    void setUp() {
        riskService = new PolicyBasedRiskServiceImpl(riskRepository, policyRepository);
    }

    @Test
    void assessRisk_AiWebsiteWithActiveGeneration_ReturnsHighRisk() {
        BrowserSession session = new BrowserSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setDomain("chat.openai.com");
        session.setInteractionCount(20);

        ClassificationResult classification = new ClassificationResult();
        classification.setSiteType("ai_website");
        classification.setGenerationActive(true);

        when(riskRepository.findByBrowserSessionSessionId(session.getSessionId())).thenReturn(Optional.empty());
        when(policyRepository.findByEnabled(true)).thenReturn(List.of());
        when(riskRepository.save(any(RiskAssessment.class))).thenAnswer(i -> i.getArgument(0));

        RiskAssessment result = riskService.assessRisk(session, classification);

        assertNotNull(result);
        assertEquals("HIGH", result.getRiskLevel());
        assertTrue(result.getReasons().size() >= 2);
    }

    @Test
    void assessRisk_MatchesCustomPolicy_EscalatesRiskLevel() {
        BrowserSession session = new BrowserSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setDomain("restricted-ai.com");

        ClassificationResult classification = new ClassificationResult();
        classification.setSiteType("non_ai_website");
        classification.setGenerationActive(false);

        Policy customPolicy = new Policy("Block Restricted AI", "Custom Rule", "restricted-ai.com", "CRITICAL", "BLOCK", true);

        when(riskRepository.findByBrowserSessionSessionId(session.getSessionId())).thenReturn(Optional.empty());
        when(policyRepository.findByEnabled(true)).thenReturn(List.of(customPolicy));
        when(riskRepository.save(any(RiskAssessment.class))).thenAnswer(i -> i.getArgument(0));

        RiskAssessment result = riskService.assessRisk(session, classification);

        assertNotNull(result);
        assertEquals("CRITICAL", result.getRiskLevel());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("Block Restricted AI")));
    }
}
