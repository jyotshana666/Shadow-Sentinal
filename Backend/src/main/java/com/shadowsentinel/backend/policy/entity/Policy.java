package com.shadowsentinel.backend.policy.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "policies", indexes = {
    @Index(name = "idx_policy_enabled", columnList = "enabled")
})
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "domain_pattern", nullable = false)
    private String domainPattern; // e.g. "*openai.com*", "*", "chatgpt.com"

    @Column(name = "min_risk_level", nullable = false)
    private String minRiskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String action; // BLOCK, ALERT, MONITOR

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Policy() {}

    public Policy(String name, String description, String domainPattern, String minRiskLevel, String action, boolean enabled) {
        this.name = name;
        this.description = description;
        this.domainPattern = domainPattern;
        this.minRiskLevel = minRiskLevel;
        this.action = action;
        this.enabled = enabled;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
