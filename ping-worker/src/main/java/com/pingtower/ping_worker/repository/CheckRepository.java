package com.pingtower.ping_worker.repository;

import com.pingtower.ping_worker.domain.Check;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CheckRepository extends JpaRepository<Check, UUID> {
    List<Check> findAllByEnabledIsTrue();
}
