package com.shadowsentinel.backend.classification.repository;

import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassificationRepository extends JpaRepository<ClassificationResult, UUID> {
    Optional<ClassificationResult> findByBrowserSessionSessionId(String sessionId);
}
