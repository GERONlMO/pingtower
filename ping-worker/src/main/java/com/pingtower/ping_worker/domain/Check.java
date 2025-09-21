package com.pingtower.ping_worker.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Data
@Table(name = "checks")
public class Check {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String serviceId;

    private String type;

    private Boolean enabled;

    private String schedule;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String config;

    @Column(name = "last_status")
    private Integer lastStatus;

    @Column(name = "last_latency_ms")
    private Integer lastLatencyMs;

    @Column(name = "last_execution")
    private Timestamp lastExecution;

    public String getConfig() {
        return config;
    }
}
