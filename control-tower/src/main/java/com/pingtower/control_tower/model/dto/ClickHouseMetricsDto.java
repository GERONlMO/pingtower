package com.pingtower.control_tower.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClickHouseMetricsDto {
    private double p95;
    private double avg;
    private long okCount;
    private long totalCount;
}
