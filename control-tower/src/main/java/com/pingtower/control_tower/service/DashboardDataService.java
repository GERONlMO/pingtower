package com.pingtower.control_tower.service;

import com.pingtower.control_tower.domain.Service;
import com.pingtower.control_tower.model.dto.ClickHouseMetricsDto;
import com.pingtower.control_tower.model.dto.DashboardServiceDto;
import com.pingtower.control_tower.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class DashboardDataService {

    private final ServiceRepository serviceRepository;

    @Qualifier("clickhouseJdbcTemplate")
    private final JdbcTemplate clickhouseJdbcTemplate;

    public List<DashboardServiceDto> getDashboardSnapshot() {
        List<Service> services = serviceRepository.findAll();
        if (services.isEmpty()) {
            return Collections.emptyList();
        }
        
        Map<String, ClickHouseMetricsDto> metricsMap = getMetricsForServices(
                services.stream().map(Service::getId).collect(Collectors.toList())
        );

        return services.stream()
                .map(service -> toDashboardDto(service, metricsMap.get(service.getId())))
                .collect(Collectors.toList());
    }

    public DashboardServiceDto getUpdatedService(String serviceId) {
        Service service = serviceRepository.findById(serviceId).orElse(null);
        if (service == null) {
            return null;
        }
        Map<String, ClickHouseMetricsDto> metricsMap = getMetricsForServices(Collections.singletonList(serviceId));
        return toDashboardDto(service, metricsMap.get(serviceId));
    }

    private Map<String, ClickHouseMetricsDto> getMetricsForServices(List<String> serviceIds) {
        if (serviceIds == null || serviceIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String inClause = serviceIds.stream().map(id -> "'" + id + "'").collect(Collectors.joining(","));
        String sql = String.format(
            "SELECT " +
            "    serviceId, " +
            "    quantile(0.95)(latencyMs) as p95, " +
            "    avg(latencyMs) as avg, " +
            "    countIf(success = true) as okCount, " +
            "    count() as totalCount " +
            "FROM measurements " +
            "WHERE serviceId IN (%s) AND timestamp > now() - INTERVAL 1 DAY " +
            "GROUP BY serviceId", inClause);
        
        try {
            return clickhouseJdbcTemplate.query(sql, (rs) -> {
                Map<String, ClickHouseMetricsDto> map = new java.util.HashMap<>();
                while (rs.next()) {
                    String serviceId = rs.getString("serviceId");
                    ClickHouseMetricsDto metrics = new ClickHouseMetricsDto(
                        rs.getDouble("p95"),
                        rs.getDouble("avg"),
                        rs.getLong("okCount"),
                        rs.getLong("totalCount")
                    );
                    map.put(serviceId, metrics);
                }
                return map;
            });
        } catch (Exception e) {
            log.error("Failed to fetch metrics from ClickHouse", e);
            return Collections.emptyMap();
        }
    }

    private DashboardServiceDto toDashboardDto(Service service, ClickHouseMetricsDto metrics) {
        if (metrics == null) {
            metrics = new ClickHouseMetricsDto(0, 0, 0, 0);
        }

        double uptime = (metrics.getTotalCount() > 0) ? (double) metrics.getOkCount() / metrics.getTotalCount() * 100 : 0.0;

        return DashboardServiceDto.builder()
                .id(service.getId())
                .n(service.getName())
                .e(service.getEnvironment())
                .st(service.getStatus())
                .p95(metrics.getP95())
                .avg(metrics.getAvg())
                .up(uptime)
                .ok(metrics.getOkCount())
                .lc(service.getLastCheck())
                .io(service.getStatus() != null && service.getStatus() == 1)
                .build();
    }
}
