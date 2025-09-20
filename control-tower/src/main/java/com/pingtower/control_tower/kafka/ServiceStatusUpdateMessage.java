package com.pingtower.control_tower.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceStatusUpdateMessage {
    private String serviceId;
    private String newStatus;
}
