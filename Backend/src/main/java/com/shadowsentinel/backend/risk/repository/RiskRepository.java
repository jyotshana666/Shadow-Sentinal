package com.shadowsentinel.backend.risk.repository;

import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskRepository extends JpaRepository<RiskAssessment, UUID> {
    Optional<RiskAssessment> findByBrowserSessionSessionId(String sessionId);
    List<RiskAssessment> findByRiskLevel(String riskLevel);
}
