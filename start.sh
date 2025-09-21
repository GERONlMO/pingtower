#!/bin/bash

echo "🚀 PingTower - Запуск системы мониторинга"
echo

# Проверка Docker
echo "📋 Проверка Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    echo "Установите Docker и Docker Compose, затем попробуйте снова."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен!"
    echo "Установите Docker Compose, затем попробуйте снова."
    exit 1
fi

echo "✅ Docker найден"
echo

# Запуск сервисов
echo "🏗️ Запуск сервисов..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при запуске Docker Compose!"
    exit 1
fi

echo "✅ Сервисы запущены"
echo

echo "⏳ Ожидание готовности сервисов (30 секунд)..."
sleep 30

echo "📊 Создание тестовых данных..."
if command -v pwsh &> /dev/null; then
    pwsh ./scripts/create-test-data.ps1
elif command -v powershell &> /dev/null; then
    powershell ./scripts/create-test-data.ps1
else
    echo "⚠️ PowerShell не найден. Тестовые данные не созданы."
    echo "Установите PowerShell Core для создания тестовых данных."
fi

echo
echo "🎉 PingTower успешно запущен!"
echo
echo "📱 Доступные сервисы:"
echo "   • Frontend: http://localhost:5173"
echo "   • API Gateway: http://localhost:8080"
echo "   • Swagger UI: http://localhost:8082/swagger-ui.html"
echo "   • Portainer: http://localhost:9001"
echo
echo "🔧 Для запуска фронтенда выполните:"
echo "   cd frontend"
echo "   yarn install"
echo "   yarn dev"
echo
echo "🛑 Для остановки системы выполните:"
if command -v docker-compose &> /dev/null; then
    echo "   docker-compose down"
else
    echo "   docker compose down"
fi
echo
