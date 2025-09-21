package com.pingtower.control_tower.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RawMeasurementMessage {
    private String checkId;
    private String serviceId;
    private String timestamp;
    private long latencyMs;
    private Long domLoadTimeMs;
    private Long ttfbMs;
    private Long sslExpiresInDays;
    private int responseCode;
    private String statusText;
    private boolean success;
    private String errorMessage;
}
