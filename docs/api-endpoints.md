# 📡 PingTower API Endpoints

## Обзор

PingTower предоставляет RESTful API для управления сервисами мониторинга. Все API endpoint'ы документированы через OpenAPI/Swagger и доступны через интерактивную документацию.

## 🔗 Swagger UI

- **Control Tower**: http://localhost:8082/swagger-ui.html
- **Auth Service**: http://localhost:8081/swagger-ui.html
- **API Gateway**: http://localhost:8080 (проксирует запросы к сервисам)

## 🔐 Аутентификация

### Auth Service (Port 8081)

#### POST /auth/login
Аутентификация пользователя и получение JWT токена.

**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "username": "admin",
    "role": "ADMIN"
  }
}
```

#### POST /auth/validate
Валидация JWT токена.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "username": "admin",
    "role": "ADMIN"
  }
}
```

#### POST /auth/logout
Выход из системы (инвалидация токена).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

## 🏢 Управление сервисами

### Control Tower (Port 8082)

#### GET /api/services
Получить список всех сервисов.

**Response (200):**
```json
[
  {
    "id": "google",
    "name": "Google",
    "environment": "search",
    "status": 1,
    "lastStatusText": "OK",
    "lastDomLoadTimeMs": 1200,
    "lastTtfbMs": 150,
    "sslExpiresInDays": 365,
    "lastCheck": "2024-01-15T10:30:00Z",
    "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
  }
]
```

#### GET /api/services/{id}
Получить конкретный сервис по ID.

**Parameters:**
- `id` (path) - ID сервиса

**Response (200):**
```json
{
  "id": "google",
  "name": "Google",
  "environment": "search",
  "status": 1,
  "lastStatusText": "OK",
  "lastDomLoadTimeMs": 1200,
  "lastTtfbMs": 150,
  "sslExpiresInDays": 365,
  "lastCheck": "2024-01-15T10:30:00Z",
  "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
}
```

#### POST /api/services
Создать новый сервис.

**Request:**
```json
{
  "id": "my-service",
  "name": "My Service",
  "environment": "prod",
  "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
}
```

**Response (200):**
```json
{
  "id": "my-service",
  "name": "My Service",
  "environment": "prod",
  "status": null,
  "lastStatusText": null,
  "lastDomLoadTimeMs": null,
  "lastTtfbMs": null,
  "sslExpiresInDays": null,
  "lastCheck": null,
  "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
}
```

#### PUT /api/services/{id}
Обновить существующий сервис.

**Parameters:**
- `id` (path) - ID сервиса

**Request:**
```json
{
  "name": "Updated Service Name",
  "environment": "staging"
}
```

**Response (200):**
```json
{
  "id": "my-service",
  "name": "Updated Service Name",
  "environment": "staging",
  "status": 1,
  "lastStatusText": "OK",
  "lastDomLoadTimeMs": 1200,
  "lastTtfbMs": 150,
  "sslExpiresInDays": 365,
  "lastCheck": "2024-01-15T10:30:00Z",
  "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
}
```

#### DELETE /api/services/{id}
Удалить сервис.

**Parameters:**
- `id` (path) - ID сервиса

**Response (200):** Empty body

## 🔍 Управление проверками

#### GET /api/checks
Получить список всех проверок.

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "serviceId": "google",
    "type": "HTTP",
    "enabled": true,
    "schedule": "*/30 * * * * ?",
    "config": "{\"url\":\"https://google.com\",\"method\":\"GET\",\"expected_code\":200}",
    "lastRun": "2024-01-15T10:30:00Z",
    "nextRun": "2024-01-15T10:30:30Z"
  }
]
```

#### GET /api/checks/{id}
Получить конкретную проверку по ID.

**Parameters:**
- `id` (path) - UUID проверки

#### POST /api/checks
Создать новую проверку.

**Request:**
```json
{
  "serviceId": "my-service",
  "type": "HTTP",
  "enabled": true,
  "schedule": "*/30 * * * * ?",
  "config": "{\"url\":\"https://example.com\",\"method\":\"GET\",\"expected_code\":200}"
}
```

#### PUT /api/checks/{id}
Обновить существующую проверку.

#### DELETE /api/checks/{id}
Удалить проверку.

## 📊 WebSocket API

### Dashboard WebSocket

**Endpoint:** `ws://localhost:8082/ws/dashboard`

#### Подключение
```javascript
const socket = new SockJS('http://localhost:8082/ws/dashboard');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
});
```

