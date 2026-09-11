# Computer Shop

## Quickstart
1. **Cấu hình kết nối đến PostgreSQL (local hoặc remote).**
2. **Chạy backend Spring Boot (Java 17 + Maven).**
3. **Khởi động frontend React/Vite (Node 18+).**

## Chuẩn bị
- **PostgreSQL 15+** (local hoặc dịch vụ managed như Render, Neon, Supabase).
- **Java 17** và **Maven 3.8+** cho backend.
- **Node.js 18+** và **npm** (hoặc pnpm/yarn) cho frontend.

## 1. Cơ sở dữ liệu
Tạo file `.env` tại thư mục `backend/` (file này đã nằm trong `.gitignore`):

```env
DATABASE_URL=jdbc:postgresql://<YOUR_DB_HOST>:5432/<YOUR_DB_NAME>
DB_USERNAME=<YOUR_DB_USERNAME>
DB_PASSWORD=<YOUR_DB_PASSWORD>
```

Ví dụ kết nối local:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/pc_shop_database_2
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
```

Kết nối mẫu qua `psql`:

```bash
psql -h <YOUR_DB_HOST> -p 5432 -U <YOUR_DB_USERNAME> -d <YOUR_DB_NAME>
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

## 5. Truy cập web đã được deploy trên Render

> **Lưu ý:** Dự án sử dụng Render Free Tier. Service sẽ tự động **sleep sau ~15 phút không có traffic**. Lần truy cập đầu tiên sau khi service ngủ có thể mất **30–60 giây** để khởi động lại (cold start). Vui lòng chờ và reload lại trang.

```
Frontend: https://<your-render-frontend>.onrender.com
Backend:  https://<your-render-backend>.onrender.com
```

## 6. Triển khai bằng Docker Compose
Sử dụng Docker để build và chạy frontend + backend. Tạo file `.env` cùng cấp `docker-compose.yml` với các biến `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`.

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

## 7. CI/CD
- **CI (GitHub Actions):** Mỗi push/PR vào `main` sẽ tự động chạy build & test cho cả backend (`mvn verify`) và frontend (`npm run build`). Xem workflow tại `.github/workflows/ci.yml`.
- **CD (Render):** Render tự động deploy khi có push vào branch `main`. Cấu hình blueprint tại `render.yaml`.
