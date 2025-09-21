package com.pingtower.control_tower.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;


import java.util.UUID;
import java.sql.Timestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "checks")
public class Check {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String serviceId;

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

    @Column(name = "type")
    private String type; // "HTTP", "SSL", etc.
}