#### Подписка на обновления дашборда
```javascript
stompClient.subscribe('/app/dashboard', function (message) {
    const snapshot = JSON.parse(message.body);
    // Получение полного снимка дашборда при подписке
});

stompClient.subscribe('/topic/dashboard', function (message) {
    const updates = JSON.parse(message.body);
    // Получение real-time обновлений
});
```

#### Запрос обновления
```javascript
stompClient.send('/app/refresh', {}, JSON.stringify({}));
```

#### Формат данных дашборда
```json
[
  {
    "id": "google",
    "n": "Google",
    "e": "search",
    "st": "OK",
    "p95": 245.5,
    "avg": 180.2,
    "up": 99.95,
    "ok": 2879,
    "dlt": 1200,
    "ttfb": 150,
    "ssl": 365,
    "lc": "2024-01-15T10:30:00Z",
    "io": true
  }
]
```

**Поля:**
- `id` - ID сервиса
- `n` - название (name)
- `e` - окружение (environment)
- `st` - статус (status)
- `p95` - 95-й перцентиль latency
- `avg` - средняя latency
- `up` - uptime процент
- `ok` - количество успешных проверок
- `dlt` - DOM Load Time
- `ttfb` - Time to First Byte
- `ssl` - дней до истечения SSL
- `lc` - время последней проверки (lastCheck)
- `io` - онлайн статус (isOnline)

## 📈 Reporting Service (Port 8083)

### GET /reports/uptime/{serviceId}
Отчет по uptime для конкретного сервиса.

### GET /reports/performance/{serviceId}
Отчет по производительности.

### GET /reports/summary
Общий отчет по всем сервисам.

## 🚪 API Gateway (Port 8080)

API Gateway проксирует все запросы к соответствующим сервисам:

- `/auth/**` → Auth Service (8081)
- `/api/**` → Control Tower (8082)
- `/reports/**` → Reporting Service (8083)

### Аутентификация через Gateway

Для всех `/api/**` endpoint'ов требуется JWT токен:

```bash
# 1. Получить токен
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 2. Использовать токен для API запросов
curl -X GET http://localhost:8080/api/services \
  -H "Authorization: Bearer <jwt-token>"
```

## ❌ Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Неверные данные запроса |
| 401 | Не авторизован (нет или неверный JWT токен) |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

## 📝 Примеры использования

### Создание полного сервиса с проверками

```bash
# 1. Получить JWT токен
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq -r '.token')

# 2. Создать сервис
curl -X POST http://localhost:8080/api/services \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-api",
    "name": "My API Service",
    "environment": "production",
    "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
  }'

# 3. Создать HTTP проверку
curl -X POST http://localhost:8080/api/checks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "my-api",
    "type": "HTTP",
    "enabled": true,
    "schedule": "*/30 * * * * ?",
    "config": "{\"url\":\"https://my-api.com/health\",\"method\":\"GET\",\"expected_code\":200}"
  }'

# 4. Создать SSL проверку
curl -X POST http://localhost:8080/api/checks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "my-api",
    "type": "SSL",
    "enabled": true,
    "schedule": "0 0 */6 * * ?",
    "config": "{\"hostname\":\"my-api.com\",\"port\":443,\"days_before_expiry\":30}"
  }'
```

### WebSocket интеграция

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
</head>
<body>
    <div id="dashboard"></div>
    
    <script>
        const socket = new SockJS('http://localhost:8082/ws/dashboard');
        const stompClient = Stomp.over(socket);
        
        stompClient.connect({}, function (frame) {
            // Получить начальный снимок
            stompClient.subscribe('/app/dashboard', function (message) {
                const services = JSON.parse(message.body);
                updateDashboard(services);
            });
            
            // Подписаться на обновления
            stompClient.subscribe('/topic/dashboard', function (message) {
                const services = JSON.parse(message.body);
                updateDashboard(services);
            });
        });
        
        function updateDashboard(services) {
            const dashboard = document.getElementById('dashboard');
            dashboard.innerHTML = services.map(service => 
                `<div class="service ${service.io ? 'online' : 'offline'}">
                    <h3>${service.n}</h3>
                    <p>Status: ${service.st}</p>
                    <p>Uptime: ${service.up}%</p>
                    <p>Avg Response: ${service.avg}ms</p>
                </div>`
            ).join('');
        }
    </script>
</body>
</html>
```
