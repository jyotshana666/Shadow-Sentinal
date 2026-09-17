package com.shadowsentinel.backend.browser.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "browser_sessions", indexes = {
    @Index(name = "idx_session_user_id", columnList = "user_id"),
    @Index(name = "idx_session_domain", columnList = "domain"),
    @Index(name = "idx_session_start_time", columnList = "start_time"),
    @Index(name = "idx_session_site_type", columnList = "site_type")
})
public class BrowserSession {

    @Id
    @Column(name = "session_id", nullable = false)
    private String sessionId; // UUID string from extension

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "org_id", nullable = false)
    private String orgId;

    @Column(nullable = false)
    private String domain;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    private long duration;
    private int visitCount;
    private int requestCount;
    private double requestFrequency;
    private boolean rapidRequestBurst;
    private boolean sseDetected;
    private int totalSseEvents;
    private int interactionCount;
    private int peakRequestWindow;

    @Column(name = "session_engagement")
    private String sessionEngagement; // LOW, MEDIUM, HIGH

    @Column(name = "site_type")
    private String siteType; // ai_website, ai_capable_website, non_ai_website, monitored_website

    @Column(name = "ai_capability")
    private String aiCapability; // ai_capable, non_ai_capable, not_applicable

    private boolean generationActive;

    @Column(name = "site_category")
    private String siteCategory;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public BrowserSession() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public long getDuration() {
        return duration;
    }

    public void setDuration(long duration) {
        this.duration = duration;
    }

    public int getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(int visitCount) {
        this.visitCount = visitCount;
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

    public int getPeakRequestWindow() {
        return peakRequestWindow;
    }

    public void setPeakRequestWindow(int peakRequestWindow) {
        this.peakRequestWindow = peakRequestWindow;
    }

    public String getSessionEngagement() {
        return sessionEngagement;
    }

    public void setSessionEngagement(String sessionEngagement) {
        this.sessionEngagement = sessionEngagement;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
