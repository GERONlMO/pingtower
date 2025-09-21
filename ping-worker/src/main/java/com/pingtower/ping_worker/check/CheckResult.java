package com.pingtower.ping_worker.check;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckResult {
    private boolean success;
    private int responseCode;
    private String statusText; // e.g., "200 OK", "Connection Timeout"
    private long latencyMs; // Total time from start to finish
    private Long domLoadTimeMs; // Time to DOMContentLoaded
    private Long ttfbMs; // Time to First Byte
    private Long sslExpiresInDays; // Days until SSL certificate expires
    private String errorMessage;
    private String details;
}
