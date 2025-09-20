package com.pingtower.control_tower.repository;

import com.pingtower.control_tower.domain.Check;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CheckRepository extends JpaRepository<Check, UUID> {
}
