package com.shadowsentinel.backend.alert.entity;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alerts", indexes = {
    @Index(name = "idx_alert_status", columnList = "status"),
    @Index(name = "idx_alert_user_id", columnList = "user_id"),
    @Index(name = "idx_alert_session_id", columnList = "session_id")
})
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private BrowserSession browserSession;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel; // HIGH, CRITICAL

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private String status; // OPEN, ACKNOWLEDGED, RESOLVED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public Alert() {}

    public Alert(User user, BrowserSession browserSession, String riskLevel, String reason) {
        this.user = user;
        this.browserSession = browserSession;
        this.riskLevel = riskLevel;
        this.reason = reason;
        this.status = "OPEN";
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = "OPEN";
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
