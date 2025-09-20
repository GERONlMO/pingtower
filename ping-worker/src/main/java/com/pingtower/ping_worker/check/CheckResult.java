package com.pingtower.ping_worker.check;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckResult {
    private boolean success;
    private int responseCode;
    private long latencyMs;
    private String errorMessage;
}
