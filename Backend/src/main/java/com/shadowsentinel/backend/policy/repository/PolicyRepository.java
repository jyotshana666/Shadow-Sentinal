package com.shadowsentinel.backend.policy.repository;

import com.shadowsentinel.backend.policy.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, UUID> {
    List<Policy> findByEnabled(boolean enabled);
    boolean existsByName(String name);
}
