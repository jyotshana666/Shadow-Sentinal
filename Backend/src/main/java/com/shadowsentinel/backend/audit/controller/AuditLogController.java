package com.shadowsentinel.backend.audit.controller;

import com.shadowsentinel.backend.audit.entity.AuditLog;
import com.shadowsentinel.backend.audit.service.AuditLogService;
import com.shadowsentinel.backend.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/admin/audit-logs", "/admin/audit-logs"})
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAllAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getAllAuditLogs()));
    }
}
