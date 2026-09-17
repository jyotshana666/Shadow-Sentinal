package com.shadowsentinel.backend.alert;

import com.shadowsentinel.backend.alert.entity.Alert;
import com.shadowsentinel.backend.alert.repository.AlertRepository;
import com.shadowsentinel.backend.alert.service.AlertService;
import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import com.shadowsentinel.backend.user.entity.User;
import com.shadowsentinel.backend.user.repository.UserRepository;
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
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private UserRepository userRepository;

    private AlertService alertService;

    @BeforeEach
    void setUp() {
        alertService = new AlertService(alertRepository, userRepository);
    }

    @Test
    void processRisk_HighRiskSession_CreatesAlert() {
        UUID userId = UUID.randomUUID();
        String sessionId = UUID.randomUUID().toString();

        BrowserSession session = new BrowserSession();
        session.setSessionId(sessionId);
        session.setUserId(userId);
        session.setDomain("chatgpt.com");

        RiskAssessment risk = new RiskAssessment();
        risk.setRiskLevel("HIGH");
        risk.setReasons(List.of("Unapproved AI usage"));

        User user = new User("user@example.com", "pass", "USER", "ORG1");
        user.setId(userId);

        when(alertRepository.existsByBrowserSessionSessionIdAndRiskLevel(sessionId, "HIGH")).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        alertService.processRiskAndGenerateAlert(session, risk);

        verify(alertRepository, times(1)).save(any(Alert.class));
    }

    @Test
    void processRisk_LowRiskSession_DoesNotCreateAlert() {
        BrowserSession session = new BrowserSession();
        session.setSessionId("sess-1");

        RiskAssessment risk = new RiskAssessment();
        risk.setRiskLevel("LOW");

        alertService.processRiskAndGenerateAlert(session, risk);

        verify(alertRepository, never()).save(any());
    }

    @Test
    void processRisk_DuplicateAlert_DoesNotCreateAlert() {
        String sessionId = "sess-duplicate";

        BrowserSession session = new BrowserSession();
        session.setSessionId(sessionId);

        RiskAssessment risk = new RiskAssessment();
        risk.setRiskLevel("HIGH");

        when(alertRepository.existsByBrowserSessionSessionIdAndRiskLevel(sessionId, "HIGH")).thenReturn(true);

        alertService.processRiskAndGenerateAlert(session, risk);

        verify(alertRepository, never()).save(any());
    }
}
