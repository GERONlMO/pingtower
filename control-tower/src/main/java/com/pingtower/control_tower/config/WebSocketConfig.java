package com.pingtower.control_tower.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Defines the prefix for topics that clients can subscribe to.
        // Messages sent by the server will be on destinations with this prefix.
        config.enableSimpleBroker("/topic");
        // Defines the prefix for server-bound messages.
        // Messages from clients (e.g., to trigger an action) will be sent to destinations with this prefix.
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registers the WebSocket endpoint that clients will connect to.
        // withSockJS() enables fallback options for browsers that don't support WebSocket.
        registry.addEndpoint("/ws/dashboard")
                .setAllowedOriginPatterns("*") // Consistent with SecurityConfig
                .withSockJS();
    }
}
