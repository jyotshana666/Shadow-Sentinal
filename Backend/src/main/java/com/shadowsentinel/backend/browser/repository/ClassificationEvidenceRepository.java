package com.shadowsentinel.backend.browser.repository;

import com.shadowsentinel.backend.browser.entity.ClassificationEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassificationEvidenceRepository extends JpaRepository<ClassificationEvidence, UUID> {
    Optional<ClassificationEvidence> findByBrowserSessionSessionId(String sessionId);
}
