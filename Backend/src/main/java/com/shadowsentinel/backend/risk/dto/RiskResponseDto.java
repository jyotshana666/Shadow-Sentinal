package com.shadowsentinel.backend.risk.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class RiskResponseDto {
    private UUID id;
    private String sessionId;
    private String riskLevel;
    private List<String> reasons;
    private Instant evaluatedAt;

    public RiskResponseDto() {}

    public RiskResponseDto(UUID id, String sessionId, String riskLevel, List<String> reasons, Instant evaluatedAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.riskLevel = riskLevel;
        this.reasons = reasons;
        this.evaluatedAt = evaluatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
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
