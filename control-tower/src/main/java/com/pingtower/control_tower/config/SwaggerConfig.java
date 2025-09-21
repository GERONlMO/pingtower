package com.pingtower.control_tower.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8082")
                                .description("🏗️ Direct Control Tower Access")
                                .variables(null),
                        new Server()
                                .url("http://localhost:8080")
                                .description("🚪 Via API Gateway (Recommended)")
                                .variables(null)
                ))
                .info(new Info()
                        .title("🏗️ PingTower Control Tower API")
                        .version("1.0.0")
                        .description("""
                                # 🎯 Control Tower Service
                                
                                **Control Tower** является центральным компонентом системы мониторинга PingTower.
                                
                                ## 🚀 Основные функции:
                                - 🏢 **Управление сервисами** - CRUD операции для мониторируемых сервисов
                                - 🔍 **Управление проверками** - настройка HTTP, Browser и SSL проверок
                                - 📊 **Real-time дашборд** - WebSocket подключения для live обновлений
                                - 📈 **Аналитика** - агрегация метрик из ClickHouse
                                - 🚨 **Система алертов** - уведомления в Telegram при сбоях
                                
                                ## 🔐 Аутентификация
                                Для доступа к API через Gateway требуется JWT токен:
                                1. Получите токен через `/auth/login` в Auth Service
                                2. Добавьте заголовок `Authorization: Bearer <token>`
                                
                                ## 🌐 WebSocket подключения
                                - **Endpoint**: `/ws/dashboard`
                                - **Протокол**: STOMP over SockJS
                                - **Подписки**: `/app/dashboard`, `/topic/dashboard`
                                
                                ## 📚 Дополнительная документация
                                - [Архитектура системы](https://github.com/pingtower/docs/architecture.md)
                                - [Примеры использования](https://github.com/pingtower/docs/examples.md)
                                """)
                        .termsOfService("https://pingtower.com/terms")
                        .contact(new Contact()
                                .name("🏗️ PingTower Development Team")
                                .email("dev@pingtower.com")
                                .url("https://github.com/pingtower/pingtower"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .externalDocs(new ExternalDocumentation()
                        .description("📖 PingTower Documentation")
                        .url("https://docs.pingtower.com"))
                .tags(List.of(
                        new Tag()
                                .name("Services")
                                .description("🏢 **Управление сервисами**\n\nCRUD операции для мониторируемых веб-сервисов. " +
                                           "Каждый сервис представляет собой веб-ресурс, который нужно мониторить."),
                        new Tag()
                                .name("Checks")
                                .description("🔍 **Управление проверками**\n\nНастройка и управление различными типами проверок: " +
                                           "HTTP, Browser automation, SSL certificates. Каждая проверка выполняется по расписанию."),
                        new Tag()
                                .name("Dashboard")
                                .description("📊 **Real-time дашборд**\n\nWebSocket API для получения данных дашборда в реальном времени. " +
                                           "Включает метрики производительности, статусы сервисов и алерты."),
                        new Tag()
                                .name("Analytics")
                                .description("📈 **Аналитика и метрики**\n\nАгрегированные данные из ClickHouse: uptime, " +
                                           "response time, error rates и другие метрики производительности.")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("🔐 JWT токен для аутентификации. Получите токен через Auth Service.")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
