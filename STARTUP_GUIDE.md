# 🚀 PingTower - Инструкция по запуску

Полное руководство по запуску системы мониторинга PingTower с тестовыми данными.

## 📋 Предварительные требования

### Обязательные компоненты:
- **Docker** и **Docker Compose** (версия 3.8+)
- **Node.js** (версия 18+) и **Yarn**
- **PowerShell** (для Windows) или **PowerShell Core** (для Linux/macOS)

### Проверка установки:
```bash
# Проверка Docker
docker --version
docker-compose --version

# Проверка Node.js и Yarn
node --version
yarn --version

# Проверка PowerShell
pwsh --version  # или powershell --version на Windows
```

## 🏗️ Архитектура системы

PingTower состоит из следующих компонентов:

| Компонент | Порт | Описание |
|-----------|------|----------|
| **API Gateway** | 8080 | Единая точка входа для всех API |
| **Auth Service** | 8081 | Аутентификация и авторизация |
| **Control Tower** | 8082 | Основная бизнес-логика |
| **Reporting Service** | 8083 | Генерация отчетов |
| **Frontend** | 5173 | React приложение |
| **PostgreSQL** | 5433 | Основная база данных |
| **ClickHouse** | 8123 | Аналитическая база данных |
| **Kafka** | 9092 | Очереди сообщений |
| **Portainer** | 9001 | Управление Docker |

## 🚀 Пошаговый запуск

### Шаг 1: Клонирование и подготовка

```bash
# Перейдите в папку с проектом
cd pingtower

# Убедитесь, что Docker запущен
docker info
```

### Шаг 2: Запуск инфраструктуры

```bash
# Запуск всех сервисов через Docker Compose
docker-compose up -d

# Проверка статуса контейнеров
docker-compose ps
```

**Ожидаемый результат:**
```
Name                     Command               State           Ports
-----------------------------------------------------------------------
api-gateway              java -jar app.jar     Up      0.0.0.0:8080->8080/tcp
auth-service             java -jar app.jar     Up      0.0.0.0:8081->8081/tcp
clickhouse               /entrypoint.sh        Up      0.0.0.0:8123->8123/tcp
control-tower            java -jar app.jar     Up      0.0.0.0:8082->8081/tcp
kafka                    /etc/confluent/docker/launch    Up      0.0.0.0:9092->9092/tcp
ping-worker              java -jar app.jar     Up
postgres                 docker-entrypoint.sh postgres    Up      0.0.0.0:5433->5432/tcp
reporting-service        java -jar app.jar     Up      0.0.0.0:8083->8083/tcp
zookeeper                /etc/confluent/docker/launch    Up      0.0.0.0:2181->2181/tcp
```

### Шаг 3: Ожидание готовности сервисов

```bash
# Мониторинг логов (опционально)
docker-compose logs -f

# Проверка готовности API
curl http://localhost:8080/actuator/health
curl http://localhost:8082/api/services
```

**⏱️ Время запуска:** Обычно 2-3 минуты для полного старта всех сервисов.

### Шаг 4: Создание тестовых данных

```bash
# Запуск скрипта создания тестовых данных
pwsh ./scripts/create-test-data.ps1
```

**Что создается:**
- 27 тестовых сервисов (Яндекс, VK, GitHub, и др.)
- HTTP и Browser проверки для каждого сервиса
- SSL проверки сертификатов
- Автоматическое удаление старых данных

### Шаг 5: Запуск фронтенда

```bash
# Переход в папку фронтенда
cd frontend

# Установка зависимостей (первый запуск)
yarn install

# Запуск в режиме разработки
yarn dev
```

**Ожидаемый результат:**
```
  VITE v5.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 🌐 Доступ к сервисам

### Основные интерфейсы:

| Сервис | URL | Описание |
|--------|-----|----------|
| **Frontend** | http://localhost:5173 | Основное веб-приложение |
| **API Gateway** | http://localhost:8080 | API через Gateway |
| **Swagger UI** | http://localhost:8082/swagger-ui.html | Документация API |
| **Portainer** | http://localhost:9001 | Управление Docker |

### API Endpoints:

```bash
# Список всех сервисов
curl http://localhost:8080/api/services

