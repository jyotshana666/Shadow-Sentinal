package com.shadowsentinel.backend.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
public class HealthController {

    @GetMapping({"/api/v1/health", "/health", "/actuator/health"})
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "shadow-sentinel-backend");
        health.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(health);
    }
}
