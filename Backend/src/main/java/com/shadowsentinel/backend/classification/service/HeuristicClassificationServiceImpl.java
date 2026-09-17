package com.shadowsentinel.backend.classification.service;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.browser.entity.ClassificationEvidence;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.classification.repository.ClassificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class HeuristicClassificationServiceImpl implements ClassificationService {

    private static final Set<String> KNOWN_AI_DOMAINS = Set.of(
            "chat.openai.com", "chatgpt.com", "claude.ai", "gemini.google.com",
            "copilot.microsoft.com", "bard.google.com", "huggingface.co", "poe.com",
            "perplexity.ai", "character.ai", "you.com", "mistral.ai", "groq.com"
    );

    private final ClassificationRepository classificationRepository;

    public HeuristicClassificationServiceImpl(ClassificationRepository classificationRepository) {
        this.classificationRepository = classificationRepository;
    }

    @Override
    @Transactional
    public ClassificationResult classify(BrowserSession session, ClassificationEvidence evidence) {
        ClassificationResult result = classificationRepository.findByBrowserSessionSessionId(session.getSessionId())
                .orElseGet(ClassificationResult::new);

        result.setBrowserSession(session);

        String domain = session.getDomain();
        boolean isKnownAi = KNOWN_AI_DOMAINS.contains(domain.toLowerCase());

        String siteType;
        if (isKnownAi) {
            siteType = "ai_website";
        } else if (evidence != null && evidence.getAiConfidenceScore() >= 50) {
            siteType = "ai_capable_website";
        } else if (evidence != null && evidence.getAiConfidenceScore() < 20) {
            siteType = "non_ai_website";
        } else {
            siteType = "monitored_website";
        }

        String aiCapability = (siteType.equals("ai_website") || siteType.equals("ai_capable_website"))
                ? "ai_capable" : "non_ai_capable";

        boolean generationActive = false;
        if (evidence != null) {
            generationActive = evidence.isSseDetected() || evidence.isRapidRequestBurst() || evidence.getInteractionCount() > 10;
        }

        String siteCategory = isKnownAi ? "ai_tool" : (session.getSiteCategory() != null ? session.getSiteCategory() : "unknown");

        double confidence = evidence != null ? evidence.getAiConfidenceScore() : (isKnownAi ? 95.0 : 10.0);

        result.setSiteType(siteType);
        result.setAiCapability(aiCapability);
        result.setGenerationActive(generationActive);
        result.setSiteCategory(siteCategory);
        result.setConfidenceScore(confidence);
        result.setClassifiedBy("HEURISTIC_RULE_ENGINE");

        return classificationRepository.save(result);
    }
}
