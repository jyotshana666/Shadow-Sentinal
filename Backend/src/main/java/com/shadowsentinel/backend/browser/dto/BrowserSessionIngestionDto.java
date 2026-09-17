package com.shadowsentinel.backend.browser.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BrowserSessionIngestionDto {

    @NotBlank(message = "sessionId is required")
    private String sessionId;

    private String userId;
    private String orgId;

    @NotBlank(message = "domain is required")
    private String domain;

    @NotBlank(message = "startTime is required")
    private String startTime;

    private String endTime;
    private long duration;
    private int visitCount;
    private int requestCount;
    private double requestFrequency;
    private boolean rapidRequestBurst;
    private boolean sseDetected;
    private int totalSseEvents;
    private int interactionCount;
    private int peakRequestWindow;
    private String sessionEngagement;

    // UI signals
    private boolean hasChatInput;
    private boolean hasStreamingDiv;
    private boolean hasAiTermsInTitle;
    private boolean hasAiTermsInMeta;
    private List<String> detectedAiClasses;
    private double formInteractionRate;
    private double aiConfidenceScore;

    // Classification hints
    private String site_type;
    private String ai_capability;
    private boolean generation_active;
    private String site_category;

    public BrowserSessionIngestionDto() {}

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
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

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
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

    public String getSite_type() {
        return site_type;
    }

    public void setSite_type(String site_type) {
        this.site_type = site_type;
    }

    public String getAi_capability() {
        return ai_capability;
    }

    public void setAi_capability(String ai_capability) {
        this.ai_capability = ai_capability;
    }

    public boolean isGeneration_active() {
        return generation_active;
    }

    public void setGeneration_active(boolean generation_active) {
        this.generation_active = generation_active;
    }

    public String getSite_category() {
        return site_category;
    }

    public void setSite_category(String site_category) {
        this.site_category = site_category;
    }
}
