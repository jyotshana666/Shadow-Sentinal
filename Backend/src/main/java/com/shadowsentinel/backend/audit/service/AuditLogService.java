package com.shadowsentinel.backend.audit.service;

import com.shadowsentinel.backend.audit.entity.AuditLog;
import com.shadowsentinel.backend.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logEvent(String actor, String action, String target, String details) {
        AuditLog auditLog = new AuditLog(actor, action, target, details);
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }
}
