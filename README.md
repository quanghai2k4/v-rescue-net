# V-Rescue Net

**Mạng Lưới Cứu Trợ Việt - Kết nối tức thì, cứu trợ kịp thời**

Nền tảng công nghệ kết nối người dân cần giúp đỡ với lực lượng cứu hộ trong các tình huống thiên tai và khẩn cấp.

## 🎯 Tính năng chính

### Dành cho người dân
- ✅ Gửi yêu cầu cứu trợ trong 30 giây
- 📍 Định vị GPS tự động và chính xác
- 📱 Tối ưu cho kết nối mạng yếu
- 🆘 Giao diện đơn giản, dễ sử dụng

### Dành cho lực lượng cứu hộ
- 🗺️ Bản đồ cứu trợ thời gian thực
- 🎯 Hệ thống phân loại và ưu tiên tự động
- 🔄 Cập nhật trạng thái theo thời gian thực
- 📊 Bộ lọc thông minh và thống kê

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js** - REST API
- **PostgreSQL** + **PostGIS** - Database với hỗ trợ địa lý
- **Socket.IO** - Real-time communication
- **Helmet** + **CORS** - Security

### Frontend
- **React** + **Vite** - Modern UI framework
- **React Router** - Navigation
- **Leaflet.js** - Interactive maps
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates

## 📋 Yêu cầu hệ thống

### Option 1: Docker (Khuyến nghị)
- Docker >= 20.10
- Docker Compose >= 2.0

### Option 2: Manual Setup
- Node.js >= 16.x
- PostgreSQL >= 13.x
- npm hoặc yarn

## 🚀 Cài đặt và chạy

### 🐳 Option 1: Docker (Khuyến nghị)

**Cách nhanh nhất để chạy ứng dụng:**

```bash
# 1. Clone repository
git clone <repository-url>
cd v-rescue-net

# 2. Cấu hình môi trường (tùy chọn)
cp .env.example .env.docker
# Chỉnh sửa .env.docker nếu cần thay đổi password

# 3. Chạy với Docker Compose
docker-compose up -d --build

# 4. Truy cập ứng dụng
# Frontend: http://localhost
# Backend API: http://localhost:5000

# 5. Xem logs (nếu cần debug)
docker-compose logs -f

# 6. Dừng ứng dụng
docker-compose down

# 7. Xóa dữ liệu và reset
docker-compose down -v
```

**Quản lý Database:**
```bash
# Truy cập PostgreSQL shell
docker-compose exec postgres psql -U vrescue -d vrescuenet

# Xóa toàn bộ dữ liệu rescue requests
docker-compose exec postgres psql -U vrescue -d vrescuenet -c "DELETE FROM rescue_requests;"

# Xem dữ liệu trong database
docker-compose exec postgres psql -U vrescue -d vrescuenet -c "SELECT * FROM rescue_requests ORDER BY created_at DESC LIMIT 10;"
```

Xem chi tiết tại [DOCKER.md](DOCKER.md)

### 📦 Option 2: Manual Setup

#### 1. Clone repository

```bash
git clone <repository-url>
cd v-rescue-net
```

#### 2. Cài đặt PostgreSQL và PostGIS

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib postgis

# macOS
brew install postgresql postgis

# Windows - Download từ https://www.postgresql.org/download/
```

#### 3. Tạo database

```bash
# Kết nối PostgreSQL
sudo -u postgres psql

# Tạo database
CREATE DATABASE vrescuenet;
\c vrescuenet

# Cài đặt PostGIS extension và tạo schema
\i database/schema.sql

# Thoát
\q
```

#### 4. Cấu hình môi trường

```bash
# Copy file .env.example
cp .env.example .env

# Chỉnh sửa file .env với thông tin database của bạn
nano .env
```

Nội dung file `.env`:
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/vrescuenet
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### 5. Cài đặt dependencies

```bash
# Cài đặt backend dependencies
npm install

