package com.shadowsentinel.backend.browser.controller;

import com.shadowsentinel.backend.browser.dto.BatchIngestionRequestDto;
import com.shadowsentinel.backend.browser.dto.BatchIngestionResponseDto;
import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.browser.service.BrowserActivityService;
import com.shadowsentinel.backend.common.response.ApiResponse;
import com.shadowsentinel.backend.common.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BrowserActivityController {

    private final BrowserActivityService activityService;

    public BrowserActivityController(BrowserActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping({"/api/v1/sessions/batch", "/api/sessions/batch", "/api/v1/browser/activities"})
    public ResponseEntity<BatchIngestionResponseDto> ingestSessions(
            @Valid @RequestBody BatchIngestionRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal) {

        BatchIngestionResponseDto response = activityService.processBatchIngestion(
                request,
                principal.getId(),
                principal.getOrgId()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping({"/api/v1/browser/sessions/my", "/browser/sessions/my"})
    public ResponseEntity<ApiResponse<List<BrowserSession>>> getMySessions(@AuthenticationPrincipal UserPrincipal principal) {
        List<BrowserSession> sessions = activityService.getSessionsForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping({"/api/v1/browser/sessions", "/browser/sessions"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BrowserSession>>> getAllSessions() {
        List<BrowserSession> sessions = activityService.getAllSessions();
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }
}
