# 🚀 PingTower Deployment Guide

## Обзор развертывания

PingTower поддерживает несколько способов развертывания в зависимости от ваших потребностей:

- 🐳 **Docker Compose** (рекомендуется для разработки и тестирования)
- ☸️ **Kubernetes** (для production окружения)
- 🖥️ **Bare Metal** (для специфических требований)

## 🐳 Docker Compose Deployment

### Минимальные требования

| Ресурс | Минимум | Рекомендуется |
|--------|---------|---------------|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Disk | 50 GB | 100 GB |
| Network | 100 Mbps | 1 Gbps |

### Быстрое развертывание

```bash
# 1. Клонирование репозитория
git clone <repository-url>
cd pingtower

# 2. Настройка переменных окружения (опционально)
cp .env.example .env
nano .env

# 3. Запуск всех сервисов
docker-compose up -d

# 4. Проверка статуса
docker-compose ps

# 5. Просмотр логов
docker-compose logs -f
```

### Конфигурация окружения

Создайте файл `.env` в корне проекта:

```bash
# Database Configuration
POSTGRES_DB=pingtower
POSTGRES_USER=pinguser
POSTGRES_PASSWORD=your_secure_password

# ClickHouse Configuration
CLICKHOUSE_DB=pingtower
CLICKHOUSE_USER=chuser
CLICKHOUSE_PASSWORD=your_clickhouse_password

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Monitoring Configuration
PING_INTERVAL=30
MAX_CONCURRENT_CHECKS=50
```

### Production настройки

Для production окружения рекомендуется:

1. **Изменить пароли по умолчанию**:
   ```yaml
   # В docker-compose.yml
   environment:
     POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-your_secure_password}
     CLICKHOUSE_PASSWORD: ${CLICKHOUSE_PASSWORD:-your_secure_password}
   ```

2. **Настроить SSL/TLS**:
   ```yaml
   # Добавить nginx reverse proxy
   nginx:
     image: nginx:alpine
     ports:
       - "443:443"
       - "80:80"
     volumes:
       - ./nginx.conf:/etc/nginx/nginx.conf
       - ./ssl:/etc/nginx/ssl
   ```
   
### Масштабирование сервисов

```bash
# Масштабирование ping-worker для увеличения пропускной способности
docker-compose up -d --scale ping-worker=3

# Масштабирование с ограничением ресурсов
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

Создайте `docker-compose.scale.yml`:

```yaml
version: '3.8'
services:
  ping-worker:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## ☸️ Kubernetes Deployment

### Helm Chart

```bash
# Установка через Helm
helm repo add pingtower https://charts.pingtower.com
helm install pingtower pingtower/pingtower \
  --set postgresql.auth.password=your_password \
  --set clickhouse.auth.password=your_password
```

### Манифесты Kubernetes

#### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pingtower
```

#### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pingtower-config
  namespace: pingtower
data:
  POSTGRES_DB: pingtower
  CLICKHOUSE_DB: pingtower
  KAFKA_BOOTSTRAP_SERVERS: kafka:9092
```

#### Deployments
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: control-tower
  namespace: pingtower
spec:
  replicas: 2
  selector:
    matchLabels:
      app: control-tower
  template:
    metadata:
      labels:
        app: control-tower
    spec:
      containers:
      - name: control-tower
        image: pingtower/control-tower:latest
        ports:
        - containerPort: 8081
        envFrom:
        - configMapRef:
            name: pingtower-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
```

#### Services
```yaml
apiVersion: v1
kind: Service
metadata:
  name: control-tower-service
  namespace: pingtower
spec:
  selector:
    app: control-tower
  ports:
  - port: 8081
    targetPort: 8081
  type: ClusterIP
```

#### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pingtower-ingress
  namespace: pingtower
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - pingtower.yourdomain.com
    secretName: pingtower-tls
  rules:
  - host: pingtower.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 8080
```

## 🖥️ Bare Metal Deployment

### Системные требования

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y openjdk-17-jdk maven postgresql-14 clickhouse-server

# CentOS/RHEL
sudo yum install -y java-17-openjdk maven postgresql14-server clickhouse-server
```

### Настройка баз данных

#### PostgreSQL
```bash
# Создание пользователя и базы данных
sudo -u postgres psql
CREATE DATABASE pingtower;
CREATE USER pinguser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pingtower TO pinguser;
\q
```

#### ClickHouse
```bash
# Создание базы данных
clickhouse-client
CREATE DATABASE pingtower;
CREATE USER chuser IDENTIFIED WITH plaintext_password BY 'your_password';
GRANT ALL ON pingtower.* TO chuser;
exit
```

### Сборка и запуск сервисов

```bash
# Сборка всех сервисов
mvn clean package -DskipTests

