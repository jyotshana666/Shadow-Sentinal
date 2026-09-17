package com.shadowsentinel.backend.risk.entity;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "risk_assessments", indexes = {
    @Index(name = "idx_risk_session_id", columnList = "session_id"),
    @Index(name = "idx_risk_level", columnList = "risk_level")
})
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private BrowserSession browserSession;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @ElementCollection
    @CollectionTable(name = "risk_assessment_reasons", joinColumns = @JoinColumn(name = "risk_id"))
    @Column(name = "reason")
    private List<String> reasons;

    @Column(name = "evaluated_at", nullable = false, updatable = false)
    private Instant evaluatedAt;

    public RiskAssessment() {}

    @PrePersist
    protected void onCreate() {
        if (evaluatedAt == null) evaluatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public BrowserSession getBrowserSession() {
        return browserSession;
    }

    public void setBrowserSession(BrowserSession browserSession) {
        this.browserSession = browserSession;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public Instant getEvaluatedAt() {
        return evaluatedAt;
    }

    public void setEvaluatedAt(Instant evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }
}
