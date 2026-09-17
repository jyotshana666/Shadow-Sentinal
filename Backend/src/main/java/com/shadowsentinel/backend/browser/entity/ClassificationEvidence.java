package com.shadowsentinel.backend.browser.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "classification_evidence", indexes = {
    @Index(name = "idx_evidence_session_id", columnList = "session_id")
})
public class ClassificationEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private BrowserSession browserSession;

    // UI Signals
    private boolean hasChatInput;
    private boolean hasStreamingDiv;
    private boolean hasAiTermsInTitle;
    private boolean hasAiTermsInMeta;

    @ElementCollection
    @CollectionTable(name = "evidence_detected_ai_classes", joinColumns = @JoinColumn(name = "evidence_id"))
    @Column(name = "class_name")
    private List<String> detectedAiClasses;

    private double formInteractionRate;
    private double aiConfidenceScore;

    // Metadata Signals
    private String domain;
    private int requestCount;
    private double requestFrequency;
    private boolean rapidRequestBurst;
    private boolean sseDetected;
    private int totalSseEvents;

    // Interaction Signals
    private int interactionCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ClassificationEvidence() {}

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

    public boolean isHasChatInput() {
        return hasChatInput;
    }

    public void setHasChatInput(boolean hasChatInput) {
        this.hasChatInput = hasChatInput;
    }

    public boolean isHasStreamingDiv() {
        return hasStreamingDiv;
    }

    public void setHasStreamingDiv(boolean hasStreamingDiv) {
        this.hasStreamingDiv = hasStreamingDiv;
    }

    public boolean isHasAiTermsInTitle() {
        return hasAiTermsInTitle;
    }

    public void setHasAiTermsInTitle(boolean hasAiTermsInTitle) {
        this.hasAiTermsInTitle = hasAiTermsInTitle;
    }

    public boolean isHasAiTermsInMeta() {
        return hasAiTermsInMeta;
    }

    public void setHasAiTermsInMeta(boolean hasAiTermsInMeta) {
        this.hasAiTermsInMeta = hasAiTermsInMeta;
    }

    public List<String> getDetectedAiClasses() {
        return detectedAiClasses;
    }

    public void setDetectedAiClasses(List<String> detectedAiClasses) {
        this.detectedAiClasses = detectedAiClasses;
    }

    public double getFormInteractionRate() {
        return formInteractionRate;
    }

    public void setFormInteractionRate(double formInteractionRate) {
        this.formInteractionRate = formInteractionRate;
    }

    public double getAiConfidenceScore() {
        return aiConfidenceScore;
    }

    public void setAiConfidenceScore(double aiConfidenceScore) {
        this.aiConfidenceScore = aiConfidenceScore;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public int getRequestCount() {
        return requestCount;
    }

    public void setRequestCount(int requestCount) {
        this.requestCount = requestCount;
    }

    public double getRequestFrequency() {
        return requestFrequency;
    }

    public void setRequestFrequency(double requestFrequency) {
        this.requestFrequency = requestFrequency;
    }

    public boolean isRapidRequestBurst() {
        return rapidRequestBurst;
    }

    public void setRapidRequestBurst(boolean rapidRequestBurst) {
        this.rapidRequestBurst = rapidRequestBurst;
    }

    public boolean isSseDetected() {
        return sseDetected;
    }

    public void setSseDetected(boolean sseDetected) {
        this.sseDetected = sseDetected;
    }

    public int getTotalSseEvents() {
        return totalSseEvents;
    }

    public void setTotalSseEvents(int totalSseEvents) {
        this.totalSseEvents = totalSseEvents;
    }

    public int getInteractionCount() {
        return interactionCount;
    }

    public void setInteractionCount(int interactionCount) {
        this.interactionCount = interactionCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
