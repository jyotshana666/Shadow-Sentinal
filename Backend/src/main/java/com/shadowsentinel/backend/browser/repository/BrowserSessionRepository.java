package com.shadowsentinel.backend.browser.repository;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BrowserSessionRepository extends JpaRepository<BrowserSession, String> {
    List<BrowserSession> findByUserId(UUID userId);
    List<BrowserSession> findByDomain(String domain);
    List<BrowserSession> findBySiteType(String siteType);
}
