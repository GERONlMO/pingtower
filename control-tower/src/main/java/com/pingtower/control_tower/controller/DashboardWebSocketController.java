package com.pingtower.control_tower.controller;

import com.pingtower.control_tower.service.DashboardDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class DashboardWebSocketController {
    
    private final DashboardDataService dashboardDataService;

    /**
     * This method is invoked when a client subscribes to the "/app/dashboard" destination.
     * It immediately returns the full snapshot of the dashboard data to that client.
     */
    @SubscribeMapping("/dashboard")
    public List<com.pingtower.control_tower.model.dto.DashboardServiceDto> getDashboardSnapshot() {
        return dashboardDataService.getDashboardSnapshot();
    }

    /**
     * Example of a client-to-server message. A client can send a message to "/app/refresh"
     * to trigger a broadcast of the full snapshot to all subscribers of "/topic/dashboard".
     * This is useful for manual refresh buttons.
     */
    @MessageMapping("/refresh")
    @SendTo("/topic/dashboard")
    public List<com.pingtower.control_tower.model.dto.DashboardServiceDto> refreshDashboard() {
        return dashboardDataService.getDashboardSnapshot();
    }
}
