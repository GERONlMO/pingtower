package com.pingtower.control_tower.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;


import java.util.UUID;

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

    private String type; // e.g., 'HTTP', 'SSL'

    private Boolean enabled;

    private String schedule;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private String config;

    private Integer lastStatus;

    private Integer lastLatencyMs;
}
