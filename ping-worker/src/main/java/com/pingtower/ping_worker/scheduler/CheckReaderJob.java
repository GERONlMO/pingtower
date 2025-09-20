package com.pingtower.ping_worker.scheduler;

import com.pingtower.ping_worker.check.CheckResult;
import com.pingtower.ping_worker.check.HttpCheckExecutor;
import com.pingtower.ping_worker.check.SslCheckExecutor;
import com.pingtower.ping_worker.domain.Check;
import com.pingtower.ping_worker.kafka.ServiceStatusUpdateMessage;
import com.pingtower.ping_worker.repository.CheckRepository;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class CheckReaderJob extends QuartzJobBean {

    private final CheckRepository checkRepository;
    private final HttpCheckExecutor httpCheckExecutor;
    private final SslCheckExecutor sslCheckExecutor;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final JdbcTemplate clickhouseJdbcTemplate;

    @Autowired
    public CheckReaderJob(CheckRepository checkRepository,
                          HttpCheckExecutor httpCheckExecutor,
                          SslCheckExecutor sslCheckExecutor,
                          KafkaTemplate<String, Object> kafkaTemplate,
                          @Qualifier("clickhouseJdbcTemplate") JdbcTemplate clickhouseJdbcTemplate) {
        this.checkRepository = checkRepository;
        this.httpCheckExecutor = httpCheckExecutor;
        this.sslCheckExecutor = sslCheckExecutor;
        this.kafkaTemplate = kafkaTemplate;
        this.clickhouseJdbcTemplate = clickhouseJdbcTemplate;
    }

    @Override
    protected void executeInternal(JobExecutionContext context) {
        log.info("Executing CheckReaderJob...");
        List<Check> enabledChecks = checkRepository.findAllByEnabledIsTrue();

        if (enabledChecks.isEmpty()) {
            log.info("No enabled checks found to execute.");
            return;
        }

        for (Check check : enabledChecks) {
            log.info("Processing check ID: {}", check.getId());
            CheckResult result;
            if ("HTTP".equalsIgnoreCase(check.getType())) {
                result = httpCheckExecutor.execute(check.getConfig());
            } else if ("SSL".equalsIgnoreCase(check.getType())) {
                result = sslCheckExecutor.execute(check.getConfig());
            } else {
                log.warn("Unknown check type '{}' for check ID: {}", check.getType(), check.getId());
                continue;
            }
            
            processCheckResult(check, result);
        }
        log.info("CheckReaderJob finished execution.");
    }

    private void processCheckResult(Check check, CheckResult result) {
        // 1. Send raw measurement to Kafka
        sendToKafka("raw-measurements", check, result);
        
        // 2. Save to ClickHouse
        saveToClickHouse(check, result);
        
        // 3. Handle status change
        handleStatusChange(check, result);
        
        // 4. Update check status in PostgreSQL
        updateCheckInPostgres(check, result);
    }
    
    private void sendToKafka(String topic, Check check, CheckResult result) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("checkId", check.getId().toString());
            message.put("serviceId", check.getServiceId());
            message.put("timestamp", Instant.now().toString());
            message.put("success", result.isSuccess());
            message.put("latencyMs", result.getLatencyMs());
            message.put("responseCode", result.getResponseCode());
            message.put("errorMessage", result.getErrorMessage());
            
            kafkaTemplate.send(topic, message);
            log.debug("Sent message to Kafka topic '{}' for check ID {}", topic, check.getId());
        } catch (Exception e) {
            log.error("Failed to send message to Kafka for check ID {}", check.getId(), e);
        }
    }
    
    private void saveToClickHouse(Check check, CheckResult result) {
        String sql = "INSERT INTO measurements (checkId, serviceId, timestamp, success, latencyMs, responseCode, errorMessage) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try {
            clickhouseJdbcTemplate.update(sql,
                    check.getId(),
                    check.getServiceId(),
                    Timestamp.from(Instant.now()),
                    result.isSuccess(),
                    result.getLatencyMs(),
                    result.getResponseCode(),
                    result.getErrorMessage()
            );
            log.debug("Saved measurement to ClickHouse for check ID {}", check.getId());
        } catch (Exception e) {
            log.error("Failed to save measurement to ClickHouse for check ID {}", check.getId(), e);
        }
    }
    
    private void handleStatusChange(Check check, CheckResult result) {
        boolean previousStatusOk = check.getLastStatus() == null || check.getLastStatus() == 1;
        boolean currentStatusOk = result.isSuccess();

        if (previousStatusOk && !currentStatusOk) {
            log.warn("Status changed to FAILED for check ID {}", check.getId());
            ServiceStatusUpdateMessage message = ServiceStatusUpdateMessage.builder()
                    .checkId(check.getId().toString())
                    .serviceId(check.getServiceId())
                    .newStatus("CRIT")
                    .timestamp(Instant.now().toString())
                    .details(result.getErrorMessage())
                    .build();
            sendToKafka("service-status-updates", message);
        } else if (!previousStatusOk && currentStatusOk) {
            log.info("Status changed to OK for check ID {}", check.getId());
            ServiceStatusUpdateMessage message = ServiceStatusUpdateMessage.builder()
                    .checkId(check.getId().toString())
                    .serviceId(check.getServiceId())
                    .newStatus("OK")
                    .timestamp(Instant.now().toString())
                    .build();
            sendToKafka("service-status-updates", message);
        }
    }
    
    private void sendToKafka(String topic, Object message) {
        try {
            kafkaTemplate.send(topic, message);
            log.debug("Sent message to Kafka topic '{}'", topic);
        } catch (Exception e) {
            log.error("Failed to send message to Kafka", e);
        }
    }

    private void updateCheckInPostgres(Check check, CheckResult result) {
        check.setLastStatus(result.isSuccess() ? 1 : 0);
        check.setLastLatencyMs((int) result.getLatencyMs());
        checkRepository.save(check);
    }
}
