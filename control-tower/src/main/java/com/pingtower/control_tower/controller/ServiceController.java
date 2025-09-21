package com.pingtower.control_tower.controller;

import com.pingtower.control_tower.domain.Service;
import com.pingtower.control_tower.model.dto.ServiceCreateRequest;
import com.pingtower.control_tower.repository.ServiceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
@Tag(name = "Services", description = "Service management endpoints")
public class ServiceController {

    @Autowired
    private ServiceRepository serviceRepository;

    @GetMapping
    @Operation(
            summary = "🏢 Получить все сервисы",
            description = """
                    Возвращает полный список всех мониторируемых сервисов с их текущими статусами.
                    
                    **Что возвращается:**
                    - Базовая информация о сервисе (ID, название, окружение)
                    - Текущий статус (OK, CRIT, UNKNOWN)
                    - Метрики производительности (если доступны)
                    - Время последней проверки
                    
                    **Использование:**
                    Этот endpoint используется для получения полного списка сервисов для отображения 
                    в административной панели или для синхронизации данных.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200", 
                    description = "✅ Список сервисов успешно получен",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(
                                    implementation = Service.class,
                                    example = "[{\"id\":\"google\",\"name\":\"Google Search\",\"environment\":\"production\",\"status\":1,\"lastStatusText\":\"OK\",\"lastCheck\":\"2024-01-15T10:30:00Z\"}]"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "500", 
                    description = "❌ Внутренняя ошибка сервера"
            )
    })
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID", description = "Retrieve a specific service by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Service found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Service.class))),
            @ApiResponse(responseCode = "404", description = "Service not found")
    })
    public ResponseEntity<Service> getServiceById(
            @Parameter(description = "Service ID", required = true)
            @PathVariable String id) {
        Optional<Service> service = serviceRepository.findById(id);
        return service.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(
            summary = "🏢 Создать новый сервис",
            description = """  
                    Создает новый сервис для мониторинга в системе PingTower.
                    
                    **Обязательные поля:**
                    - `id` - уникальный идентификатор сервиса (строка)
                    - `name` - человекочитаемое название сервиса
                    - `url` - URL для мониторинга
                    - `environment` - окружение (prod, stage, dev, test)
                    - `projectId` - UUID проекта, к которому относится сервис
                    
                    **Опциональные поля (значения по умолчанию):**
                    - `intervalSec` - интервал проверок в секундах (по умолчанию: 60)
                    - `timeoutSec` - таймаут запроса в секундах (по умолчанию: 5)
                    - `degradationThresholdMs` - порог деградации в мс (по умолчанию: 2000)
                    - `enabled` - включен ли мониторинг (по умолчанию: true)
                    
                    **После создания сервиса:**
                    1. Создайте проверки через `/api/checks`
                    2. Настройте алерты при необходимости
                    3. Сервис появится в дашборде
                    
                    **Примеры окружений:**
                    - `production` - продуктивное окружение
                    - `staging` - тестовое окружение
                    - `development` - окружение разработки
                    - `search`, `social`, `banking` - тематические категории
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200", 
                    description = "✅ Сервис успешно создан",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(
                                    implementation = Service.class,
                                    example = "{\"id\":\"my-api\",\"name\":\"My API Service\",\"url\":\"https://api.example.com\",\"environment\":\"production\",\"projectId\":\"a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5\",\"intervalSec\":60,\"timeoutSec\":5,\"degradationThresholdMs\":2000,\"enabled\":true}"
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400", 
                    description = "❌ Некорректные данные сервиса (отсутствуют обязательные поля или неверный формат)"
            ),
            @ApiResponse(
                    responseCode = "409", 
                    description = "⚠️ Сервис с таким ID уже существует"
            )
    })
    public Service createService(
            @Parameter(
                    description = "**Данные нового сервиса**\n\nОбъект со всеми необходимыми полями для создания сервиса", 
                    required = true,
                    example = "{\"id\":\"my-service\",\"name\":\"My Web Service\",\"url\":\"https://www.example.com\",\"environment\":\"production\",\"projectId\":\"a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5\",\"intervalSec\":60,\"timeoutSec\":5,\"degradationThresholdMs\":2000,\"enabled\":true}"
            )
            @RequestBody ServiceCreateRequest request) {
        Service service = new Service();
        service.setId(request.getId());
        service.setName(request.getName());
        service.setUrl(request.getUrl());
        service.setEnvironment(request.getEnvironment());
        service.setProjectId(request.getProjectId());
        
        // Устанавливаем значения по умолчанию для опциональных полей
        service.setIntervalSec(request.getIntervalSec() != null ? request.getIntervalSec() : 60);
        service.setTimeoutSec(request.getTimeoutSec() != null ? request.getTimeoutSec() : 5);
        service.setDegradationThresholdMs(request.getDegradationThresholdMs() != null ? request.getDegradationThresholdMs() : 2000);
        service.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
        
        return serviceRepository.save(service);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "🔄 Обновить сервис",
            description = """
                    Обновляет существующий сервис в системе мониторинга.
                    
                    **Обновляемые поля:**
                    - `name` - название сервиса
                    - `url` - URL для мониторинга
                    - `environment` - окружение
                    - `intervalSec` - интервал проверок в секундах
                    - `timeoutSec` - таймаут запроса в секундах
                    - `degradationThresholdMs` - порог деградации в миллисекундах
                    - `enabled` - включен ли мониторинг
                    
                    **Примечание:** Поля `id` и `projectId` не могут быть изменены после создания.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "✅ Сервис успешно обновлен",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Service.class))),
            @ApiResponse(responseCode = "404", description = "❌ Сервис не найден")
    })
    public ResponseEntity<Service> updateService(
            @Parameter(description = "ID сервиса для обновления", required = true)
            @PathVariable String id,
            @Parameter(description = "Обновленные данные сервиса", required = true)
            @RequestBody ServiceCreateRequest request) {
        return serviceRepository.findById(id)
                .map(service -> {
                    // Обновляем только разрешенные поля
                    service.setName(request.getName());
                    service.setUrl(request.getUrl());
                    service.setEnvironment(request.getEnvironment());
                    
                    // Обновляем опциональные поля, если они переданы
                    if (request.getIntervalSec() != null) {
                        service.setIntervalSec(request.getIntervalSec());
                    }
                    if (request.getTimeoutSec() != null) {
                        service.setTimeoutSec(request.getTimeoutSec());
                    }
                    if (request.getDegradationThresholdMs() != null) {
                        service.setDegradationThresholdMs(request.getDegradationThresholdMs());
                    }
                    if (request.getEnabled() != null) {
                        service.setEnabled(request.getEnabled());
                    }
                    
                    Service updatedService = serviceRepository.save(service);
                    return ResponseEntity.ok(updatedService);
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete service", description = "Delete a service and all its checks")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Service deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Service not found")
    })
    public ResponseEntity<Void> deleteService(
            @Parameter(description = "Service ID", required = true)
            @PathVariable String id) {
        return serviceRepository.findById(id)
                .map(service -> {
                    serviceRepository.delete(service);
                    return ResponseEntity.ok().<Void>build();
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
