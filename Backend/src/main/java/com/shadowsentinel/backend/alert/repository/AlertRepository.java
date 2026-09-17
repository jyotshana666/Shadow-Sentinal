package com.shadowsentinel.backend.alert.repository;

import com.shadowsentinel.backend.alert.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByUserId(UUID userId);
    List<Alert> findByStatus(String status);
    boolean existsByBrowserSessionSessionIdAndRiskLevel(String sessionId, String riskLevel);
}
