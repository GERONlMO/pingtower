package com.pingtower.control_tower.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertMessage {
    private String serviceId;
    private String serviceName;
    private String environment;
    private String previousStatus;
    private String newStatus;
    private String timestamp;
    private String message;
}
