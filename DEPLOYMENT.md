# Hướng dẫn triển khai Production

## 1. Chuẩn bị môi trường

### Yêu cầu server
- Ubuntu 20.04+ hoặc CentOS 7+
- RAM >= 2GB
- Disk >= 20GB
- Node.js >= 16.x
- PostgreSQL >= 13.x với PostGIS
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

## 2. Cài đặt trên Server

### Cài đặt PostgreSQL và PostGIS
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

### Tạo database
```bash
sudo -u postgres psql
CREATE DATABASE vrescuenet;
CREATE USER vrescue WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE vrescuenet TO vrescue;
\c vrescuenet
CREATE EXTENSION postgis;
\q
```

### Clone và setup project
```bash
git clone <repository-url>
cd baolu
npm install
cd client
npm install
npm run build
cd ..
```

### Cấu hình môi trường
```bash
cp .env.example .env
nano .env
```

Nội dung `.env` production:
```
PORT=5000
DATABASE_URL=postgresql://vrescue:secure_password@localhost:5432/vrescuenet
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

## 3. Cấu hình Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        root /path/to/baolu/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4. Chạy với PM2

```bash
npm install -g pm2

pm2 start server/index.js --name vrescue-api
pm2 startup
pm2 save
```

## 5. Monitoring

```bash
pm2 monit
pm2 logs vrescue-api
```

## 6. Backup Database

Tạo cron job backup hàng ngày:
```bash
crontab -e
```

Thêm dòng:
```
0 2 * * * pg_dump vrescuenet > /backup/vrescuenet_$(date +\%Y\%m\%d).sql
```

## 7. Bảo mật

- Sử dụng firewall (ufw)
- Chỉ mở port 80, 443, 22
- Cập nhật thường xuyên
- Sử dụng strong password
- Backup định kỳ
