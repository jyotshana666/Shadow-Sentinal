package com.shadowsentinel.backend.alert.service;

import com.shadowsentinel.backend.alert.dto.AlertDto;
import com.shadowsentinel.backend.alert.entity.Alert;
import com.shadowsentinel.backend.alert.repository.AlertRepository;
import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.common.exception.ResourceNotFoundException;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import com.shadowsentinel.backend.user.entity.User;
import com.shadowsentinel.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    public AlertService(AlertRepository alertRepository, UserRepository userRepository) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void processRiskAndGenerateAlert(BrowserSession session, RiskAssessment risk) {
        if (!"HIGH".equals(risk.getRiskLevel()) && !"CRITICAL".equals(risk.getRiskLevel())) {
            return; // Only generate alerts for HIGH or CRITICAL risk
        }

        // Duplicate prevention: check if alert already created for this session & risk level
        if (alertRepository.existsByBrowserSessionSessionIdAndRiskLevel(session.getSessionId(), risk.getRiskLevel())) {
            return;
        }

        User user = userRepository.findById(session.getUserId()).orElse(null);
        if (user == null) {
            return;
        }

        String reason = String.join("; ", risk.getReasons());
        Alert alert = new Alert(user, session, risk.getRiskLevel(), reason);
        alertRepository.save(alert);
    }

    public List<AlertDto> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AlertDto> getAlertsForUser(UUID userId) {
        return alertRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertDto updateAlertStatus(UUID alertId, String newStatus) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + alertId));

        alert.setStatus(newStatus.toUpperCase());
        if ("RESOLVED".equalsIgnoreCase(newStatus)) {
            alert.setResolvedAt(Instant.now());
        }

        Alert updated = alertRepository.save(alert);
        return mapToDto(updated);
    }

    private AlertDto mapToDto(Alert alert) {
        return new AlertDto(
                alert.getId(),
                alert.getUser().getId(),
                alert.getUser().getEmail(),
                alert.getBrowserSession().getSessionId(),
                alert.getBrowserSession().getDomain(),
                alert.getRiskLevel(),
                alert.getReason(),
                alert.getStatus(),
                alert.getCreatedAt(),
                alert.getResolvedAt()
        );
    }
}