# Создание нового сервиса
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-site",
    "name": "Test Site",
    "url": "https://example.com",
    "environment": "production",
    "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"
  }'

# WebSocket подключение для дашборда
ws://localhost:8080/ws/dashboard
```

## 🔧 Полезные команды

### Управление Docker:

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением данных
docker-compose down -v

# Пересборка образов
docker-compose build --no-cache

# Просмотр логов конкретного сервиса
docker-compose logs -f control-tower

# Перезапуск конкретного сервиса
docker-compose restart ping-worker
```

### Работа с базой данных:

```bash
# Подключение к PostgreSQL
docker exec -it postgres psql -U pinguser -d pingtower

# Подключение к ClickHouse
docker exec -it clickhouse clickhouse-client

# Просмотр таблиц
docker exec -it postgres psql -U pinguser -d pingtower -c "\dt"
```

### Фронтенд разработка:

```bash
cd frontend

# Проверка типов
yarn tsc

# Линтинг
yarn lint

# Форматирование
yarn format:fix

# Сборка для продакшена
yarn build
```

## 🐛 Решение проблем

### Проблема: Сервисы не запускаются

```bash
# Проверка портов
netstat -an | grep :8080
netstat -an | grep :5433

# Очистка Docker
docker system prune -f
docker-compose down -v
docker-compose up -d
```

### Проблема: Ошибки в PowerShell скрипте

```bash
# Проверка политики выполнения
Get-ExecutionPolicy

# Временное разрешение (если нужно)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Альтернативный запуск
powershell -ExecutionPolicy Bypass -File ./scripts/create-test-data.ps1
```

### Проблема: Фронтенд не подключается к API

1. Проверьте, что все сервисы запущены: `docker-compose ps`
2. Проверьте доступность API: `curl http://localhost:8080/api/services`
3. Проверьте настройки в `frontend/src/shared/config/env.ts`

### Проблема: WebSocket не подключается

```bash
# Проверка WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
     http://localhost:8080/ws/dashboard
```

## 📊 Мониторинг системы

### Проверка здоровья сервисов:

```bash
# Health checks
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
```

### Просмотр метрик:

```bash
# Метрики через Actuator
curl http://localhost:8082/actuator/metrics
curl http://localhost:8082/actuator/prometheus
```

### Kafka топики:

```bash
# Список топиков
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list

# Просмотр сообщений
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic raw-measurements --from-beginning
```

## 🔄 Обновление данных

### Пересоздание тестовых данных:

```bash
# Остановка и очистка
docker-compose down
docker-compose up -d

# Ожидание готовности (2-3 минуты)
sleep 180

# Создание новых данных
pwsh ./scripts/create-test-data.ps1
```

### Добавление нового сервиса через API:

```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-new-site",
    "name": "My New Site",
    "url": "https://mynewsite.com",
    "environment": "production",
    "projectId": "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
    "intervalSec": 60,
    "timeoutSec": 5,
    "degradationThresholdMs": 2000,
    "enabled": true
  }'
```

## 🎯 Следующие шаги

После успешного запуска:

1. **Откройте фронтенд:** http://localhost:5173
2. **Изучите API:** http://localhost:8082/swagger-ui.html
3. **Настройте алерты:** Обновите настройки Telegram в `application.yml`
4. **Добавьте свои сервисы:** Используйте API или веб-интерфейс
5. **Настройте мониторинг:** Адаптируйте интервалы и пороги под ваши нужды

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs [service-name]`
2. Убедитесь, что все порты свободны
3. Проверьте требования к системе
4. Очистите Docker и перезапустите: `docker-compose down -v && docker-compose up -d`

---

**🎉 Поздравляем! Система PingTower успешно запущена и готова к работе!**
