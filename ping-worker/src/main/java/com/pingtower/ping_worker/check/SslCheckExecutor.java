package com.pingtower.ping_worker.check;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.net.ssl.HttpsURLConnection;
import java.net.URL;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.time.Instant;
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
            String urlString = config.get("url").asText();
            URL url = new URL(urlString);
            String host = url.getHost();
            int port = (url.getPort() != -1) ? url.getPort() : 443;

            HttpsURLConnection conn = (HttpsURLConnection) new URL("https://" + host + ":" + port).openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.connect();

            Certificate[] certs = conn.getServerCertificates();
            if (certs.length == 0 || !(certs[0] instanceof X509Certificate)) {
                throw new IllegalStateException("No valid X509 certificates found.");
            }

            X509Certificate cert = (X509Certificate) certs[0];
            Date expiryDate = cert.getNotAfter();
            long daysUntilExpiry = Duration.between(Instant.now(), expiryDate.toInstant()).toDays();
            
            long latency = System.currentTimeMillis() - startTime;

            if (daysUntilExpiry <= 0) {
                 return CheckResult.builder()
                    .success(false)
                    .statusText("Expired")
                    .latencyMs(latency)
                    .sslExpiresInDays(daysUntilExpiry)
                    .errorMessage("SSL certificate has expired.")
                    .build();
            }

            return CheckResult.builder()
                    .success(true)
                    .statusText("Valid")
                    .latencyMs(latency)
                    .sslExpiresInDays(daysUntilExpiry)
                    .details("Expires on: " + expiryDate)
                    .build();

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("SSL check failed with exception: {}", e.getMessage());
            return CheckResult.builder()
                    .success(false)
                    .statusText("Error")
                    .latencyMs(latency)
                    .errorMessage(e.getClass().getSimpleName() + ": " + e.getMessage())
                    .build();
        }
    }
}
