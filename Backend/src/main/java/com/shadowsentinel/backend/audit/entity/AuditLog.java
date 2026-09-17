package com.shadowsentinel.backend.audit.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_actor", columnList = "actor"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String actor; // User email or system identifier

    @Column(nullable = false)
    private String action; // e.g. "USER_LOGIN", "POLICY_CREATED", "ALERT_RESOLVED"

    @Column(nullable = false)
    private String target;

    @Column(length = 2000)
    private String details;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    public AuditLog() {}

    public AuditLog(String actor, String action, String target, String details) {
        this.actor = actor;
        this.action = action;
        this.target = target;
        this.details = details;
        this.timestamp = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
