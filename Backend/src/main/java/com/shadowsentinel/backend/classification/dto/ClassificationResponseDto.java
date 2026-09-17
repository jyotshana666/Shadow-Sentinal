package com.shadowsentinel.backend.classification.dto;

import java.time.Instant;
import java.util.UUID;

public class ClassificationResponseDto {
    private UUID id;
    private String sessionId;
    private String siteType;
    private String aiCapability;
    private boolean generationActive;
    private String siteCategory;
    private double confidenceScore;
    private String classifiedBy;
    private Instant createdAt;

    public ClassificationResponseDto() {}

    public ClassificationResponseDto(UUID id, String sessionId, String siteType, String aiCapability,
                                   boolean generationActive, String siteCategory, double confidenceScore,
                                   String classifiedBy, Instant createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.siteType = siteType;
        this.aiCapability = aiCapability;
        this.generationActive = generationActive;
        this.siteCategory = siteCategory;
        this.confidenceScore = confidenceScore;
        this.classifiedBy = classifiedBy;
        this.createdAt = createdAt;
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

    public String getSiteType() {
        return siteType;
    }

    public void setSiteType(String siteType) {
        this.siteType = siteType;
    }

    public String getAiCapability() {
        return aiCapability;
    }

    public void setAiCapability(String aiCapability) {
        this.aiCapability = aiCapability;
    }

    public boolean isGenerationActive() {
        return generationActive;
    }

    public void setGenerationActive(boolean generationActive) {
        this.generationActive = generationActive;
    }

    public String getSiteCategory() {
        return siteCategory;
    }

    public void setSiteCategory(String siteCategory) {
        this.siteCategory = siteCategory;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getClassifiedBy() {
        return classifiedBy;
    }

    public void setClassifiedBy(String classifiedBy) {
        this.classifiedBy = classifiedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
