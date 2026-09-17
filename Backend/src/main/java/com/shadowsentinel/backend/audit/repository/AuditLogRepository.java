package com.shadowsentinel.backend.audit.repository;

import com.shadowsentinel.backend.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByActor(String actor);
    List<AuditLog> findByAction(String action);
}
