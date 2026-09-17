package com.shadowsentinel.backend.policy.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public class PolicyDto {

    private UUID id;

    @NotBlank(message = "Policy name is required")
    private String name;

    private String description;

    @NotBlank(message = "domainPattern is required")
    private String domainPattern;

    @NotBlank(message = "minRiskLevel is required")
    private String minRiskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @NotBlank(message = "action is required")
    private String action; // BLOCK, ALERT, MONITOR

    private boolean enabled = true;
    private Instant createdAt;

    public PolicyDto() {}

    public PolicyDto(UUID id, String name, String description, String domainPattern, String minRiskLevel, String action, boolean enabled, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.domainPattern = domainPattern;
        this.minRiskLevel = minRiskLevel;
        this.action = action;
        this.enabled = enabled;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDomainPattern() {
        return domainPattern;
    }

    public void setDomainPattern(String domainPattern) {
        this.domainPattern = domainPattern;
    }

    public String getMinRiskLevel() {
        return minRiskLevel;
    }

    public void setMinRiskLevel(String minRiskLevel) {
        this.minRiskLevel = minRiskLevel;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
