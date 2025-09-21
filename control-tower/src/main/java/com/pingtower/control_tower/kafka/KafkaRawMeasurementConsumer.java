package com.pingtower.control_tower.kafka;

import com.pingtower.control_tower.model.dto.DashboardServiceDto;
import com.pingtower.control_tower.repository.ServiceRepository;
import com.pingtower.control_tower.repository.CheckRepository;
import com.pingtower.control_tower.service.DashboardDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.sql.Timestamp;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaRawMeasurementConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final ServiceRepository serviceRepository;
    private final DashboardDataService dashboardDataService;
    private final CheckRepository checkRepository;
    
    @Qualifier("clickhouseJdbcTemplate")
    private final JdbcTemplate clickhouseJdbcTemplate;

    @KafkaListener(topics = "raw-measurements", groupId = "control-tower-group-raw")
    public void consumeRawMeasurement(RawMeasurementMessage message) {
        log.info("Received raw measurement for serviceId: {}", message.getServiceId());
        
        // Step 1: Write to ClickHouse for analytics
        writeToClickHouse(message);

        // Step 2: Update PostgreSQL with the latest status
        serviceRepository.findById(message.getServiceId()).ifPresent(service -> {
            service.setLastCheck(new Timestamp(System.currentTimeMillis()));

            // Update the service's main status based on the success of the check
            service.setStatus(message.isSuccess() ? 1 : 0); // 1 = OK, 0 = CRIT
            
            // Only update the main status text if it's NOT an SSL check result.
            // SSL check results only update the sslExpiresInDays field.
            if (message.getSslExpiresInDays() == null) {
                service.setLastStatusText(message.getStatusText());
            }
            
            if (message.getDomLoadTimeMs() != null) {
                service.setLastDomLoadTimeMs(message.getDomLoadTimeMs().intValue());
            }
            if (message.getTtfbMs() != null) {
                service.setLastTtfbMs(message.getTtfbMs().intValue());
            }
            if (message.getSslExpiresInDays() != null) {
                service.setSslExpiresInDays(message.getSslExpiresInDays().intValue());
            }
            serviceRepository.save(service);
            log.info("Updated service {} with latest check data.", message.getServiceId());

            // Step 3: After updating, fetch the complete aggregated data and send to WebSocket
            DashboardServiceDto updatedServiceDto = dashboardDataService.getUpdatedService(message.getServiceId());
            messagingTemplate.convertAndSend("/topic/dashboard.update", updatedServiceDto);
            log.info("Sent dashboard update for service: {}", message.getServiceId());
        });
    }

    private void writeToClickHouse(RawMeasurementMessage message) {
        try {
            String sql = "INSERT INTO measurements (checkId, serviceId, timestamp, success, latencyMs, responseCode, errorMessage) VALUES (?, ?, ?, ?, ?, ?, ?)";
            clickhouseJdbcTemplate.update(sql,
                    message.getCheckId(),
                    message.getServiceId(),
                    java.time.Instant.parse(message.getTimestamp()),
                    message.isSuccess(),
                    message.getLatencyMs(),
                    message.getResponseCode(),
                    message.getErrorMessage()
            );
            log.info("Saved measurement to ClickHouse for serviceId: {}", message.getServiceId());
        } catch (Exception e) {
            log.error("Failed to write measurement to ClickHouse for serviceId: {}", message.getServiceId(), e);
        }
    }
}
