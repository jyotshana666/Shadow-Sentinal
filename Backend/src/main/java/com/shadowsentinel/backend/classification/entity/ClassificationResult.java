package com.shadowsentinel.backend.classification.entity;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "classification_results", indexes = {
    @Index(name = "idx_classification_session_id", columnList = "session_id")
})
public class ClassificationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private BrowserSession browserSession;

    @Column(name = "site_type", nullable = false)
    private String siteType; // ai_website, ai_capable_website, non_ai_website, monitored_website

    @Column(name = "ai_capability", nullable = false)
    private String aiCapability; // ai_capable, non_ai_capable, not_applicable

    @Column(name = "generation_active", nullable = false)
    private boolean generationActive;

    @Column(name = "site_category", nullable = false)
    private String siteCategory;

    @Column(name = "confidence_score", nullable = false)
    private double confidenceScore;

    @Column(name = "classified_by", nullable = false)
    private String classifiedBy; // "HEURISTIC_RULE_ENGINE", "ML_MODEL"

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ClassificationResult() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
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
