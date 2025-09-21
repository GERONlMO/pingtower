package com.pingtower.control_tower.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardServiceDto {
    private String id;          // service.id
    private String n;           // service.name
    private String e;           // service.environment
    private String st;         // service.status
    private Double p95;         // 95th percentile latency from ClickHouse
    private Double avg;         // Average latency from ClickHouse
    private Double up;          // Uptime percentage from ClickHouse (ok_count / total_count)
    private Long ok;            // Number of successful checks from ClickHouse
    private Integer dlt; // DOM Load Time in ms
    private Integer ttfb; // Time to First Byte in ms
    private Integer ssl; // SSL Expires In Days
    private Timestamp lc;   // service.lastCheck
    private Boolean io;         // is_online - derived from status
}
