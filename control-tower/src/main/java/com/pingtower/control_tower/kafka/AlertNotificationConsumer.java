package com.pingtower.control_tower.kafka;

import com.pingtower.control_tower.service.TelegramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AlertNotificationConsumer {

    private final TelegramService telegramService;

    @KafkaListener(topics = "alerts", groupId = "control-tower-alerts-group")
    public void consumeAlert(AlertMessage alert) {
        log.info("Received alert for service '{}'", alert.getServiceName());
        try {
            String formattedMessage = formatAlert(alert);
            telegramService.sendMessage(formattedMessage);
        } catch (Exception e) {
            log.error("Failed to process and send alert notification for serviceId: {}", alert.getServiceId(), e);
        }
    }

    private String formatAlert(AlertMessage alert) {
        String emoji = "🔴"; // CRIT
        if ("OK".equalsIgnoreCase(alert.getNewStatus())) {
            emoji = "✅"; // OK
        }

        return String.format(
            "%s *PingTower Alert* %s\n\n" +
            "*Service:* %s (%s)\n" +
            "*Environment:* %s\n" +
            "*Status Change:* `%s` -> `%s`\n" +
            "*Message:* %s\n" +
            "*Timestamp:* %s",
            emoji, emoji,
            alert.getServiceName(),
            alert.getServiceId(),
            alert.getEnvironment(),
            alert.getPreviousStatus(),
            alert.getNewStatus(),
            alert.getMessage(),
            alert.getTimestamp()
        );
    }
}
