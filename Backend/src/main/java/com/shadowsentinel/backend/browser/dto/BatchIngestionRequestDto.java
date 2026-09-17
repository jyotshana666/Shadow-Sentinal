package com.shadowsentinel.backend.browser.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BatchIngestionRequestDto {

    @NotEmpty(message = "sessions list cannot be empty")
    @Valid
    private List<BrowserSessionIngestionDto> sessions;

    public BatchIngestionRequestDto() {}

    public BatchIngestionRequestDto(List<BrowserSessionIngestionDto> sessions) {
        this.sessions = sessions;
    }

    public List<BrowserSessionIngestionDto> getSessions() {
        return sessions;
    }

    public void setSessions(List<BrowserSessionIngestionDto> sessions) {
        this.sessions = sessions;
    }
}
