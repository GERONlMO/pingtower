# PingTower - Обзор архитектуры

## Схема архитектуры

```
┌─────────────────┐
│   Web Frontend  │ ← Пользователь
│   (Vanilla JS)  │
└─────────┬───────┘
          │ HTTP/WebSocket
          ▼
┌─────────────────┐
│   API Gateway   │ ← Единая точка входа
│   (Port 8080)   │
└─────────┬───────┘
          │ JWT Auth + Routing
          ▼
┌─────────────────────────────────────────────────────┐
│                Микросервисы                         │
├─────────────┬─────────────┬─────────────┬──────────┤
│Auth Service │Control Tower│Ping Worker  │Reporting │
│(Port 8081)  │(Port 8082)  │(Internal)   │(Port 8083│
└─────────────┴─────────────┴─────────────┴──────────┘
          │           │           │           │
          ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────┐
│                  Хранилища                          │
├─────────────────────┬───────────────────────────────┤
│    PostgreSQL       │         ClickHouse            │
│  (Основные данные)  │    (Метрики и аналитика)     │
│    Port 5433        │       Port 8123/9000          │
└─────────────────────┴───────────────────────────────┘
          ▲                           ▲
          │                           │
          └─────────┬─────────────────┘
                    ▼
          ┌─────────────────┐
          │  Apache Kafka   │ ← Event Streaming
          │   Port 9092     │
          └─────────────────┘
                    ▲
                    │
          ┌─────────────────┐
          │   Zookeeper     │ ← Kafka Coordination
          │   Port 2181     │
          └─────────────────┘
```

## Поток данных

### 1. Мониторинг (Ping Worker)
```
External Sites → HTTP/Browser Checks → Measurements → Kafka → ClickHouse
                                    ↘
                                      Status Updates → PostgreSQL
```

### 2. Дашборд (Real-time)
```
Frontend → WebSocket → Control Tower → PostgreSQL + ClickHouse → Dashboard Data
```

### 3. API операции
```
Frontend → API Gateway → Auth Service (JWT) → Control Tower → PostgreSQL
```

### 4. Алерты
```
Ping Worker → Kafka → Control Tower → Telegram + WebSocket → Frontend
```

## Основные компоненты

### Frontend Layer
- **Web Dashboard**: SPA на Vanilla JS
- **WebSocket**: Реальное время через SockJS+STOMP
- **HTTP Client**: REST API через API Gateway

### API Layer  
- **API Gateway**: Маршрутизация, аутентификация, CORS
- **Authentication Filter**: JWT валидация
- **Rate Limiting**: Защита от перегрузки

### Business Logic
- **Auth Service**: Управление пользователями и JWT
- **Control Tower**: Основная бизнес-логика, WebSocket, алерты
- **Ping Worker**: Мониторинг сайтов, выполнение проверок
- **Reporting Service**: Генерация отчетов и аналитика

### Data Layer
- **PostgreSQL**: Сервисы, проверки, пользователи, конфигурация
- **ClickHouse**: Временные ряды, метрики, аналитика
- **Kafka**: Асинхронная обработка событий

### Infrastructure
- **Docker Compose**: Оркестрация всех сервисов
- **Portainer**: Управление контейнерами
- **Zookeeper**: Координация Kafka кластера

## Ключевые особенности

### Масштабируемость
- Микросервисная архитектура
- Stateless сервисы
- Горизонтальное масштабирование
- Специализированные БД

### Отказоустойчивость
- Circuit Breaker паттерн
- Health checks
- Graceful degradation
- Event-driven архитектура

### Производительность
- Колоночная БД для аналитики
- Асинхронная обработка событий
- WebSocket для real-time
- Connection pooling

### Безопасность
- JWT аутентификация
- API Gateway как единая точка входа
- CORS конфигурация
- Network isolation в Docker

## Технологический стек

| Компонент | Технология | Версия |
|-----------|------------|---------|
| Backend | Java + Spring Boot | 17 + 3.x |
| Gateway | Spring Cloud Gateway | 3.x |
| Frontend | Vanilla JavaScript | ES6+ |
| СУБД | PostgreSQL | 14 |
| Аналитика | ClickHouse | Latest |
| Очереди | Apache Kafka | 7.3.2 |
| Мониторинг | Selenium WebDriver | Latest |
| Планировщик | Quartz | 2.x |
| Контейнеризация | Docker + Compose | Latest |

## Порты и сервисы

| Сервис | Внешний порт | Внутренний порт | Назначение |
|--------|--------------|-----------------|------------|
| API Gateway | 8080 | 8080 | Основной вход |
| Auth Service | 8081 | 8081 | Аутентификация |
| Control Tower | 8082 | 8081 | Бизнес-логика |
| Reporting | 8083 | 8083 | Отчеты |
| PostgreSQL | 5433 | 5432 | Основная БД |
| ClickHouse HTTP | 8123 | 8123 | Аналитика |
| ClickHouse Native | 9000 | 9000 | Нативный протокол |
| Kafka | 9092 | 9092 | Сообщения |
| Zookeeper | 2181 | 2181 | Координация |
| Portainer | 9001 | 9000 | Управление |
