package com.shadowsentinel.backend.browser.dto;

public class BatchIngestionResponseDto {

    private int synced;

    public BatchIngestionResponseDto() {}

    public BatchIngestionResponseDto(int synced) {
        this.synced = synced;
    }

    public int getSynced() {
        return synced;
    }

    public void setSynced(int synced) {
        this.synced = synced;
    }
}
