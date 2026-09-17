package com.shadowsentinel.backend.browser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shadowsentinel.backend.auth.dto.AuthResponseDto;
import com.shadowsentinel.backend.auth.dto.LoginRequestDto;
import com.shadowsentinel.backend.browser.dto.BatchIngestionRequestDto;
import com.shadowsentinel.backend.browser.dto.BrowserSessionIngestionDto;
import com.shadowsentinel.backend.browser.repository.BrowserSessionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BrowserActivityIngestionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BrowserSessionRepository sessionRepository;

    @Test
    void fullIntegrationFlow_RegisterLoginIngestVerify() throws Exception {
        // 1. Login with seeded admin
        LoginRequestDto loginRequest = new LoginRequestDto("admin@shadowsentinel.com", "Admin@123456");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt").exists())
                .andReturn();

        AuthResponseDto authResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                AuthResponseDto.class
        );
        String jwt = authResponse.getJwt();

        // 2. Prepare telemetry batch payload matching extension contract
        String sessionId = UUID.randomUUID().toString();
        BrowserSessionIngestionDto sessionDto = new BrowserSessionIngestionDto();
        sessionDto.setSessionId(sessionId);
        sessionDto.setDomain("chatgpt.com");
        sessionDto.setStartTime("2026-09-17T12:00:00Z");
        sessionDto.setEndTime("2026-09-17T12:05:00Z");
        sessionDto.setDuration(300);
        sessionDto.setVisitCount(1);
        sessionDto.setRequestCount(15);
        sessionDto.setRequestFrequency(3.0);
        sessionDto.setRapidRequestBurst(true);
        sessionDto.setSseDetected(true);
        sessionDto.setTotalSseEvents(5);
        sessionDto.setInteractionCount(8);
        sessionDto.setSessionEngagement("HIGH");
        sessionDto.setHasChatInput(true);
        sessionDto.setHasStreamingDiv(true);
        sessionDto.setHasAiTermsInTitle(true);
        sessionDto.setHasAiTermsInMeta(false);
        sessionDto.setDetectedAiClasses(List.of("chat-container", "response-bubble"));
        sessionDto.setFormInteractionRate(2.5);
        sessionDto.setAiConfidenceScore(85.0);
        sessionDto.setSite_type("ai_website");
        sessionDto.setAi_capability("ai_capable");
        sessionDto.setGeneration_active(true);
        sessionDto.setSite_category("ai_tool");

        BatchIngestionRequestDto batchRequest = new BatchIngestionRequestDto(List.of(sessionDto));

        // 3. Ingest telemetry batch
        mockMvc.perform(post("/api/v1/sessions/batch")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.synced").value(1));

        // 4. Verify Database Persistence
        assertEquals(1, sessionRepository.findByDomain("chatgpt.com").size());

        // 5. Verify Classification Boundary API
        mockMvc.perform(get("/api/v1/classification/sessions/" + sessionId)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.siteType").value("ai_website"))
                .andExpect(jsonPath("$.data.aiCapability").value("ai_capable"));

        // 6. Verify Risk Boundary API
        mockMvc.perform(get("/api/v1/risk/sessions/" + sessionId)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.riskLevel").value("HIGH"));
    }

    @Test
    void ingestSessions_UnauthenticatedRequest_ReturnsUnauthorized() throws Exception {
        BatchIngestionRequestDto batchRequest = new BatchIngestionRequestDto(List.of());
        mockMvc.perform(post("/api/v1/sessions/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchRequest)))
                .andExpect(status().isUnauthorized());
    }
}
