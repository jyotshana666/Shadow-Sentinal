package com.shadowsentinel.backend.user.dto;

import java.time.Instant;
import java.util.UUID;

public class UserResponseDto {
    private UUID id;
    private String email;
    private String role;
    private String orgId;
    private String status;
    private Instant createdAt;

    public UserResponseDto() {}

    public UserResponseDto(UUID id, String email, String role, String orgId, String status, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.orgId = orgId;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
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
}
