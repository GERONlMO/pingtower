package com.pingtower.ping_worker.check;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
@Slf4j
public class HttpCheckExecutor {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public HttpCheckExecutor(ObjectMapper objectMapper) {
        this.webClient = WebClient.create();
        this.objectMapper = objectMapper;
    }

    public CheckResult execute(String configJson) {
        long startTime = System.currentTimeMillis();
        try {
            JsonNode config = objectMapper.readTree(configJson);
            
            if (!config.has("url")) {
                throw new IllegalArgumentException("Missing 'url' in HTTP check config");
            }
            String url = config.get("url").asText();
            String method = config.has("method") ? config.get("method").asText("GET") : "GET";
            int timeout = config.has("timeout") ? config.get("timeout").asInt(5000) : 5000;
            int expectedCode = config.has("expected_code") ? config.get("expected_code").asInt(200) : 200;

            // For simplicity, we are using a blocking call here.
            // In a real high-throughput scenario, the whole flow should be reactive.
            Integer actualCode = webClient.method(org.springframework.http.HttpMethod.valueOf(method.toUpperCase()))
                    .uri(url)
                    .exchangeToMono(response -> Mono.just(response.statusCode().value()))
                    .timeout(Duration.ofMillis(timeout))
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(1)).maxBackoff(Duration.ofSeconds(5)))
                    .block();

            long latency = System.currentTimeMillis() - startTime;

            if (actualCode != null && actualCode == expectedCode) {
                return CheckResult.builder()
                        .success(true)
                        .responseCode(actualCode)
                        .latencyMs(latency)
                        .build();
            } else {
                return CheckResult.builder()
                        .success(false)
                        .responseCode(actualCode != null ? actualCode : 0)
                        .latencyMs(latency)
                        .errorMessage("Expected status code " + expectedCode + " but got " + actualCode)
                        .build();
            }

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("HTTP check failed with exception: {}", e.getMessage());
            return CheckResult.builder()
                    .success(false)
                    .responseCode(0)
                    .latencyMs(latency)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }
}
