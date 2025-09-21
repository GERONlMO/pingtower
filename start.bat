@echo off
echo 🚀 PingTower - Запуск системы мониторинга
echo.

echo 📋 Проверка Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker не установлен или не запущен!
    echo Установите Docker Desktop и попробуйте снова.
    pause
    exit /b 1
)

echo ✅ Docker найден
echo.

echo 🏗️ Запуск сервисов...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Ошибка при запуске Docker Compose!
    pause
    exit /b 1
)

echo ✅ Сервисы запущены
echo.

echo ⏳ Ожидание готовности сервисов (30 секунд)...
timeout /t 30 /nobreak >nul

echo 📊 Создание тестовых данных...
powershell -ExecutionPolicy Bypass -File "scripts\create-test-data.ps1"

if %errorlevel% neq 0 (
    echo ⚠️ Предупреждение: Не удалось создать тестовые данные
    echo Продолжаем без тестовых данных...
)

echo.
echo 🎉 PingTower успешно запущен!
echo.
echo 📱 Доступные сервисы:
echo    • Frontend: http://localhost:5173
echo    • API Gateway: http://localhost:8080
echo    • Swagger UI: http://localhost:8082/swagger-ui.html
echo    • Portainer: http://localhost:9001
echo.
echo 🔧 Для запуска фронтенда выполните:
echo    cd frontend
echo    yarn install
echo    yarn dev
echo.
echo 🛑 Для остановки системы выполните:
echo    docker-compose down
echo.
pause
