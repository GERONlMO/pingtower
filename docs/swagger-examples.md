# 📚 Swagger API Examples - PingTower

## 🎯 Обзор улучшенной документации

Наша Swagger документация включает:

- 🎨 **Красивое оформление** с эмодзи и структурированными описаниями
- 📝 **Детальные примеры** для каждого endpoint'а
- 🔍 **Интерактивные схемы** с валидацией полей
- 🛡️ **Документация по безопасности** с примерами токенов
- 🌐 **Многосерверная конфигурация** (прямой доступ и через Gateway)

## 🔗 Доступ к документации

### Control Tower API
- **URL**: http://localhost:8082/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8082/v3/api-docs
- **Описание**: Основной API для управления сервисами и проверками

### Auth Service API  
- **URL**: http://localhost:8081/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8081/v3/api-docs
- **Описание**: API аутентификации и управления токенами

## 📋 Примеры использования

### 🔐 Аутентификация

#### 1. Вход в систему
```bash
curl -X POST "http://localhost:8081/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "username": "admin",
    "role": "ADMIN",
    "permissions": ["READ", "WRITE", "DELETE"],
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Валидация токена
```bash
curl -X POST "http://localhost:8081/auth/validate" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 🏢 Управление сервисами

#### 1. Создание сервиса
```bash
curl -X POST "http://localhost:8082/api/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "id": "google-search",
    "name": "Google Search Engine", 
    "environment": "production",
    "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
  }'
```

#### 2. Получение всех сервисов
```bash
curl -X GET "http://localhost:8082/api/services" \
  -H "Authorization: Bearer <your-token>"
```

## 🎨 Особенности нашей документации

### 1. Эмодзи и визуальное оформление
- 🏗️ Control Tower API
- 🔐 Auth Service API
- 🏢 Services (Сервисы)
- 🔍 Checks (Проверки)
- 📊 Dashboard (Дашборд)

### 2. Детальные описания
Каждый endpoint содержит:
- **Краткое описание** с эмодзи
- **Подробное объяснение** функциональности
- **Примеры использования** с реальными данными
- **Коды ошибок** с объяснениями
- **Требования к безопасности**

### 3. Схемы данных с валидацией
```yaml
ServiceCreateRequest:
  type: object
  required:
    - id
    - name
    - environment
    - projectId
  properties:
    id:
      type: string
      pattern: "^[a-z0-9-]+$"
      minLength: 2
      maxLength: 50
      description: "🆔 Уникальный идентификатор сервиса"
      example: "google-search"
```

### 4. Многосерверная конфигурация
- **🏗️ Direct Control Tower Access** (localhost:8082)
- **🚪 Via API Gateway** (localhost:8080) - рекомендуется

### 5. Безопасность
- **JWT Bearer токены** с автоматической валидацией
- **Примеры токенов** в документации
- **Описание процесса аутентификации**

## 🛠️ Интерактивные возможности

### 1. Try it out
- Нажмите "Try it out" для любого endpoint'а
- Заполните параметры в интерактивной форме
- Выполните запрос прямо из браузера

### 2. Автоматическая авторизация
- Получите токен через `/auth/login`
- Нажмите "Authorize" в верхней части Swagger UI
- Введите токен в формате `Bearer <token>`
- Все последующие запросы будут авторизованы автоматически

### 3. Валидация данных
- Swagger автоматически валидирует входные данные
- Показывает ошибки валидации в реальном времени
- Подсказывает правильный формат данных

## 📊 Структура тегов

### Control Tower API
1. **🏢 Services** - Управление сервисами
2. **🔍 Checks** - Управление проверками  
3. **📊 Dashboard** - Real-time дашборд
4. **📈 Analytics** - Аналитика и метрики

### Auth Service API
1. **🔐 Authentication** - Аутентификация и токены

## 🔧 Настройка Swagger UI

### Конфигурация в application.yml
```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
    tagsSorter: alpha
  show-actuator: true
```

### Кастомизация внешнего вида
Наша конфигурация включает:
- Сортировку операций по HTTP методам
- Сортировку тегов по алфавиту
- Отображение Actuator endpoint'ов
- Кастомные цвета и стили

## 🚀 Продвинутые возможности

### 1. Экспорт документации
```bash
# Экспорт в JSON
curl http://localhost:8082/v3/api-docs > control-tower-api.json

# Экспорт в YAML
curl -H "Accept: application/yaml" http://localhost:8082/v3/api-docs > control-tower-api.yaml
```

### 2. Генерация клиентского кода
```bash
# Использование OpenAPI Generator
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8082/v3/api-docs \
  -g typescript-axios \
  -o ./generated-client
```

### 3. Интеграция с Postman
1. Откройте Postman
2. Import → Link → введите `http://localhost:8082/v3/api-docs`
3. Получите готовую коллекцию запросов

## 🎯 Best Practices

### 1. Описания endpoint'ов
- Используйте эмодзи для визуального разделения
- Включайте примеры использования
- Описывайте бизнес-логику, а не только технические детали
- Указывайте возможные сценарии ошибок

### 2. Схемы данных
- Добавляйте валидацию для всех полей
- Используйте осмысленные примеры
- Документируйте ограничения и форматы
- Включайте описания бизнес-правил

### 3. Безопасность
- Документируйте требования к аутентификации
- Приводите примеры токенов (замаскированные)
- Объясняйте процесс получения доступа
- Указывайте области действия токенов

### 4. Примеры ответов
- Показывайте реальные структуры данных
- Включайте как успешные, так и ошибочные ответы
- Документируйте все возможные HTTP коды
- Добавляйте контекст для каждого типа ответа

## 🔍 Отладка и тестирование

### Полезные URL'ы для разработки
```bash
# Проверка здоровья сервисов
curl http://localhost:8082/actuator/health
curl http://localhost:8081/actuator/health

# Метрики Prometheus
curl http://localhost:8082/actuator/prometheus
curl http://localhost:8081/actuator/prometheus

# Информация о приложении
curl http://localhost:8082/actuator/info
curl http://localhost:8081/actuator/info
```

Эта документация поможет вам максимально эффективно использовать наш улучшенный Swagger UI для разработки и тестирования API PingTower!
