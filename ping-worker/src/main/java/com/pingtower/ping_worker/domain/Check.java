package com.pingtower.ping_worker.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

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

    private Integer lastStatus;

    private Integer lastLatencyMs;
}
