package com.pingtower.control_tower.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DashboardServiceDto {
    private String id;          // service.id
    private String n;           // service.name
    private String e;           // service.environment
    private Integer st;         // service.status
    private Double p95;         // 95th percentile latency from ClickHouse
    private Double avg;         // Average latency from ClickHouse
    private Double up;          // Uptime percentage from ClickHouse (ok_count / total_count)
    private Long ok;            // Number of successful checks from ClickHouse
    private LocalDateTime lc;   // service.lastCheck
    private Boolean io;         // is_online - derived from status
}
