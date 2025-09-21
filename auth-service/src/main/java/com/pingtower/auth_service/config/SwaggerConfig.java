package com.pingtower.auth_service.config;

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
                                .url("http://localhost:8081")
                                .description("🔐 Direct Auth Service Access"),
                        new Server()
                                .url("http://localhost:8080")
                                .description("🚪 Via API Gateway (Recommended)")
                ))
                .info(new Info()
                        .title("🔐 PingTower Auth Service API")
                        .version("1.0.0")
                        .description("""
                                # 🛡️ Authentication Service
                                
                                **Auth Service** отвечает за аутентификацию и авторизацию в системе PingTower.
                                
                                ## 🔑 Основные функции:
                                - 🔐 **Аутентификация пользователей** - проверка логина и пароля
                                - 🎫 **Генерация JWT токенов** - создание безопасных токенов для API доступа
                                - ✅ **Валидация токенов** - проверка действительности JWT токенов
                                - 🚪 **Управление сессиями** - выход из системы и инвалидация токенов
                                
                                ## 🔄 Жизненный цикл токена:
                                1. **Логин** → получение JWT токена
                                2. **Использование** → передача токена в заголовке Authorization
                                3. **Валидация** → проверка токена API Gateway'ем
                                4. **Логаут** → инвалидация токена
                                
                                ## 🛡️ Безопасность:
                                - JWT токены имеют ограниченный срок действия (1 час)
                                - Все пароли хешируются перед сохранением
                                - Поддержка refresh токенов для продления сессии
                                - Rate limiting для предотвращения brute force атак
                                
                                ## 📋 Тестовые учетные данные:
                                - **Username**: `admin`
                                - **Password**: `password`
                                
                                ⚠️ **Важно**: В production окружении обязательно измените пароли по умолчанию!
                                """)
                        .termsOfService("https://pingtower.com/terms")
                        .contact(new Contact()
                                .name("🔐 PingTower Security Team")
                                .email("security@pingtower.com")
                                .url("https://github.com/pingtower/auth-service"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .externalDocs(new ExternalDocumentation()
                        .description("🔒 Security Documentation")
                        .url("https://docs.pingtower.com/security"))
                .tags(List.of(
                        new Tag()
                                .name("Authentication")
                                .description("🔐 **Аутентификация**\\n\\nОсновные операции для входа в систему, " +
                                           "получения и управления JWT токенами. Все endpoint'ы этой группы " +
                                           "не требуют предварительной аутентификации.")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("🎫 JWT токен, полученный через /auth/login. " +
                                           "Формат: 'Bearer <token>'")));
    }
}
