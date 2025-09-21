package com.pingtower.control_tower.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        name = "ServiceCreateRequest",
        description = "🏗️ **Запрос на создание сервиса**\n\nСодержит все необходимые данные для создания нового мониторируемого сервиса"
)
public class ServiceCreateRequest {

    @Schema(
            description = "🆔 **Уникальный идентификатор сервиса**\n\n" +
                         "Должен быть уникальным в рамках всей системы. Рекомендуется использовать " +
                         "короткие, понятные имена без пробелов (например: 'google', 'my-api', 'payment-service')",
            example = "google-search",
            required = true,
            pattern = "^[a-z0-9-]+$",
            minLength = 2,
            maxLength = 50
    )
    private String id;

    @Schema(
            description = "📝 **Человекочитаемое название сервиса**\n\n" +
                         "Отображается в дашборде и отчетах. Может содержать пробелы и специальные символы",
            example = "Google Search Engine",
            required = true,
            minLength = 1,
            maxLength = 100
    )
    private String name;

    @Schema(
            description = "🌍 **Окружение или категория сервиса**\n\n" +
                         "Используется для группировки сервисов в дашборде. Может быть техническим окружением " +
                         "(prod, stage, dev) или тематической категорией (search, social, banking)",
            example = "production",
            required = true,
            allowableValues = {
                "production", "staging", "development", "test",
                "search", "social", "banking", "marketplace", 
                "government", "news", "tech", "entertainment", "education"
            }
    )
    private String environment;

    @Schema(
            description = "🏗️ **UUID проекта**\n\n" +
                         "Идентификатор проекта, к которому относится сервис. Используется для группировки " +
                         "и разграничения доступа к сервисам",
            example = "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
            required = true,
            format = "uuid"
    )
    private UUID projectId;

    @Schema(
            description = "🌐 **URL для мониторинга**\n\n" +
                         "Полный URL сайта или API endpoint'а, который нужно мониторить. " +
                         "Должен включать протокол (http:// или https://)",
            example = "https://www.google.com",
            required = true,
            format = "uri"
    )
    private String url;

    @Schema(
            description = "⏰ **Интервал проверок в секундах**\n\n" +
                         "Как часто выполнять проверки сервиса. Рекомендуемые значения: " +
                         "60-300 секунд для production, 30-60 для staging",
            example = "60",
            required = false,
            defaultValue = "60",
            minimum = "10",
            maximum = "3600"
    )
    private Integer intervalSec;

    @Schema(
            description = "⏱️ **Таймаут запроса в секундах**\n\n" +
                         "Максимальное время ожидания ответа от сервиса. " +
                         "Если сервис не отвечает в течение этого времени, проверка считается неудачной",
            example = "5",
            required = false,
            defaultValue = "5",
            minimum = "1",
            maximum = "60"
    )
    private Integer timeoutSec;

    @Schema(
            description = "📊 **Порог деградации в миллисекундах**\n\n" +
                         "Максимальное время отклика, после которого сервис считается деградированным. " +
                         "Используется для алертов о медленной работе",
            example = "2000",
            required = false,
            defaultValue = "2000",
            minimum = "100",
            maximum = "30000"
    )
    private Integer degradationThresholdMs;

    @Schema(
            description = "✅ **Включен ли мониторинг**\n\n" +
                         "Определяет, активен ли мониторинг для данного сервиса. " +
                         "Отключенные сервисы не проверяются и не генерируют алерты",
            example = "true",
            required = false,
            defaultValue = "true"
    )
    private Boolean enabled;
}
