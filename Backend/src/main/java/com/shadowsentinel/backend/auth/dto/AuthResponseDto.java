package com.shadowsentinel.backend.auth.dto;

import java.util.UUID;

public class AuthResponseDto {

    private String jwt;
    private UUID userId;
    private String orgId;
    private String email;
    private String role;
    private long jwtExpiry;

    public AuthResponseDto() {}

    public AuthResponseDto(String jwt, UUID userId, String orgId, String email, String role, long jwtExpiry) {
        this.jwt = jwt;
        this.userId = userId;
        this.orgId = orgId;
        this.email = email;
        this.role = role;
        this.jwtExpiry = jwtExpiry;
    }

    public String getJwt() {
        return jwt;
    }

    public void setJwt(String jwt) {
        this.jwt = jwt;
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

    public long getJwtExpiry() {
        return jwtExpiry;
    }

    public void setJwtExpiry(long jwtExpiry) {
        this.jwtExpiry = jwtExpiry;
    }
}
