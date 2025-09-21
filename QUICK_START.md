# ⚡ PingTower - Быстрый старт

Минимальная инструкция для запуска PingTower за 5 минут.

## 🚀 Быстрый запуск

### Автоматический запуск (рекомендуется)

**Windows:**
```bash
cd pingtower
start.bat
```

**Linux/macOS:**
```bash
cd pingtower
./start.sh
```

### Ручной запуск

### 1. Запуск сервисов
```bash
cd pingtower
docker-compose up -d
```

### 2. Создание тестовых данных
```bash
pwsh ./scripts/create-test-data.ps1
```

### 3. Запуск фронтенда
```bash
cd frontend
yarn install
yarn dev
```

### 4. Открыть приложение
Перейдите на: http://localhost:5173

## 📋 Проверка работы

```bash
# Проверка API
curl http://localhost:8080/api/services

# Проверка сервисов
docker-compose ps
```

## 🛑 Остановка

```bash
docker-compose down
```

---

**📖 Подробная инструкция:** [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
