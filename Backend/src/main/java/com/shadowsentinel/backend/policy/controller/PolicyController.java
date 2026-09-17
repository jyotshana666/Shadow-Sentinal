package com.shadowsentinel.backend.policy.controller;

import com.shadowsentinel.backend.common.response.ApiResponse;
import com.shadowsentinel.backend.policy.dto.PolicyDto;
import com.shadowsentinel.backend.policy.service.PolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/policies", "/policies"})
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PolicyDto>>> getAllPolicies() {
        return ResponseEntity.ok(ApiResponse.success(policyService.getAllPolicies()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyDto>> getPolicyById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(policyService.getPolicyById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PolicyDto>> createPolicy(@Valid @RequestBody PolicyDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Policy created successfully", policyService.createPolicy(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PolicyDto>> updatePolicy(@PathVariable UUID id, @Valid @RequestBody PolicyDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Policy updated successfully", policyService.updatePolicy(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable UUID id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("Policy deleted successfully", null));
    }
}
