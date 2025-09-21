# 🏗️ PingTower - Distributed Monitoring System

<div align="center">

![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**Система мониторинга веб-сервисов с real-time дашбордом**

[Архитектура](#-архитектура) • [Быстрый старт](#-быстрый-старт) • [API документация](#-api-документация) • [Конфигурация](#-конфигурация)

</div>

---

## 📋 Описание

PingTower - это распределенная система мониторинга, которая обеспечивает:

- 🔍 **Мониторинг доступности** - HTTP, Browser, SSL проверки
- 📊 **Real-time дашборд** - WebSocket обновления в реальном времени  
- 📈 **Аналитика производительности** - метрики latency, uptime, DOM load time
- 🚨 **Система алертов** - уведомления в Telegram при сбоях
- 🏗️ **Микросервисная архитектура** - масштабируемость и отказоустойчивость

## 🏛️ Архитектура

```
┌─────────────────┐
│   Web Frontend  │ ← Real-time Dashboard
│   (Vanilla JS)  │
└─────────┬───────┘
          │ HTTP/WebSocket
          ▼
┌─────────────────┐
│   API Gateway   │ ← Single Entry Point
│   (Port 8080)   │
└─────────┬───────┘
          │ JWT Auth + Routing
          ▼
┌─────────────────────────────────────────────────────┐
│                Микросервисы                         │
├─────────────┬─────────────┬─────────────┬──────────┤
│Auth Service │Control Tower│Ping Worker  │Reporting │
│(Port 8081)  │(Port 8082)  │(Scheduled)  │(Port 8083│
└─────────────┴─────────────┴─────────────┴──────────┘
          │           │           │           │
          ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────┐
│                  Хранилища                          │
├─────────────────────┬───────────────────────────────┤
│    PostgreSQL       │         ClickHouse            │
│  (Основные данные)  │    (Метрики и аналитика)     │
└─────────────────────┴───────────────────────────────┘
                    ▲
                    │ Event Streaming
          ┌─────────────────┐
          │  Apache Kafka   │
          └─────────────────┘
```

### Компоненты системы:

| Компонент | Порт | Описание |
|-----------|------|----------|
| **API Gateway** | 8080 | Единая точка входа, маршрутизация, JWT аутентификация |
| **Auth Service** | 8081 | Управление пользователями, генерация JWT токенов |
| **Control Tower** | 8082 | Основная бизнес-логика, WebSocket, управление сервисами |
| **Ping Worker** | - | Выполнение проверок, отправка метрик в Kafka |
| **Reporting Service** | 8083 | Генерация отчетов и аналитика |
| **PostgreSQL** | 5433 | Основная БД (сервисы, проверки, пользователи) |
| **ClickHouse** | 8123/9000 | Временные ряды и аналитика |
| **Apache Kafka** | 9092 | Асинхронная обработка событий |

## 🚀 Быстрый старт

### Предварительные требования

- **Docker** и **Docker Compose**
- **Java 17+** (для разработки)
- **Maven 3.8+** (для разработки)
- **Git**

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd pingtower
```

### 2. Запуск всей системы

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка системы
docker-compose down
```

### 3. Проверка работоспособности

После запуска проверьте доступность сервисов:

| Сервис | URL | Описание |
|--------|-----|----------|
| **Web Dashboard** | http://localhost:8082 | Основной дашборд |
| **API Gateway** | http://localhost:8080 | REST API |
| **Swagger UI (Control Tower)** | http://localhost:8082/swagger-ui.html | API документация |
| **Swagger UI (Auth Service)** | http://localhost:8081/swagger-ui.html | Auth API |
| **ClickHouse** | http://localhost:8123 | Аналитическая БД |
| **Portainer** | http://localhost:9001 | Управление контейнерами |

### 4. Создание тестовых данных

```bash
# Запуск PowerShell скрипта (Windows)
.\scripts\create-test-data.ps1

# Или через curl (Linux/Mac)
curl -X POST http://localhost:8082/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "id": "google",
    "name": "Google",
    "environment": "search",
    "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
  }'
```

## 📚 API документация

### Swagger UI

Каждый сервис предоставляет интерактивную документацию через Swagger UI:

- **Control Tower API**: http://localhost:8082/swagger-ui.html
- **Auth Service API**: http://localhost:8081/swagger-ui.html

### Основные endpoint'ы

#### 🔐 Аутентификация (Auth Service)

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

#### 🏢 Управление сервисами (Control Tower)

```http
# Получить все сервисы
GET /api/services

# Создать новый сервис
POST /api/services
Content-Type: application/json

{
  "id": "my-service",
  "name": "My Service",
  "environment": "prod",
  "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
}

# Обновить сервис
PUT /api/services/{id}

# Удалить сервис
DELETE /api/services/{id}
```

#### 🔍 Управление проверками

```http
# Получить все проверки
GET /api/checks

# Создать HTTP проверку
POST /api/checks
Content-Type: application/json

{
  "serviceId": "my-service",
  "type": "HTTP",
  "enabled": true,
  "schedule": "*/30 * * * * ?",
  "config": "{\"url\":\"https://example.com\",\"method\":\"GET\",\"expected_code\":200}"
}
```

### WebSocket подключение

```javascript
// Подключение к real-time дашборду
const socket = new SockJS('http://localhost:8082/ws/dashboard');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    // Подписка на обновления дашборда
    stompClient.subscribe('/app/dashboard', function (message) {
        const data = JSON.parse(message.body);
        // Обновление UI
    });
});
```

## ⚙️ Конфигурация

### Переменные окружения

Основные переменные настраиваются в `docker-compose.yml`:

```yaml
environment:
  - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/pingtower
  - SPRING_DATASOURCE_USERNAME=pinguser
  - SPRING_DATASOURCE_PASSWORD=pingpassword
  - SPRING_KAFKA_BOOTSTRAP-SERVERS=kafka:29092
  - SPRING_CLICKHOUSE_URL=jdbc:clickhouse://clickhouse:8123/pingtower
```

### Настройка мониторинга

#### Типы проверок:

1. **HTTP проверки**:
   ```json
   {
     "url": "https://example.com",
     "method": "GET",
     "expected_code": 200,
     "timeout": 30000
   }
   ```

2. **Browser проверки**:
   ```json
   {
     "url": "https://example.com",
     "method": "GET",
     "expected_code": 200,
     "check_mode": "browser"
   }
   ```

3. **SSL проверки**:
   ```json
   {
     "hostname": "example.com",
     "port": 443,
     "days_before_expiry": 30
   }
   ```

### Расписания (Cron выражения)

- `*/30 * * * * ?` - каждые 30 секунд
- `0 */5 * * * ?` - каждые 5 минут
- `0 0 */1 * * ?` - каждый час

## 🛠️ Разработка

### Локальная разработка

```bash
# Запуск только инфраструктуры
docker-compose up -d postgres clickhouse kafka zookeeper

# Запуск сервиса локально
cd control-tower
mvn spring-boot:run

# Или через IDE с профилем 'dev'
```

### Сборка проекта

```bash
# Сборка всех сервисов
mvn clean package -DskipTests

# Сборка Docker образов
docker-compose build
```

### Тестирование

```bash
# Запуск тестов
mvn test

# Интеграционные тесты
mvn verify
```

## 📊 Мониторинг и наблюдаемость

### Метрики

Система собирает следующие метрики:

- **Uptime** - процент успешных проверок
- **Response Time** - время отклика (p95, avg)
- **DOM Load Time** - время загрузки DOM (для browser проверок)
- **Time to First Byte** - TTFB метрика
- **SSL Certificate** - дни до истечения сертификата

### Логирование

Логи доступны через Docker:

```bash
# Просмотр логов конкретного сервиса
docker-compose logs -f control-tower

# Просмотр всех логов
docker-compose logs -f
```

### Алерты

Настройка Telegram уведомлений в `application.yml`:

```yaml
telegram:
  bot:
    token: "YOUR_BOT_TOKEN"
    chat-id: "YOUR_CHAT_ID"
```

## 🔧 Устранение неполадок

### Частые проблемы

1. **Порт уже занят**:
   ```bash
   # Проверка занятых портов
   netstat -tulpn | grep :8080
   
   # Изменение портов в docker-compose.yml
   ```

2. **Проблемы с базой данных**:
   ```bash
   # Пересоздание томов
   docker-compose down -v
   docker-compose up -d
   ```

3. **Kafka не запускается**:
   ```bash
   # Очистка Kafka данных
   docker-compose down
   docker volume rm pingtower_kafka_data
   docker-compose up -d
   ```

### Полезные команды

```bash
# Перезапуск конкретного сервиса
docker-compose restart control-tower

# Просмотр статуса контейнеров
docker-compose ps

# Подключение к базе данных
docker exec -it postgres psql -U pinguser -d pingtower

# Подключение к ClickHouse
docker exec -it clickhouse clickhouse-client
```

## 📈 Производительность

### Рекомендуемые ресурсы

| Компонент | CPU | RAM | Disk |
|-----------|-----|-----|------|
| API Gateway | 0.5 CPU | 512MB | - |
| Control Tower | 1 CPU | 1GB | - |
| Ping Worker | 1 CPU | 1GB | - |
| PostgreSQL | 1 CPU | 1GB | 10GB |
| ClickHouse | 2 CPU | 2GB | 20GB |
| Kafka | 1 CPU | 1GB | 5GB |

### Масштабирование

```bash
# Масштабирование ping-worker
docker-compose up -d --scale ping-worker=3

# Горизонтальное масштабирование через Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml pingtower
```

## 🤝 Contributing

1. Fork проект
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙋‍♂️ Поддержка

- 📧 Email: support@pingtower.com
- 📖 Документация: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](../../issues)

---

<div align="center">
Made with ❤️ by PingTower 1 Team
</div>
