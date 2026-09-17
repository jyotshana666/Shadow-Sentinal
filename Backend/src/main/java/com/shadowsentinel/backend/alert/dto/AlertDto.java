package com.shadowsentinel.backend.alert.dto;

import java.time.Instant;
import java.util.UUID;

public class AlertDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String sessionId;
    private String domain;
    private String riskLevel;
    private String reason;
    private String status;
    private Instant createdAt;
    private Instant resolvedAt;

    public AlertDto() {}

    public AlertDto(UUID id, UUID userId, String userEmail, String sessionId, String domain, String riskLevel, String reason, String status, Instant createdAt, Instant resolvedAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.sessionId = sessionId;
        this.domain = domain;
        this.riskLevel = riskLevel;
        this.reason = reason;
        this.status = status;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
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
