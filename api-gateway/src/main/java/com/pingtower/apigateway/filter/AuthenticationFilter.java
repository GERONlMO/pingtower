package com.pingtower.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationFilter.class);
    private final WebClient.Builder webClientBuilder;

    @Autowired
    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Only apply filter to paths that require authentication
        if (!path.startsWith("/api/")) {
            return chain.filter(exchange);
        }

        log.debug("Authentication required for path: {}", path);

        // Check for Authorization header
        if (!request.getHeaders().containsKey("Authorization")) {
            log.warn("Missing Authorization header for path: {}", path);
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getOrEmpty("Authorization").get(0);

        // Check if header is in "Bearer <token>" format
        if (!authHeader.startsWith("Bearer ")) {
            log.warn("Invalid Authorization header format for path: {}", path);
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        String jwtToken = authHeader.substring(7);

        // Call auth-service to validate the token
        return webClientBuilder.build().get()
                .uri("http://auth-service:8080/auth/validate")
                .header("Authorization", "Bearer " + jwtToken)
                .retrieve()
                .toBodilessEntity()
                .flatMap(responseEntity -> {
                    if (responseEntity.getStatusCode().is2xxSuccessful()) {
                        log.debug("Token validation successful for path: {}", path);
                        return chain.filter(exchange);
                    } else {
                        log.warn("Token validation failed with status {} for path: {}", responseEntity.getStatusCode(), path);
                        return onError(exchange, HttpStatus.UNAUTHORIZED);
                    }
                })
                .onErrorResume(e -> {
                    log.error("Error while validating token for path: {}", path, e);
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                });
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Execute this filter before others
    }
}
