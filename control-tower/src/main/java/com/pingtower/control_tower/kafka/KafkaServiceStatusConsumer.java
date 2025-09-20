package com.pingtower.control_tower.kafka;

import com.pingtower.control_tower.kafka.ServiceStatusUpdateMessage;
import com.pingtower.control_tower.model.dto.DashboardServiceDto;
import com.pingtower.control_tower.repository.ServiceRepository;
import com.pingtower.control_tower.service.DashboardDataService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;

@Service
@Slf4j
public class KafkaServiceStatusConsumer {

    private final ServiceRepository serviceRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DashboardDataService dashboardDataService;

    public KafkaServiceStatusConsumer(ServiceRepository serviceRepository, SimpMessagingTemplate messagingTemplate, DashboardDataService dashboardDataService) {
        this.serviceRepository = serviceRepository;
        this.messagingTemplate = messagingTemplate;
        this.dashboardDataService = dashboardDataService;
    }

    @KafkaListener(topics = "service-status-updates", groupId = "control-tower-group")
    @Transactional
    public void consumeServiceStatusUpdate(ServiceStatusUpdateMessage message) {
        log.info("Received status update for serviceId: {}", message.getServiceId());

        try {
            String serviceId = Objects.requireNonNull(message.getServiceId(), "Service ID must not be null");
            String newStatusStr = Objects.requireNonNull(message.getNewStatus(), "New status must not be null");
            
            // A simple mapping from string status to integer.
            // This could be more sophisticated (e.g., an Enum).
            int newStatus = "OK".equalsIgnoreCase(newStatusStr) ? 1 : 0;

            serviceRepository.findById(serviceId).ifPresentOrElse(
                service -> {
                    log.info("Updating service {} to status {}", serviceId, newStatusStr);
                    service.setStatus(newStatus);
                    service.setLastCheck(LocalDateTime.now());
                    serviceRepository.save(service);
                    log.info("Service {} updated in PostgreSQL.", serviceId);

                    // After saving, get the updated aggregated data and send to WebSocket
                    log.info("Fetching updated aggregated data for serviceId: {}", serviceId);
                    DashboardServiceDto updatedServiceDto = dashboardDataService.getUpdatedService(serviceId);
                    
                    if (updatedServiceDto != null) {
                        log.info("Sending dashboard update for serviceId: {}", serviceId);
                        messagingTemplate.convertAndSend("/topic/dashboard.update", updatedServiceDto);
                        log.info("Dashboard update sent for serviceId: {}", serviceId);
                    } else {
                        log.warn("Could not generate dashboard DTO for serviceId: {}. Update will not be sent.", serviceId);
                    }
                },
                () -> log.warn("Service with ID {} not found, cannot update status.", serviceId)
            );

        } catch (NullPointerException e) {
            log.error("Received message with null fields: {}", message, e);
        } catch (Exception e) {
            log.error("Failed to process service status update for message: {}", message, e);
        }
    }
}
