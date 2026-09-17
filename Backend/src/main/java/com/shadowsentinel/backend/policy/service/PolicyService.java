package com.shadowsentinel.backend.policy.service;

import com.shadowsentinel.backend.common.exception.InvalidPayloadException;
import com.shadowsentinel.backend.common.exception.ResourceNotFoundException;
import com.shadowsentinel.backend.policy.dto.PolicyDto;
import com.shadowsentinel.backend.policy.entity.Policy;
import com.shadowsentinel.backend.policy.repository.PolicyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyService(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    public List<PolicyDto> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PolicyDto> getActivePolicies() {
        return policyRepository.findByEnabled(true).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PolicyDto getPolicyById(UUID id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));
        return mapToDto(policy);
    }

    public PolicyDto createPolicy(PolicyDto dto) {
        if (policyRepository.existsByName(dto.getName())) {
            throw new InvalidPayloadException("Policy with name already exists: " + dto.getName());
        }

        Policy policy = new Policy(
                dto.getName(),
                dto.getDescription(),
                dto.getDomainPattern(),
                dto.getMinRiskLevel(),
                dto.getAction(),
                dto.isEnabled()
        );

        Policy saved = policyRepository.save(policy);
        return mapToDto(saved);
    }

    public PolicyDto updatePolicy(UUID id, PolicyDto dto) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));

        policy.setName(dto.getName());
        policy.setDescription(dto.getDescription());
        policy.setDomainPattern(dto.getDomainPattern());
        policy.setMinRiskLevel(dto.getMinRiskLevel());
        policy.setAction(dto.getAction());
        policy.setEnabled(dto.isEnabled());

        Policy saved = policyRepository.save(policy);
        return mapToDto(saved);
    }

    public void deletePolicy(UUID id) {
        if (!policyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Policy not found with id: " + id);
        }
        policyRepository.deleteById(id);
    }

    private PolicyDto mapToDto(Policy policy) {
        return new PolicyDto(
                policy.getId(),
                policy.getName(),
                policy.getDescription(),
                policy.getDomainPattern(),
                policy.getMinRiskLevel(),
                policy.getAction(),
                policy.isEnabled(),
                policy.getCreatedAt()
        );
    }
}
