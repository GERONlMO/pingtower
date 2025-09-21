package com.pingtower.ping_worker.scheduler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pingtower.ping_worker.check.CheckResult;
import com.pingtower.ping_worker.check.HttpCheckExecutor;
import com.pingtower.ping_worker.check.BrowserCheckExecutor;
import com.pingtower.ping_worker.check.SslCheckExecutor;
import com.pingtower.ping_worker.domain.Check;
import com.pingtower.ping_worker.kafka.ServiceStatusUpdateMessage;
import com.pingtower.ping_worker.repository.CheckRepository;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

@Slf4j
@Component
public class CheckReaderJob implements Job {

    // All dependencies remain here
    private final CheckRepository checkRepository;
    private final HttpCheckExecutor httpCheckExecutor;
    private final BrowserCheckExecutor browserCheckExecutor;
    private final SslCheckExecutor sslCheckExecutor;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final JdbcTemplate clickhouseJdbcTemplate;
    private final Executor checkTaskExecutor;

    @Autowired
    public CheckReaderJob(CheckRepository checkRepository,
                          HttpCheckExecutor httpCheckExecutor,
                          BrowserCheckExecutor browserCheckExecutor,
                          SslCheckExecutor sslCheckExecutor,
                          KafkaTemplate<String, Object> kafkaTemplate,
                          @Qualifier("clickhouseJdbcTemplate") JdbcTemplate clickhouseJdbcTemplate,
                          @Qualifier("checkTaskExecutor") Executor checkTaskExecutor) {
        this.checkRepository = checkRepository;
        this.httpCheckExecutor = httpCheckExecutor;
        this.browserCheckExecutor = browserCheckExecutor;
        this.sslCheckExecutor = sslCheckExecutor;
        this.kafkaTemplate = kafkaTemplate;
        this.clickhouseJdbcTemplate = clickhouseJdbcTemplate;
        this.checkTaskExecutor = checkTaskExecutor;
    }

    @Override
    @Transactional
    public void execute(JobExecutionContext context) {
        log.info("Checking for scheduled jobs to run...");
        List<Check> checks = checkRepository.findAllByEnabledIsTrue();
        LocalDateTime now = LocalDateTime.now();

        for (final Check check : checks) {
            if (shouldRun(check, now)) {
                check.setLastExecution(java.sql.Timestamp.valueOf(now));
                checkRepository.save(check);
                log.info("Submitting check ID {} for execution.", check.getId());
                checkTaskExecutor.execute(() -> processCheck(check));
            }
        }
    }

    private boolean shouldRun(Check check, LocalDateTime now) {
        String cronExpression = check.getSchedule();
        if (cronExpression == null || cronExpression.isBlank()) {
            return false;
        }

        // Run immediately if it has never run before
        if (check.getLastExecution() == null) {
            log.info("Check ID {} has never been executed. Running immediately.", check.getId());
            return true;
        }

        try {
            CronExpression cron = CronExpression.parse(cronExpression);
            LocalDateTime lastExecutionTime = check.getLastExecution().toLocalDateTime();
            LocalDateTime nextExecutionTime = cron.next(lastExecutionTime);
            
            return now.isAfter(nextExecutionTime);
        } catch (IllegalArgumentException e) {
            log.error("Invalid cron expression '{}' for check ID {}", cronExpression, check.getId(), e);
            return false;
        }
    }
    
    @Transactional
    public void processCheck(Check check) {
        log.info("Processing check ID: {} on thread {}", check.getId(), Thread.currentThread().getName());
        try {
            CheckResult result;
            String configJson = check.getConfig();
            String checkType = check.getType();
            String checkMode = getCheckMode(configJson);

            if ("HTTP".equalsIgnoreCase(checkType)) {
                if ("browser".equalsIgnoreCase(checkMode)) {
                    result = browserCheckExecutor.execute(configJson);
                } else {
                    result = httpCheckExecutor.execute(configJson);
                }
            } else if ("SSL".equalsIgnoreCase(checkType)) {
                result = sslCheckExecutor.execute(configJson);
            } else {
                log.warn("Unknown check type: {}", checkType);
                return;
            }

            sendRawMeasurementToKafka(check, result);
            handleStatusChangeAndUpdatePostgres(check, result);
        } catch (Exception e) {
            log.error("Exception processing check ID: {}", check.getId(), e);
        }
    }

    private String getCheckMode(String configJson) {
        try {
            JsonNode configNode = new ObjectMapper().readTree(configJson);
            if (configNode.has("check_mode")) {
                return configNode.get("check_mode").asText();
            }
        } catch (Exception e) {
            log.error("Error parsing check config to determine mode", e);
        }
        return "http"; // Default mode
    }

    private void sendRawMeasurementToKafka(Check check, CheckResult result) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("checkId", check.getId().toString());
            message.put("serviceId", check.getServiceId());
            message.put("timestamp", new Timestamp(System.currentTimeMillis()).toInstant().toString());
            message.put("latencyMs", result.getLatencyMs());
            if (result.getDomLoadTimeMs() != null) {
                message.put("domLoadTimeMs", result.getDomLoadTimeMs());
            }
            if (result.getTtfbMs() != null) {
                message.put("ttfbMs", result.getTtfbMs());
            }
            if (result.getSslExpiresInDays() != null) {
                message.put("sslExpiresInDays", result.getSslExpiresInDays());
            }
            message.put("responseCode", result.getResponseCode());
            message.put("statusText", result.getStatusText());
            message.put("success", result.isSuccess());
            if (result.getErrorMessage() != null) {
                message.put("errorMessage", result.getErrorMessage());
            }
            
            kafkaTemplate.send("raw-measurements", message);
            log.debug("Sent raw measurement to Kafka for check ID {}", check.getId());
        } catch (Exception e) {
            log.error("Failed to send raw measurement to Kafka for check ID {}", check.getId(), e);
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
    
    private void handleStatusChangeAndUpdatePostgres(Check check, CheckResult result) {
        Integer previousStatus = check.getLastStatus();
        boolean currentStatusOk = result.isSuccess();
        Integer newStatus = currentStatusOk ? 1 : 0;

        check.setLastStatus(newStatus);
        check.setLastLatencyMs((int) result.getLatencyMs());
        checkRepository.save(check);

        if (previousStatus == null || !previousStatus.equals(newStatus)) {
            log.warn("Status changed for serviceId '{}' from {} to {}. Sending update.",
                    check.getServiceId(), (previousStatus == null ? "UNKNOWN" : (previousStatus == 1 ? "OK" : "CRIT")), (newStatus == 1 ? "OK" : "CRIT"));

            ServiceStatusUpdateMessage message = ServiceStatusUpdateMessage.builder()
                    .checkId(check.getId().toString())
                    .serviceId(check.getServiceId())
                    .newStatus(newStatus == 1 ? "OK" : "CRIT")
                    .details(result.getErrorMessage() != null ? result.getErrorMessage() : result.getDetails())
                    .timestamp(java.time.Instant.now().toString())
                    .build();
            kafkaTemplate.send("service-status-updates", message);
        }
    }
}
