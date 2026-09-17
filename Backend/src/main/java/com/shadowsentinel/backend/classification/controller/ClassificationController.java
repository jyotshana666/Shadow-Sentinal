package com.shadowsentinel.backend.classification.controller;

import com.shadowsentinel.backend.classification.dto.ClassificationResponseDto;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.classification.repository.ClassificationRepository;
import com.shadowsentinel.backend.common.exception.ResourceNotFoundException;
import com.shadowsentinel.backend.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/classification", "/classification"})
public class ClassificationController {

    private final ClassificationRepository classificationRepository;

    public ClassificationController(ClassificationRepository classificationRepository) {
        this.classificationRepository = classificationRepository;
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<ClassificationResponseDto>> getClassificationForSession(@PathVariable String sessionId) {
        ClassificationResult result = classificationRepository.findByBrowserSessionSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Classification not found for session: " + sessionId));

        ClassificationResponseDto dto = new ClassificationResponseDto(
                result.getId(),
                result.getBrowserSession().getSessionId(),
                result.getSiteType(),
                result.getAiCapability(),
                result.isGenerationActive(),
                result.getSiteCategory(),
                result.getConfidenceScore(),
                result.getClassifiedBy(),
                result.getCreatedAt()
        );

        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
