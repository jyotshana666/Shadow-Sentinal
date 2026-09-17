package com.shadowsentinel.backend.alert.controller;

import com.shadowsentinel.backend.alert.dto.AlertDto;
import com.shadowsentinel.backend.alert.service.AlertService;
import com.shadowsentinel.backend.common.response.ApiResponse;
import com.shadowsentinel.backend.common.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/alerts", "/alerts"})
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AlertDto>>> getMyAlerts(@AuthenticationPrincipal UserPrincipal principal) {
        List<AlertDto> alerts = alertService.getAlertsForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertDto>>> getAllAlerts() {
        List<AlertDto> alerts = alertService.getAllAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AlertDto>> updateAlertStatus(@PathVariable UUID id, @RequestParam String status) {
        AlertDto updated = alertService.updateAlertStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Alert status updated", updated));
    }
}
