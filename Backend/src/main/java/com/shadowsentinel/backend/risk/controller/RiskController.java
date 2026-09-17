package com.shadowsentinel.backend.risk.controller;

import com.shadowsentinel.backend.common.exception.ResourceNotFoundException;
import com.shadowsentinel.backend.common.response.ApiResponse;
import com.shadowsentinel.backend.risk.dto.RiskResponseDto;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;
import com.shadowsentinel.backend.risk.repository.RiskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/risk", "/risk"})
public class RiskController {

    private final RiskRepository riskRepository;

    public RiskController(RiskRepository riskRepository) {
        this.riskRepository = riskRepository;
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<RiskResponseDto>> getRiskForSession(@PathVariable String sessionId) {
        RiskAssessment assessment = riskRepository.findByBrowserSessionSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Risk assessment not found for session: " + sessionId));

        RiskResponseDto dto = new RiskResponseDto(
                assessment.getId(),
                assessment.getBrowserSession().getSessionId(),
                assessment.getRiskLevel(),
                assessment.getReasons(),
                assessment.getEvaluatedAt()
        );

        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<ApiResponse<List<RiskResponseDto>>> getRiskByLevel(@PathVariable String level) {
        List<RiskResponseDto> dtos = riskRepository.findByRiskLevel(level.toUpperCase()).stream()
                .map(r -> new RiskResponseDto(
                        r.getId(),
                        r.getBrowserSession().getSessionId(),
                        r.getRiskLevel(),
                        r.getReasons(),
                        r.getEvaluatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
}
