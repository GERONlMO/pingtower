package com.pingtower.ping_worker.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceStatusUpdateMessage {
    private String checkId;
    private String serviceId;
    private String newStatus;
    private String timestamp;
    private String details;
}
