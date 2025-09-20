package com.pingtower.control_tower.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private Integer status;

    private LocalDateTime lastCheck;

    private UUID projectId;
}
