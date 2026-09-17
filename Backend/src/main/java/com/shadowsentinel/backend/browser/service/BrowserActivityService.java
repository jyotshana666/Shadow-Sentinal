package com.shadowsentinel.backend.browser.service;

import com.shadowsentinel.backend.alert.service.AlertService;
import com.shadowsentinel.backend.audit.service.AuditLogService;
import com.shadowsentinel.backend.browser.dto.BatchIngestionRequestDto;
import com.shadowsentinel.backend.browser.dto.BatchIngestionResponseDto;
import com.shadowsentinel.backend.browser.dto.BrowserSessionIngestionDto;
import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.browser.entity.ClassificationEvidence;
import com.shadowsentinel.backend.browser.repository.BrowserSessionRepository;
import com.shadowsentinel.backend.browser.repository.ClassificationEvidenceRepository;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.classification.service.ClassificationService;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import com.shadowsentinel.backend.risk.service.RiskService;
import com.shadowsentinel.backend.user.entity.User;
import com.shadowsentinel.backend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BrowserActivityService {

    private static final Logger log = LoggerFactory.getLogger(BrowserActivityService.class);

    private final BrowserSessionRepository sessionRepository;
    private final ClassificationEvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final ClassificationService classificationService;
    private final RiskService riskService;
    private final AlertService alertService;
    private final AuditLogService auditLogService;

    public BrowserActivityService(BrowserSessionRepository sessionRepository,
                                  ClassificationEvidenceRepository evidenceRepository,
                                  UserRepository userRepository,
                                  ClassificationService classificationService,
                                  RiskService riskService,
                                  AlertService alertService,
                                  AuditLogService auditLogService) {
        this.sessionRepository = sessionRepository;
        this.evidenceRepository = evidenceRepository;
        this.userRepository = userRepository;
        this.classificationService = classificationService;
        this.riskService = riskService;
        this.alertService = alertService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public BatchIngestionResponseDto processBatchIngestion(BatchIngestionRequestDto batchRequest, UUID authenticatedUserId, String authenticatedOrgId) {
        int syncedCount = 0;

        for (BrowserSessionIngestionDto dto : batchRequest.getSessions()) {
            try {
                // 1. Persist or update BrowserSession
                BrowserSession session = sessionRepository.findById(dto.getSessionId())
                        .orElseGet(BrowserSession::new);

                session.setSessionId(dto.getSessionId());
                session.setUserId(authenticatedUserId); // Always enforce authenticated principal ownership!
                
                String authoritativeOrgId = authenticatedOrgId;
                if (authoritativeOrgId == null || authoritativeOrgId.isBlank()) {
                    authoritativeOrgId = userRepository.findById(authenticatedUserId)
                            .map(User::getOrgId)
                            .orElse("DEFAULT_ORG");
                }
                session.setOrgId(authoritativeOrgId);
                session.setDomain(dto.getDomain());
                session.setStartTime(parseInstant(dto.getStartTime()));
                session.setEndTime(parseInstant(dto.getEndTime()));
                session.setDuration(dto.getDuration());
                session.setVisitCount(dto.getVisitCount());
                session.setRequestCount(dto.getRequestCount());
                session.setRequestFrequency(dto.getRequestFrequency());
                session.setRapidRequestBurst(dto.isRapidRequestBurst());
                session.setSseDetected(dto.isSseDetected());
                session.setTotalSseEvents(dto.getTotalSseEvents());
                session.setInteractionCount(dto.getInteractionCount());
                session.setPeakRequestWindow(dto.getPeakRequestWindow());
                session.setSessionEngagement(dto.getSessionEngagement());
                session.setSiteType(dto.getSite_type());
                session.setAiCapability(dto.getAi_capability());
                session.setGenerationActive(dto.isGeneration_active());
                session.setSiteCategory(dto.getSite_category());

                BrowserSession savedSession = sessionRepository.save(session);

                // 2. Persist ClassificationEvidence
                ClassificationEvidence evidence = evidenceRepository.findByBrowserSessionSessionId(savedSession.getSessionId())
                        .orElseGet(ClassificationEvidence::new);

                evidence.setBrowserSession(savedSession);
                evidence.setHasChatInput(dto.isHasChatInput());
                evidence.setHasStreamingDiv(dto.isHasStreamingDiv());
                evidence.setHasAiTermsInTitle(dto.isHasAiTermsInTitle());
                evidence.setHasAiTermsInMeta(dto.isHasAiTermsInMeta());
                evidence.setDetectedAiClasses(dto.getDetectedAiClasses());
                evidence.setFormInteractionRate(dto.getFormInteractionRate());
                evidence.setAiConfidenceScore(dto.getAiConfidenceScore());

                evidence.setDomain(dto.getDomain());
                evidence.setRequestCount(dto.getRequestCount());
                evidence.setRequestFrequency(dto.getRequestFrequency());
                evidence.setRapidRequestBurst(dto.isRapidRequestBurst());
                evidence.setSseDetected(dto.isSseDetected());
                evidence.setTotalSseEvents(dto.getTotalSseEvents());
                evidence.setInteractionCount(dto.getInteractionCount());

                ClassificationEvidence savedEvidence = evidenceRepository.save(evidence);

                // 3. Invoke Classification Boundary
                ClassificationResult classification = classificationService.classify(savedSession, savedEvidence);

                // 4. Invoke Risk Boundary
                RiskAssessment risk = riskService.assessRisk(savedSession, classification);

                // 5. Process Alerts
                alertService.processRiskAndGenerateAlert(savedSession, risk);

                syncedCount++;
            } catch (Exception ex) {
                log.error("Failed to process session ingestion for sessionId: {}", dto.getSessionId(), ex);
            }
        }

        auditLogService.logEvent(
                authenticatedUserId.toString(),
                "BATCH_SESSION_INGESTION",
                "BrowserSession",
                "Synced " + syncedCount + " sessions out of " + batchRequest.getSessions().size()
        );

        return new BatchIngestionResponseDto(syncedCount);
    }

    public List<BrowserSession> getSessionsForUser(UUID userId) {
        return sessionRepository.findByUserId(userId);
    }

    public List<BrowserSession> getAllSessions() {
        return sessionRepository.findAll();
    }

    private Instant parseInstant(String timestamp) {
        if (timestamp == null || timestamp.isBlank()) {
            return Instant.now();
        }
        try {
            return Instant.parse(timestamp);
        } catch (Exception ex) {
            return Instant.now();
        }
    }
}
