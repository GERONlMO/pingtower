package com.pingtower.control_tower.controller;

import com.pingtower.control_tower.domain.Check;
import com.pingtower.control_tower.repository.CheckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/checks")
public class CheckController {

    @Autowired
    private CheckRepository checkRepository;

    @GetMapping
    public List<Check> getAllChecks() {
        return checkRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Check> getCheckById(@PathVariable UUID id) {
        return checkRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Check createCheck(@RequestBody Check check) {
        return checkRepository.save(check);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Check> updateCheck(@PathVariable UUID id, @RequestBody Check checkDetails) {
        return checkRepository.findById(id)
                .map(check -> {
                    check.setType(checkDetails.getType());
                    check.setEnabled(checkDetails.getEnabled());
                    check.setSchedule(checkDetails.getSchedule());
                    check.setConfig(checkDetails.getConfig());
                    // ... other fields
                    Check updatedCheck = checkRepository.save(check);
                    return ResponseEntity.ok(updatedCheck);
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheck(@PathVariable UUID id) {
        return checkRepository.findById(id)
                .map(check -> {
                    checkRepository.delete(check);
                    return ResponseEntity.ok().<Void>build();
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
