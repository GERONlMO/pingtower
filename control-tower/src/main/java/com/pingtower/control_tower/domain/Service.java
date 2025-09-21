package com.pingtower.control_tower.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    private String id;

    private String name;

    private String environment; // 'prod', 'stage', 'dev'

    @Column(name = "status")
    private Integer status; // 0 = CRIT, 1 = OK, 2 = UNKNOWN

    @Column(name = "last_status_text")
    private String lastStatusText;

    @Column(name = "last_dom_load_time_ms")
    private Integer lastDomLoadTimeMs;

    @Column(name = "last_ttfb_ms")
    private Integer lastTtfbMs;

    @Column(name = "ssl_expires_in_days")
    private Integer sslExpiresInDays;

    @Column(name = "last_check")
    private Timestamp lastCheck;

    private UUID projectId;

    private String url;

    @Column(name = "interval_sec")
    private Integer intervalSec;

    @Column(name = "timeout_sec")
    private Integer timeoutSec;

    @Column(name = "degradation_threshold_ms")
    private Integer degradationThresholdMs;

    private Boolean enabled;
}
