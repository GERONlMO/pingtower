package com.pingtower.ping_worker.check;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
@Slf4j
public class SslCheckExecutor {

    private final ObjectMapper objectMapper;

    public SslCheckExecutor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public CheckResult execute(String configJson) {
        long startTime = System.currentTimeMillis();
        try {
            JsonNode config = objectMapper.readTree(configJson);
            String host = config.get("host").asText();
            int port = config.get("port").asInt(443);
            int critDays = config.get("crit_days").asInt(7);

            SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
            try (SSLSocket socket = (SSLSocket) factory.createSocket(host, port)) {
                socket.startHandshake();
                X509Certificate cert = (X509Certificate) socket.getSession().getPeerCertificates()[0];
                Date expiryDate = cert.getNotAfter();
                long daysUntilExpiry = ChronoUnit.DAYS.between(Instant.now(), expiryDate.toInstant());
                long latency = System.currentTimeMillis() - startTime;

                if (daysUntilExpiry < 0) {
                    return CheckResult.builder()
                            .success(false)
                            .latencyMs(latency)
                            .errorMessage("Certificate for " + host + " has expired.")
                            .build();
                } else if (daysUntilExpiry < critDays) {
                    // This can be considered a failure or a warning depending on business logic.
                    // Here we'll treat it as a failure.
                    return CheckResult.builder()
                            .success(false)
                            .latencyMs(latency)
                            .errorMessage("Certificate for " + host + " expires in " + daysUntilExpiry + " days (less than critical threshold " + critDays + " days).")
                            .build();
                } else {
                    return CheckResult.builder()
                            .success(true)
                            .latencyMs(latency)
                            .responseCode((int) daysUntilExpiry) // Using responseCode to store days left
                            .build();
                }
            }
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("SSL check for failed with exception: {}", e.getMessage());
            return CheckResult.builder()
                    .success(false)
                    .latencyMs(latency)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }
}
