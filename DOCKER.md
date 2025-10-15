# Docker Deployment Guide

## 🐳 Triển khai V-Rescue Net với Docker

Hướng dẫn chi tiết để triển khai ứng dụng V-Rescue Net sử dụng Docker và Docker Compose.

## Yêu cầu

- Docker >= 20.10
- Docker Compose >= 2.0
- 2GB RAM trở lên
- 10GB disk space

## Cấu trúc Docker

Hệ thống bao gồm 3 services:

1. **PostgreSQL + PostGIS** - Database với hỗ trợ địa lý
2. **Backend** - Node.js API server
3. **Frontend** - React app với Nginx

## Hướng dẫn triển khai

### 1. Cấu hình môi trường

Tạo file `.env` từ template:

```bash
cp .env.docker .env
```

Chỉnh sửa file `.env`:

```bash
DB_PASSWORD=your_secure_password_here
CLIENT_URL=http://your-domain.com
```

### 2. Build và chạy containers

#### Development mode

```bash
docker-compose up --build
```

Hoặc chạy ở chế độ background:

```bash
docker-compose up -d --build
```

#### Production mode

```bash
docker-compose -f docker-compose.yml up -d --build
```

### 3. Kiểm tra trạng thái

```bash
# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Kiểm tra containers đang chạy
docker-compose ps

# Kiểm tra health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 4. Truy cập ứng dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Quản lý Docker

### Dừng services

```bash
docker-compose down
```

### Dừng và xóa volumes (⚠️ Xóa hết dữ liệu)

```bash
docker-compose down -v
```

### Restart services

```bash
docker-compose restart
```

### Restart service cụ thể

```bash
docker-compose restart backend
```

### Rebuild service cụ thể

```bash
docker-compose up -d --no-deps --build backend
```

## Database Management

### Truy cập PostgreSQL

```bash
docker-compose exec postgres psql -U vrescue -d vrescuenet
```

### Backup database

```bash
docker-compose exec postgres pg_dump -U vrescue vrescuenet > backup_$(date +%Y%m%d).sql
```

### Restore database

```bash
docker-compose exec -T postgres psql -U vrescue vrescuenet < backup.sql
```

### Chạy SQL script

```bash
docker-compose exec -T postgres psql -U vrescue vrescuenet < database/schema.sql
```

## Monitoring & Debug

### Xem resource usage

```bash
docker stats
```

### Kiểm tra logs chi tiết

```bash
# Xem 100 dòng cuối
docker-compose logs --tail=100 backend

# Theo dõi logs real-time
docker-compose logs -f --tail=50 backend
```

### Vào container để debug

```bash
# Backend container
docker-compose exec backend sh

# Postgres container
docker-compose exec postgres bash

# Frontend container
docker-compose exec frontend sh
```

## Scaling (Optional)

### Scale backend service

```bash
docker-compose up -d --scale backend=3
```

Lưu ý: Cần cấu hình load balancer khi scale multiple instances.

## Production Best Practices

### 1. Sử dụng Docker Secrets

Tạo file `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 2. Sử dụng volumes cho data persistence

```yaml
volumes:
  postgres_data:
    driver: local
  backup_data:
    driver: local
```

### 3. Health checks

Tất cả services đều có health checks:
- PostgreSQL: Kiểm tra kết nối database
- Backend: Kiểm tra endpoint /health
- Frontend: Nginx health check

### 4. Resource limits

Thêm vào `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Nginx SSL Configuration (Production)

Để sử dụng HTTPS, chỉnh sửa `client/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... các config khác
}
```

Mount SSL certificates:

```yaml
frontend:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

## Troubleshooting

### Container không start

```bash
# Xem logs lỗi
docker-compose logs [service-name]

# Kiểm tra cấu hình
docker-compose config

# Xóa và rebuild
docker-compose down -v
docker-compose up --build
```

### Database connection failed

```bash
# Kiểm tra postgres đã sẵn sàng
docker-compose exec postgres pg_isready -U vrescue

# Xem logs postgres
docker-compose logs postgres
```

### Port đã được sử dụng

Đổi port trong `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Đổi từ 80 sang 8080
```

### Out of memory

```bash
# Tăng Docker memory limit trong Docker Desktop
# hoặc thêm resource limits vào docker-compose.yml
```

## Cleanup

### Xóa tất cả containers, networks, volumes

```bash
docker-compose down -v --remove-orphans
```

### Xóa images

```bash
docker-compose down --rmi all
```

### Dọn dẹp Docker system

```bash
docker system prune -a --volumes
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to server
        run: |
          docker-compose pull
          docker-compose up -d --build
```

## Monitoring với Prometheus (Optional)

Thêm vào `docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

## Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `docker-compose logs`
2. Kiểm tra health: `docker-compose ps`
3. Tạo issue trên GitHub với logs đầy đủ

---

**Happy Deploying! 🚀**
