package com.pingtower.ping_worker.check;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

@Component
@Slf4j
public class HttpCheckExecutor {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public HttpCheckExecutor(ObjectMapper objectMapper) {
        // Configure HttpClient to follow redirects and set a longer connection timeout
        HttpClient httpClient = HttpClient.create()
                .option(io.netty.channel.ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000) // 10 seconds
                .followRedirect(true);

        this.webClient = WebClient.builder()
                .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(httpClient))
                .build();
        this.objectMapper = objectMapper;
    }

    public CheckResult execute(String configJson) {
        long startTime = System.currentTimeMillis();
        AtomicLong ttfb = new AtomicLong(0); // Using AtomicLong to be accessible from lambda

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
            org.springframework.web.reactive.function.client.ClientResponse clientResponse = webClient.method(org.springframework.http.HttpMethod.valueOf(method.toUpperCase()))
                    .uri(url)
                    .header("User-Agent", "PingTower/1.0 (Java " + System.getProperty("java.version") + ")")
                    .exchangeToMono(response -> {
                        ttfb.set(System.currentTimeMillis() - startTime); // Set TTFB when first response packet is received
                        return Mono.just(response);
                    })
                    .timeout(Duration.ofMillis(timeout))
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(1)).maxBackoff(Duration.ofSeconds(5)))
                    .block();

            long latency = System.currentTimeMillis() - startTime;
            
            if (clientResponse == null) {
                return CheckResult.builder()
                        .success(false)
                        .responseCode(0)
                        .statusText("Timeout")
                        .latencyMs(latency)
                        .ttfbMs(ttfb.get())
                        .errorMessage("Request timed out after " + timeout + "ms")
                        .build();
            }

            int actualCode = clientResponse.statusCode().value();
            String statusText = actualCode + " " + clientResponse.statusCode().toString();

            boolean isSuccess = (actualCode >= 200 && actualCode < 400); // Success on 2xx and 3xx codes

            return CheckResult.builder()
                    .success(isSuccess)
                    .responseCode(actualCode)
                    .statusText(statusText)
                    .latencyMs(latency)
                    .ttfbMs(ttfb.get())
                    .details(isSuccess ? "Request successful" : "Request failed with non-2xx/3xx status code")
                    .errorMessage(isSuccess ? null : "Expected status code 2xx or 3xx but got " + actualCode)
                    .build();

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("HTTP check failed with exception: {}", e.getMessage());
            return CheckResult.builder()
                    .success(false)
                    .responseCode(0)
                    .statusText("Exception")
                    .latencyMs(latency)
                    .ttfbMs(ttfb.get())
                    .errorMessage(e.getMessage())
                    .build();
        }
    }
}