# Cài đặt frontend dependencies
cd client
npm install
cd ..
```

#### 6. Chạy ứng dụng

```bash
# Development mode (chạy cả backend và frontend)
npm run dev
```

Hoặc chạy riêng:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

Ứng dụng sẽ chạy tại:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📱 Sử dụng

### Gửi yêu cầu cứu trợ
1. Truy cập trang chủ
2. Nhấn "Gửi yêu cầu cứu trợ"
3. Cho phép truy cập vị trí GPS
4. Điền thông tin: SĐT, loại yêu cầu, mô tả
5. Nhấn "Gửi yêu cầu"

### Điều phối cứu hộ (Command Center)
1. Truy cập Command Center
2. Xem danh sách yêu cầu trên bản đồ
3. Sử dụng bộ lọc để tìm yêu cầu cần xử lý
4. Nhận nhiệm vụ và cập nhật trạng thái

## 🗺️ API Endpoints

### Rescue Requests

- `POST /api/rescue/requests` - Tạo yêu cầu cứu trợ mới
- `GET /api/rescue/requests` - Lấy danh sách yêu cầu
- `GET /api/rescue/requests/:id` - Lấy chi tiết yêu cầu
- `PUT /api/rescue/requests/:id` - Cập nhật trạng thái yêu cầu
- `GET /api/rescue/requests/nearby/:lat/:lng` - Tìm yêu cầu gần vị trí

### WebSocket Events

- `join-rescue-team` - Tham gia nhóm cứu hộ
- `new-rescue-request` - Yêu cầu mới được tạo
- `rescue-request-updated` - Yêu cầu được cập nhật

## 🏗️ Cấu trúc dự án

```
v-rescue-net/
├── client/                # Frontend React
│   ├── src/
│   │   ├── pages/        # Components trang
│   │   ├── App.jsx       # Main app
│   │   └── main.jsx      # Entry point
│   └── package.json
├── server/               # Backend Node.js
│   ├── routes/          # API routes
│   ├── db.js            # Database connection
│   └── index.js         # Server entry point
├── database/            # Database schemas
│   └── schema.sql
├── package.json
└── README.md
```

## 🔐 Bảo mật

- Helmet.js cho HTTP headers security
- CORS được cấu hình chặt chẽ
- Không lưu trữ thông tin nhạy cảm trong code
- Validation dữ liệu đầu vào

## 🌟 Roadmap

### Giai đoạn 1 (MVP) - ✅ Hoàn thành
- [x] Gửi yêu cầu cứu trợ với GPS
- [x] Bản đồ hiển thị yêu cầu
- [x] Cập nhật trạng thái real-time
- [x] Bộ lọc và phân loại
- [x] Docker deployment với PostgreSQL + PostGIS
- [x] Socket.IO real-time updates

### Giai đoạn 2 (Mở rộng)
- [ ] Hỗ trợ SMS cho khu vực mất Internet
- [ ] Hệ thống phân quyền đội cứu hộ
- [ ] Cảnh báo sớm dựa trên dữ liệu thời tiết
- [ ] Ứng dụng mobile native
- [ ] Reverse geocoding (chuyển GPS thành địa chỉ)

### Giai đoạn 3 (Hệ sinh thái)
- [ ] AI phân tích và đề xuất ưu tiên
- [ ] Cổng thông tin tìm kiếm người thân
- [ ] Tích hợp hệ thống quốc gia
- [ ] Dashboard phân tích và báo cáo

## 🐛 Troubleshooting

### Lỗi kết nối Socket.IO
- Đảm bảo backend đang chạy tại `http://localhost:5000`
- Kiểm tra CORS configuration trong `server/index.js`
- Nếu dùng tunnel (ngrok, serveo.net), Socket.IO sẽ tự động kết nối qua proxy

### Lỗi GPS/Location
- Cho phép trình duyệt truy cập vị trí (Location permission)
- HTTPS được yêu cầu cho GPS trên production
- Kiểm tra coordinates có đúng format (latitude, longitude)

### Lỗi Database
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Check database connection
docker-compose exec postgres psql -U vrescue -d vrescuenet -c "SELECT version();"
```

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết

## 📧 Liên hệ

Email: contact@vrescuenet.vn
Website: https://vrescuenet.vn

---

**Được phát triển với ❤️ cho cộng đồng Việt Nam**
