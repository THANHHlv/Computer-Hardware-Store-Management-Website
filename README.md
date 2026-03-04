# Computer Shop

## Quickstart 
1. **Kết nối đến cơ sở dữ liệu PostgreSQL trên Azure (không cần cài DB local).**
2. **Chạy backend Spring Boot (Java 17 + Maven).**
3. **Khởi động frontend React/Vite (Node 18+).**

## Chuẩn bị
- **PostgreSQL client** (ví dụ `psql`) để kiểm tra dữ liệu.
- **Java 17** và **Maven 3.8+** cho backend.
- **Node.js 18+** và **npm** (hoặc pnpm/yarn) cho frontend.

## 1. Cơ sở dữ liệu
Dự án sử dụng Azure PostgreSQL được quản lý sẵn; không cần chạy DB trên máy.

```
Host: huuhieudb.postgres.database.azure.com
Port: 5432
Database: pc_shop_database
Username: huuhieu56
Password: Abc1234@
```

Kết nối mẫu qua `psql` (bật SSL):

```bash
PGPASSWORD=Abc1234@ psql \
	-h huuhieudb.postgres.database.azure.com \
	-p 5432 \
	-U huuhieu56 \
	-d pc_shop_database \
	--set=sslmode=require
```

## 2. Backend
Xây dựng và chạy dịch vụ Spring Boot bằng Maven:

```bash
cd backend
mvn spring-boot:run
```

- Backend mặc định hoạt động tại `http://localhost:8080`.
- Thay đổi cấu hình kết nối hoặc port trong `src/main/resources/application.yml` nếu cần.

## 3. Frontend
Cài đặt phụ thuộc và start dev server Vite:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

- Frontend mặc định tại `http://localhost:5173` (có thể chỉnh trong `vite.config.ts`).
- Đảm bảo frontend gọi đúng backend URL trong `src/services/api.ts` hoặc biến môi trường nếu cần.

Hoàn tất: kết nối DB Azure, chạy backend rồi frontend để sử dụng web.

## 4. Các tài khoản để test 

```bash
ROLE ADMIN
username: admin 
password: Abc1234@

ROLE STAFF
username: staff
password: Abc1234@

ROLE CUSTOMER
username: customer
password: Abc1234@
```

## 5. Truy cập web đã được deploy sẵn 
Option 1: Truy cập web deploy thông qua docker trên VPS Linux 
```bash
Frontend: https://brave-tree-054333100.1.azurestaticapps.net/
Backend: https://huuhieube-aqctdyhfbeeyabgr.eastasia-01.azurewebsites.net
``` 	


Option 2: Còn web dưới đây là do web deploy thông qua services free, nên mở web lên thì vui lòng chờ 5p để backend tự động chạy, rồi reload lại trang frontend là được ^_^.
```bash
Frontend: https://brave-tree-054333100.1.azurestaticapps.net/
Backend: https://huuhieube-aqctdyhfbeeyabgr.eastasia-01.azurewebsites.net
```

## 6. Triển khai bằng Docker Compose
Sử dụng Docker để build và chạy frontend + backend trên cùng VPS. Database vẫn kết nối trực tiếp đến Azure PostgreSQL theo cấu hình sẵn.

### Cấu trúc container
- **backend**: Spring Boot 3 (Java 17). Dockerfile nằm trong `backend/Dockerfile` sử dụng multi-stage Maven build.
- **frontend**: React/Vite build sẵn và serve bằng Nginx (`frontend/Dockerfile`).
- **docker-compose.yml** tại root ghép 2 service và mount volume `backend_uploads` để lưu ảnh sản phẩm.

Ghi đè các biến bằng cách export trước khi chạy `docker compose` hoặc tạo file `.env` cùng cấp `docker-compose.yml`.

### Build & chạy
```bash
# Từ thư mục gốc
docker compose up -d --build

# Xem log
docker compose logs -f backend
docker compose logs -f frontend
```