# Запуск каждого сервиса
java -jar api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar &
java -jar auth-service/target/auth-service-0.0.1-SNAPSHOT.jar &
java -jar control-tower/target/control-tower-0.0.1-SNAPSHOT.jar &
java -jar ping-worker/target/ping-worker-0.0.1-SNAPSHOT.jar &
java -jar reporting-service/target/reporting-service-0.0.1-SNAPSHOT.jar &
```

### Systemd сервисы

Создайте systemd unit файлы для каждого сервиса:

```bash
# /etc/systemd/system/pingtower-control-tower.service
[Unit]
Description=PingTower Control Tower
After=postgresql.service clickhouse-server.service

[Service]
Type=simple
User=pingtower
ExecStart=/usr/bin/java -jar /opt/pingtower/control-tower.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Активация сервисов
sudo systemctl daemon-reload
sudo systemctl enable pingtower-control-tower
sudo systemctl start pingtower-control-tower
```

## 🔧 Настройка мониторинга

### Prometheus конфигурация

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'pingtower-services'
    static_configs:
      - targets: ['localhost:8080', 'localhost:8081', 'localhost:8082', 'localhost:8083']
    metrics_path: /actuator/prometheus
```
```

### Firewall настройки

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 8080:8083/tcp  # Блокировать прямой доступ к сервисам
sudo ufw enable

# iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080:8083 -j DROP
```

## 📊 Мониторинг развертывания

### Health Checks

```bash
#!/bin/bash
# health-check.sh

services=("api-gateway:8080" "auth-service:8081" "control-tower:8082" "reporting-service:8083")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d':' -f1)
    port=$(echo $service | cut -d':' -f2)
    
    if curl -f -s http://localhost:$port/actuator/health > /dev/null; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is unhealthy"
    fi
done
```

### Backup стратегия

```bash
#!/bin/bash
# backup.sh

# PostgreSQL backup
pg_dump -h localhost -U pinguser -d pingtower > backup/postgres_$(date +%Y%m%d_%H%M%S).sql

# ClickHouse backup
clickhouse-client --query="BACKUP DATABASE pingtower TO Disk('backups', 'clickhouse_$(date +%Y%m%d_%H%M%S)')"

# Docker volumes backup
docker run --rm -v pingtower_pg_data:/data -v $(pwd)/backup:/backup alpine tar czf /backup/pg_data_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

## 🔄 Обновление системы

### Rolling Update (Docker Compose)

```bash
# Обновление одного сервиса без downtime
docker-compose pull control-tower
docker-compose up -d --no-deps control-tower

# Полное обновление
docker-compose pull
docker-compose up -d
```

### Blue-Green Deployment

```bash
# Создание новой версии
docker-compose -f docker-compose.blue.yml up -d
# Переключение трафика
# Остановка старой версии
docker-compose -f docker-compose.green.yml down
```

## 🐛 Troubleshooting

### Частые проблемы

1. **Out of Memory**:
   ```bash
   # Увеличение heap size для Java приложений
   JAVA_OPTS="-Xmx2g -Xms1g"
   ```

2. **Database Connection Issues**:
   ```bash
   # Проверка подключения
   pg_isready -h localhost -p 5433
   clickhouse-client --host localhost --port 9000
   ```

3. **Kafka Issues**:
   ```bash
   # Очистка Kafka топиков
   docker exec kafka kafka-topics.sh --delete --topic raw-measurements --bootstrap-server localhost:9092
   ```

### Логи и отладка

```bash
# Просмотр логов конкретного сервиса
docker-compose logs -f control-tower

# Отладка сетевых проблем
docker network ls
docker network inspect pingtower_pingtower-network

# Мониторинг ресурсов
docker stats

# Подключение к контейнеру для отладки
docker exec -it control-tower bash
```

## 📈 Performance Tuning

### JVM настройки

```bash
# Оптимизация для production
JAVA_OPTS="-Xmx4g -Xms2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap"
```

### Database оптимизация

#### PostgreSQL
```sql
-- Настройка postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

#### ClickHouse
```xml
<!-- config.xml -->
<max_connections>4096</max_connections>
<max_memory_usage>10000000000</max_memory_usage>
<max_bytes_before_external_group_by>20000000000</max_bytes_before_external_group_by>
```

Эта документация покрывает основные сценарии развертывания PingTower. Для специфических случаев обратитесь к документации отдельных компонентов.
