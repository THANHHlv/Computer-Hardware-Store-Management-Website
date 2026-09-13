# TÀI LIỆU TOÀN DIỆN VỀ KIẾN TRÚC, THIẾT KẾ VÀ CHỨC NĂNG HỆ THỐNG
## DỰ ÁN: WEBSITE QUẢN LÝ & THƯƠNG MẠI ĐIỆN TỬ LINH KIỆN MÁY TÍNH (COMPUTER HARDWARE STORE)

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

### 1.1. Bối cảnh và Mục tiêu
**Computer Hardware Store (PC Shop)** là nền tảng thương mại điện tử chuyên sâu và hệ thống quản trị tích hợp dành riêng cho ngành phần cứng và linh kiện máy tính. Dự án giải quyết bài toán phức tạp nhất của việc mua bán linh kiện công nghệ: **tính tương thích kỹ thuật giữa các thành phần phần cứng**, đồng thời cung cấp trải nghiệm mua sắm trực quan, hiện đại đạt chuẩn quốc tế.

### 1.2. Đối tượng Người dùng & Phân quyền (RBAC)
Hệ thống phân cấp người dùng thành 3 vai trò với quyền hạn rõ ràng:
- **Khách hàng (CUSTOMER)**:
  - Khách vãng lai: Duyệt danh mục, tìm kiếm lọc sản phẩm, trải nghiệm mô hình 3D, sử dụng công cụ Build PC, xem tương thích và đánh giá.
  - Khách thành viên: Quản lý giỏ hàng, đặt hàng thanh toán, áp mã ưu đãi, theo dõi hành trình đơn hàng, quản lý hồ sơ và viết bình luận/đánh giá.
- **Nhân viên (STAFF)**:
  - Tiếp nhận và xử lý trạng thái đơn hàng (Xác nhận, Đang giao, Hoàn thành, Hủy).
  - Quản lý kho hàng (Kiểm kê số lượng thực tế, nhập kho bổ sung, ghi nhận log biến động tồn kho).
  - Trung tâm phản hồi & kiểm duyệt bình luận của khách hàng.
- **Quản trị viên (ADMIN)**:
  - Toàn quyền hệ thống, theo dõi Dashboard doanh thu và biểu đồ xu hướng.
  - Quản lý toàn bộ vòng đời sản phẩm, danh mục đa cấp, thuộc tính động (Dynamic Attribute Definitions).
  - Quản lý chương trình khuyến mãi, phân quyền tài khoản người dùng, báo cáo tài chính và xuất dữ liệu.

### 1.3. Bảng Tổng Hợp Công Nghệ (Tech Stack)

| Tầng (Layer) | Công nghệ chính | Mục đích & Đặc điểm nổi bật |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + TypeScript + Vite 7** | Hiệu năng render cao, SPA mượt mà, gõ kiểu an toàn 100% |
| **UI Component System** | **Material-UI (MUI v7) + Emotion** | Thiết kế component đồng bộ, hệ thống Theme linh hoạt |
| **Animation Engine** | **Framer Motion 13** | Diễn hoạt vật lý 60fps mượt mà, chuyển cảnh trang so le (stagger) |
| **3D Graphics Visualizer** | **Three.js + React Three Fiber + Drei** | Trình diễn mô hình 3D linh kiện / case máy tính xoay 360° |
| **Backend Core** | **Java 17 + Spring Boot 3** | Nền tảng microservices-ready mạnh mẽ, bảo mật cao |
| **Bảo mật & Xác thực** | **Spring Security 6 + JWT (JSON Web Token)** | Phiên làm việc không trạng thái (stateless), phân quyền RBAC |
| **Cơ sở dữ liệu (RDBMS)** | **PostgreSQL 15+** | Hỗ trợ dữ liệu quan hệ chặt chẽ và cột kiểu **JSONB** lưu thông số kỹ thuật động |
| **ORM & Data Access** | **Spring Data JPA / Hibernate** | Quản lý thực thể, tự động tối ưu truy vấn, quan hệ bảng |
| **Trí tuệ Nhân tạo (AI)** | **Google Gemini API (1.5 Flash / Pro)** + Local Engine | Phân tích tương thích, chấm điểm cấu hình, phát hiện nghẽn cổ chai |
| **Container & Triển khai** | **Docker, Docker Compose, Render Cloud** | Đóng gói môi trường đồng nhất, CI/CD tự động qua GitHub Actions |

---

## 2. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

```
                       +-------------------------------------------------+
                       |                   CLIENT TIER                   |
                       |  - React 18 SPA (Vite + TypeScript)             |
                       |  - Material-UI v7 + Framer Motion (60fps)       |
                       |  - Three.js / React Three Fiber (3D Viewers)    |
                       +-------------------------------------------------+
                                                |
                                    RESTful APIs / JSON / JWT
                                                |
                                                v
                       +-------------------------------------------------+
                       |                 API GATEWAY TIER                |
                       |  - Nginx Reverse Proxy (Docker Environment)     |
                       |  - CORS Filter / Rate Limiting / Security Headers|
                       +-------------------------------------------------+
                                                |
                                                v
                       +-------------------------------------------------+
                       |                  BACKEND TIER                   |
                       |            (Spring Boot 3 - Java 17)            |
                       |                                                 |
                       |  [Controllers]  Cart, Category, Comment, Order, |
                       |                 Product, Promotion, User, Inv   |
                       |                                                 |
                       |  [Services]     Auth, Order Processing, Stock,   |
                       |                 Inventory Log, Category Schema  |
                       |                                                 |
                       |  [Security]     JwtFilter, Role-based Guard     |
                       +-------------------------------------------------+
                                  |                           |
                       JDBC / JPA Hibernate        REST API Call (HTTPS)
                                  |                           |
                                  v                           v
             +------------------------------+   +------------------------------+
             |        DATABASE TIER         |   |          AI SERVICE          |
             |       (PostgreSQL 15+)       |   |      (Google Gemini Pro      |
             |  - 14 Tables with Foreign Keys|  |    + Local Hardware Rules)   |
             |  - JSONB for dynamic specs   |   |  - Bottleneck %, Wattage Est |
             +------------------------------+   +------------------------------+
```

### 2.1. Thiết Kế Cơ Sở Dữ Liệu Chi Tiết (Database Schema)
Cơ sở dữ liệu gồm 14 bảng liên kết quan hệ chặt chẽ với các ràng buộc khóa ngoại và tính năng mở rộng:

1. `roles`: Bảng vai trò hệ thống (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_CUSTOMER`).
2. `users`: Thông tin tài khoản, email, số điện thoại, mật khẩu mã hóa BCrypt, trạng thái kích hoạt.
3. `categories`: Danh mục sản phẩm hỗ trợ cấu trúc cây phân cấp cha - con (`parent_category_id`).
4. `products`: Lưu trữ thông tin sản phẩm, giá bán, số lượng, ngưỡng cảnh báo tồn thấp (`low_stock_threshold`), đặc biệt sử dụng 2 trường **JSONB**:
   - `specifications`: Thông số hiển thị (vd: Tốc độ xung nhịp, kích thước, socket, TDP...).
   - `attributes`: Các cặp key-value định chuẩn dùng cho bộ lọc nâng cao.
5. `attribute_definitions`: Bảng định nghĩa trường thuộc tính động theo từng danh mục (vd: Danh mục CPU có trường socket, RAM có trường chuẩn DDR...). Quản trị viên có thể thêm trường lọc mà không cần sửa cấu trúc bảng Database.
6. `product_images`: Thư viện ảnh đính kèm của sản phẩm, gắn cờ ảnh chính (`is_primary`).
7. `carts` & `cart_items`: Lưu giỏ hàng của từng khách hàng, tự động đồng bộ khi đăng nhập.
8. `orders` & `order_items`: Lưu đơn đặt hàng, địa chỉ nhận hàng, phương thức thanh toán, phí ship, mã khuyến mãi đã dùng và danh sách sản phẩm snapshot giá tại thời điểm mua.
9. `comments`: Đánh giá sao (1-5 sao) và bình luận trải nghiệm của khách hàng.
10. `inventory_logs`: Nhật ký theo dõi biến động số lượng tồn kho (Nhập hàng, Bán hàng, Điều chỉnh, Trả hàng).
11. `promotions`: Quản lý voucher mã giảm giá (giảm theo % hoặc số tiền, giá trị đơn tối thiểu, số lượt dùng).
12. `tokens`: Quản lý JWT Refresh Token, kiểm soát phiên đăng nhập và thu hồi phiên (revoke).

---

## 3. DANH SÁCH & MÔ TẢ CHI TIẾT TẤT CẢ CHỨC NĂNG

### 3.1. Phân Hệ Khách Hàng (Customer Storefront)

#### A. Trang Chủ & Điều Hướng (Home & Navigation)
- **Thanh AppBar Frosted Glass**: Thiết kế kính mờ bám đỉnh trang (`backdrop-filter: blur(16px)`), logo thương hiệu ánh kim cương gradient, thanh tìm kiếm thông minh tự động gợi ý, huy hiệu giỏ hàng động nảy số lượng, nút chuyển chế độ Sáng / Tối (Light/Dark mode) với hiệu ứng xoay mượt mà.
- **Hero Banner tương tác**: Vùng banner trình diễn công nghệ cao với ambient mesh gradient, typography sắc sảo, nút CTA chuyển thẳng đến công cụ Build PC hoặc Khám phá Sản phẩm mới.
- **Bento Categories Grid**: Lưới danh mục sản phẩm thiết kế phong cách Bento Box (CPU, GPU, RAM, Mainboard, Màn hình, Bàn phím...) với hiệu ứng phát sáng halo khi rê chuột.
- **Danh sách Sản phẩm Nổi Bật & Mới Nhất**: Tải dữ liệu động từ API, tự động gắn nhãn "Mới", "Hot", hiển thị số lượng đánh giá và giá khuyến mãi.

#### B. Tìm Kiếm & Bộ Lọc Đa Chiều Nâng Cao (Product Search & Dynamic Filters)
- **Tìm kiếm tức thì (Instant Search)**: Tìm theo tên sản phẩm, mã linh kiện, mô tả hoặc từ khóa liên quan.
- **Lọc theo khoảng giá linh hoạt**: Thanh trượt slider và ô nhập số tiền min-max.
- **Lọc theo danh mục & Thương hiệu**: Cho phép chọn nhiều thương hiệu cùng lúc (Intel, AMD, ASUS, MSI, Corsair, Gigabyte...).
- **Bộ lọc Thuộc tính Động theo Danh mục (Category-Specific Attributes)**:
  - Khi chọn CPU: Tự động hiển thị các bộ lọc: Socket (LGA1700, AM5...), Số nhân, Số luồng, Có iGPU...
  - Khi chọn RAM: Tự động hiển thị: Chuẩn RAM (DDR4, DDR5), Dung lượng (16GB, 32GB...), Bus RAM...
  - Khi chọn GPU: Tự động hiển thị: Dung lượng VRAM, Dòng chip (RTX 40-series, RX 7000-series)...
- **Sắp xếp linh hoạt**: Mới nhất, Giá tăng dần, Giá giảm dần, Tên A-Z.

#### C. Trang Chi Tiết Sản Phẩm (Product Detail Page)
- **Thư viện ảnh sản phẩm**: Hiển thị ảnh chất lượng cao, thumbnail chuyển đổi ảnh mượt mà.
- **Chế độ xem 3D tương tác (3D Interactive Viewer)**:
  - Nút chuyển đổi chế độ 2D Ảnh / 3D Mô hình trực tiếp.
  - Sử dụng Three.js & React Three Fiber: Khách hàng có thể xoay 360 độ, phóng to thu nhỏ, xem mặt trước, mặt kính, mặt sau của linh kiện/thùng máy.
- **Bảng Thông Số Kỹ Thuật Chi Tiết**: Trình bày rõ ràng theo dạng bảng sọc (zebra striping) sang trọng, tự thích ứng màu nền theo chế độ Light / Dark.
- **Thêm Vào Giỏ Hàng Nhanh**: Chọn số lượng trực quan, tự động kiểm tra số lượng tồn khả dụng, thông báo toast animation sinh động.
- **Hệ Thống Đánh Giá & Bình Luận**: Khách hàng đã mua hàng có thể gửi đánh giá sao (1-5 sao) và nhận xét; hiển thị câu trả lời chính thức từ nhân viên kỹ thuật.

#### D. Công Cụ Build PC Chuyên Sâu & Cố Vấn Tương Thích AI (PC Builder Tool)
Đây là tính năng độc đáo và mạnh mẽ nhất của hệ thống:
1. **15 Vị Trí Linh Kiện Đầy Đủ**:
   - Vi xử lý (CPU), Bo mạch chủ (Mainboard), Bộ nhớ RAM (RAM 1 & RAM 2), Ổ cứng lưu trữ (SSD/HDD 1, 2, 3), Card đồ họa (GPU), Nguồn máy tính (PSU), Vỏ máy tính (Case), Tản nhiệt CPU (Khí/AIO), Quạt case (Case Fan 1 & 2), Màn hình, Bàn phím, Chuột.
2. **Hộp Thoại Chọn Linh Kiện Tối Ưu (Part Picker Dialog)**:
   - Tự động lọc các linh kiện thuộc danh mục tương ứng.
   - Tìm kiếm và lọc theo thương hiệu, khoảng giá và thuộc tính ngay trong modal.
3. **Bộ Kiểm Tra Tương Thích Phần Cứng Thời Gian Thực (Rule-Based Compatibility Checker)**:
   - *Kiểm tra Socket*: Báo lỗi ngay lập tức nếu chọn CPU socket LGA1700 cắm vào bo mạch chủ AM5.
   - *Kiểm tra RAM*: Cảnh báo xung đột nếu bo mạch chủ chỉ hỗ trợ DDR5 nhưng người dùng chọn RAM DDR4.
   - *Kiểm tra Kích thước Form Factor*: Cảnh báo nếu chọn Mainboard chuẩn E-ATX nhưng vỏ case chỉ hỗ trợ Micro-ATX hoặc Mini-ITX.
   - *Kiểm tra Chiều dài GPU*: Đo kích thước card màn hình so với chiều dài tối đa của vỏ case.
   - *Kiểm tra Công suất Nguồn (PSU Wattage)*: Tự động cộng tổng TDP tiêu thụ của CPU + GPU + linh kiện phụ và so sánh với công suất bộ nguồn, cảnh báo nếu nguồn thiếu tải.
4. **Cố Vấn Phần Cứng AI (AI Hardware Advisor)**:
   - Tích hợp **Google Gemini AI Pro** song hành cùng **Hệ thống Chuyên gia Phần cứng Nội bộ (Local Expert Engine)**.
   - **Chấm Điểm Cấu Hình**: Điểm số tương thích và tối ưu trên thang 10.0 (vd: 9.8/10 - Tương thích tối ưu).
   - **Phân Tích Nghẽn Cổ Chai (Bottleneck Analysis)**: Đo lường tỷ lệ % nghẽn hiệu năng giữa CPU và GPU, chỉ rõ linh kiện đang kéo lùi dàn máy (vd: Nghẽn ~24% do CPU yếu hơn GPU).
   - **Ước Tính Công Suất Tiêu Thụ Đỉnh**: Tính toán số Watt ước tính và khuyến nghị công suất nguồn lý tưởng kèm tỷ lệ dự phòng an toàn (Headroom 20-30%).
   - **Lời Khuyên Hành Động Thực Tế (Actionable Advice)**: Đưa ra 3-5 lời khuyên nâng cấp hoặc thay thế chi tiết.
5. **Xuất Báo Giá Chuẩn Thương Mại Ra File Excel**:
   - Tự động xuất toàn bộ bảng linh kiện đã chọn, số lượng, đơn giá, thành tiền, thuế VAT và tổng cộng ra tệp `.xlsx` có định dạng chuyên nghiệp để in ấn hoặc lưu trữ.
6. **Thêm Nguyên Dàn Vào Giỏ Hàng Trong 1 Click**:
   - Chuyển thẳng toàn bộ danh sách linh kiện đã chọn vào giỏ hàng để tiến hành thanh toán mà không cần thao tác từng món.

#### E. Giỏ Hàng & Thanh Toán Chuẩn Hóa (Cart & Checkout Stepper)
- **Giỏ Hàng Động**: Cập nhật tăng giảm số lượng tức thì, tự động tính tổng tiền tạm tính, thuế VAT và tiền tiết kiệm từ voucher.
- **Quy trình Thanh Toán 3 Bước (Checkout Stepper)**:
  1. *Bước 1 - Thông tin nhận hàng*: Họ tên, số điện thoại, địa chỉ chi tiết, ghi chú giao hàng.
  2. *Bước 2 - Phương thức vận chuyển & Thanh toán*: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng (QR Code / Bank Transfer).
  3. *Bước 3 - Xác nhận & Đặt hàng*: Tóm tắt chi phí, kiểm tra khóa tồn kho và cấp mã vận đơn tức thời.

#### F. Quản Lý Tài Khoản Cá Nhân & Đơn Hàng (User Profile & Order Tracking)
- Cập nhật thông tin cá nhân, số điện thoại, địa chỉ mặc định, đổi mật khẩu.
- Lịch sử đơn hàng: Xem danh sách đơn đã đặt, xem chi tiết từng mặt hàng và dòng thời gian trạng thái (Chờ xác nhận -> Đã xác nhận -> Đang giao -> Thành công / Đã hủy).

---

### 3.2. Phân Hệ Nhân Viên (Staff Operations)

1. **Bảng Điều Khiển Nhân Viên (Staff Dashboard)**:
   - Xem tổng quan các đơn hàng cần xử lý gấp trong ngày.
   - Theo dõi danh sách sản phẩm sắp hết hàng cần đề xuất nhập thêm.
2. **Xử Lý & Quản Lý Đơn Hàng**:
   - Lọc đơn hàng theo trạng thái: Chờ xử lý (`PENDING`), Đã xác nhận (`CONFIRMED`), Đang vận chuyển (`SHIPPING`), Hoàn tất (`COMPLETED`), Đã hủy (`CANCELLED`).
   - Cập nhật chuyển trạng thái đơn hàng kèm ghi chú vận chuyển.
3. **Quản Lý Tồn Kho & Kiểm Kê (Inventory Management)**:
   - Xem danh sách số lượng hàng trong kho theo thời gian thực.
   - Cập nhật số lượng nhập kho mới hoặc điều chỉnh kho sau kiểm kê thực tế.
   - Hệ thống tự động ghi nhật ký `inventory_logs` (ai thực hiện, thời gian, lý do, số lượng thay đổi).
4. **Trung Tâm Xử Lý Bình Luận & CSKH**:
   - Xem danh sách toàn bộ bình luận của khách hàng trên trang web.
   - Trả lời thắc mắc kỹ thuật của khách hàng trực tiếp dưới danh nghĩa nhân viên cửa hàng.
   - Ẩn hoặc xóa các bình luận spam, vi phạm tiêu chuẩn cộng đồng.

---

### 3.3. Phân Hệ Quản Trị Viên (Admin Management)

1. **Bảng Điều Khiển Quản Trị (Admin Master Panel)**:
   - Các thẻ chỉ số thống kê thời gian thực (KPI Stat Cards): Tổng doanh thu, Số đơn hàng mới, Số lượng khách hàng, Tổng sản phẩm hoạt động.
   - **Biểu Đồ Xu Hướng Tăng Trưởng Động (Admin Trend Chart)**:
     - Biểu đồ đường cong Bezier và vùng phủ mờ (Area SVG Chart) trực quan hóa doanh thu 6 tháng gần nhất và sản lượng đơn hàng.
     - Hỗ trợ đổi chế độ xem Doanh thu / Đơn hàng chỉ với 1 click, tooltip hiển thị giá trị số chính xác khi hover.
2. **Quản Lý Danh Mục Sản Phẩm (Category Management)**:
   - Thêm, sửa, xóa, phân cấp danh mục cha - con không giới hạn cấp độ.
   - Kích hoạt / Hủy kích hoạt danh mục hiển thị trên Storefront.
3. **Quản Lý Thuộc Tính Động (Dynamic Attribute Definitions Manager)**:
   - Cho phép Quản trị viên cấu hình bộ thuộc tính riêng biệt cho từng danh mục sản phẩm (vd: tạo trường `Socket` kiểu `enum` với các lựa chọn `LGA1700`, `AM5`, `AM4`).
   - Hỗ trợ các kiểu dữ liệu: Chuỗi ký tự (String), Số (Number), Lựa chọn (Enum), Đúng/Sai (Boolean), Đơn vị đo (Unit: MHz, GB, W, mm...).
4. **Quản Lý Sản Phẩm Toàn Diện (Product Management)**:
   - Tạo mới sản phẩm với giao diện form hiện đại, upload nhiều hình ảnh cùng lúc.
   - Nhập thông số kỹ thuật động theo form mẫu của từng danh mục.
   - Cấu hình ngưỡng cảnh báo tồn kho thấp (`low_stock_threshold`).
   - Tìm kiếm nhanh, lọc theo danh mục, trạng thái còn hàng/hết hàng.
5. **Quản Lý Khuyến Mãi & Voucher (Promotion Management)**:
   - Tạo mã giảm giá (Mã code, % giảm hoặc số tiền cố định, mức giảm tối đa, giá trị đơn hàng tối thiểu áp dụng).
   - Thiết lập thời gian hiệu lực (Ngày bắt đầu - Ngày kết thúc) và giới hạn lượt sử dụng.
6. **Quản Lý Người Dùng & Phân Quyền Bảo Mật (User & Role Management)**:
   - Danh sách toàn bộ tài khoản trong hệ thống.
   - Chuyển đổi vai trò người dùng (Thăng cấp lên `STAFF`, `ADMIN` hoặc chuyển về `CUSTOMER`).
   - Khóa / Kích hoạt lại tài khoản có dấu hiệu bất thường.
7. **Báo Cáo Doanh Thu & Kho Hàng (Financial & Inventory Reports)**:
   - Thống kê doanh thu theo mốc thời gian (Tuần, Tháng, Quý, Năm).
   - Danh sách sản phẩm bán chạy nhất (Top Sellers) và sản phẩm tồn kho lâu ngày.

---

## 4. THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (DESIGN SYSTEM & UI/UX)

### 4.1. Triết Lý Thiết Kế: Chuẩn Quốc Tế & Tương Tác Cực Mượt
Dự án được định hướng theo tiêu chuẩn giao diện của các thương hiệu công nghệ hàng đầu thế giới (Apple Store, Best Buy, NZXT, Stripe):
- **Sạch sẽ, Tinh tế, Sáng sủa (High-clarity & Cleanliness)**: Không sử dụng màu sắc chói gắt hay bố cục tối tăm nặng nề. Giao diện Light Mode làm mặc định với độ tương phản cao, dịu mắt và tôn vinh hình ảnh sản phẩm.
- **Chiều Sâu Đa Tầng Mềm Mại (Ambient Layered Depth)**: Sử dụng kỹ thuật đổ bóng khuếch tán đa lớp (ambient diffusion shadows) kết hợp viền mờ `1px` tinh tế thay vì đường kẻ đậm truyền thống.
- **Kính Mờ Hiện Đại (Frosted Glassmorphism)**: Các thành phần cố định (Navbar AppBar, Floating Action Bar) áp dụng `backdrop-filter: blur(16px)` tạo cảm giác xuyên thấu sang trọng.

### 4.2. Bảng Màu Hệ Thống (Dual Color Palette System)

#### Chế độ Sáng Chuẩn Quốc Tế (International Light Mode - Mặc định)
- **Nền tổng thể (Background Canvas)**: `#F8FAFC` (Slate 50) – nền sáng dịu nhẹ, hạn chế mỏi mắt.
- **Bề mặt thẻ (Card Surface)**: `#FFFFFF` (Pure White) – làm nổi bật ảnh sản phẩm và nội dung thông số.
- **Màu chủ đạo (Primary Accent)**: `#2563EB` (Electric Sapphire Blue) – sắc xanh công nghệ hiện đại, tự tin, chỉ số tương phản cao.
- **Màu phụ (Secondary Accent)**: `#10B981` (Emerald Mint) – biểu thị trạng thái tối ưu, còn hàng, thành công.
- **Màu cảnh báo (Warning & Deals)**: `#F59E0B` (Amber Flame) – làm nổi bật thẻ ưu đãi, giảm giá và lưu ý kỹ thuật.
- **Màu lỗi / Xung đột**: `#EF4444` (Crimson Rose) – cảnh báo lỗi phần cứng, hết hàng, xóa linh kiện.
- **Hệ thống chữ (Text Slate)**: `#0F172A` (Heading H1-H6), `#334155` (Body chính), `#64748B` (Muted / Chú thích).

#### Chế độ Tối Công Nghệ (Obsidian Slate Dark Mode)
- **Nền tổng thể**: `#0A0E17` (Deep Obsidian).
- **Bề mặt thẻ**: `#131B2E` (Navy Slate).
- **Màu chủ đạo**: `#38BDF8` (Cyber Sky Blue).
- **Màu chữ**: `#F8FAFC` (Slate White).

### 4.3. Hệ Thống Typography (Phông Chữ Chuyên Biệt)
- **Tiêu đề (Headings)**: Font **Space Grotesk** – góc cạnh, hiện đại, mang đậm hơi thở phần cứng công nghệ cao.
- **Nội dung thân bài (Body)**: Font **Inter** – độ rõ nét và khả năng đọc tuyệt vời ở mọi kích thước màn hình.
- **Số liệu & Giá tiền (Tabular Figures)**: Font **JetBrains Mono** – phông đơn cách (monospace) giúp các hàng chữ số giá tiền, công suất Watt, phần trăm bottleneck thẳng hàng tăm tắp, không bị giật layout khi số thay đổi.

### 4.4. Hệ Thống Animation 60FPS & Tương Tác Vi Mô (Micro-Interactions)
- **Diễn hoạt Thẻ Sản Phẩm**:
  - Khi hover: Thẻ nâng nhẹ `translateY(-4px)` với gia tốc cubic-bezier `(0.16, 1, 0.3, 1)` trong `350ms`.
  - Ảnh linh kiện zoom quang học `scale(1.04)` mượt mà.
  - Vòng halo ánh sáng xanh nhạt tỏa ra quanh viền card (`0 16px 36px rgba(37, 99, 235, 0.12)`).
- **Diễn hoạt Danh Sách Sản Phẩm (Staggered Grid Entrance)**:
  - Các thẻ sản phẩm xuất hiện so le tuần tự (delay `0.03s` mỗi card) với chuyển động trượt nhẹ từ dưới lên (`y: 16 -> 0`).
- **Nút Chuyển Đổi Sáng/Tối (Theme Switcher Button)**:
  - Diễn hoạt xoay 20 độ và hiệu ứng nở icon mặt trời/mặt trăng sử dụng Framer Motion spring physics.
- **Thanh Cuộn Siêu Mỏng (Custom Slim Scrollbar)**:
  - Thiết kế chỉ 7px với bo góc tròn hoàn hảo, tự đổi màu theo theme.

---

## 5. MÔ TẢ CẤU TRÚC MÃ NGUỒN (CODEBASE DIRECTORY STRUCTURE)

### 5.1. Cấu Trúc Backend (`/backend`)
```
backend/
├── src/main/java/com/computershop/
│   ├── ComputerShopApplication.java      # Main entry point của ứng dụng Spring Boot
│   ├── config/                           # Cấu hình hệ thống (Security, JWT, CORS, WebMvc, Swagger)
│   │   ├── SecurityConfig.java           # Bộ lọc Spring Security, phân quyền URI theo vai trò
│   │   ├── JwtAuthenticationFilter.java  # Đánh chặn & xác thực JWT Bearer Token
│   │   ├── JwtTokenProvider.java         # Tạo và giải mã JWT Token
│   │   └── WebConfig.java                # Cấu hình CORS & Static Resource Upload
│   ├── controller/                       # Các REST Controller xử lý Endpoint HTTP
│   │   ├── CartController.java           # /api/cart: Quản lý giỏ hàng
│   │   ├── CategoryController.java       # /api/categories: Danh mục & thuộc tính động
│   │   ├── CommentController.java        # /api/comments: Đánh giá sản phẩm
│   │   ├── InventoryController.java      # /api/inventory: Nhập xuất kho & log
│   │   ├── OrderController.java          # /api/orders: Đặt hàng & xử lý trạng thái
│   │   ├── ProductController.java        # /api/products: CRUD sản phẩm, upload ảnh
│   │   ├── PromotionController.java      # /api/promotions: Mã giảm giá
│   │   └── UserController.java           # /api/users, /api/auth: Đăng nhập, đăng ký, profile
│   ├── dto/                              # Data Transfer Objects (Request/Response models)
│   ├── entity/                           # JPA Entities ánh xạ trực tiếp 14 bảng CSDL
│   │   ├── Product.java, User.java, Order.java, Category.java, AttributeDefinition.java...
│   │   └── Role.java, Cart.java, InventoryLog.java, Promotion.java...
│   ├── repository/                       # Spring Data JPA Repositories tương tác DB
│   ├── service/                          # Lớp nghiệp vụ chuyên sâu (Business Logic Layer)
│   └── exception/                        # Global Exception Handler xử lý lỗi tập trung
└── src/main/resources/
    ├── application.yml                   # Cấu hình kết nối DB, JWT secret, server port
    └── application-prod.yml              # Cấu hình môi trường Production / Cloud
```

### 5.2. Cấu Trúc Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── App.tsx                           # Root component định tuyến (React Router v6)
│   ├── main.tsx                          # Điểm gắn DOM gốc (Mount ReactDOM)
│   ├── index.css                         # CSS Variables, fonts, glassmorphism, scrollbars
│   ├── theme/                            # Hệ thống Theme động & Thiết kế chuẩn quốc tế
│   │   ├── colors.ts                     # lightColors, darkColors (Tokens màu sắc)
│   │   ├── typography.ts                 # Font Space Grotesk, Inter, JetBrains Mono
│   │   ├── components.ts                 # MUI Component Overrides (Button, Card, AppBar...)
│   │   ├── ThemeContext.tsx              # ThemeModeProvider (Quản lý Sáng/Tối & localStorage)
│   │   └── index.ts                      # buildTheme() khởi tạo theme theo chế độ
│   ├── components/
│   │   ├── 3d/                           # Trình diễn 3D Three.js
│   │   │   ├── ProductViewer3D.tsx       # Component xoay mô hình linh kiện 360 độ
│   │   │   └── HeroPCModel.tsx           # Dàn PC 3D hiển thị ở Hero Banner
│   │   ├── layout/                       # Giao diện khung
│   │   │   ├── AppBar.tsx                # Frosted glass Navbar, search, cart, theme switcher
│   │   │   └── Footer.tsx                # Footer thông tin, chính sách, mạng xã hội
│   │   ├── product/                      # Component liên quan đến sản phẩm
│   │   │   ├── ProductCard/              # Thẻ sản phẩm với zoom mượt, shadow diffusion
│   │   │   └── ProductGrid/              # Lưới sản phẩm với hiệu ứng xuất hiện so le
│   │   ├── cart/                         # CheckoutStepper, Giỏ hàng
│   │   └── admin/                        # AdminTrendChart (SVG Bezier mượt mà), Stats
│   ├── pages/
│   │   ├── Home/HomePage.tsx             # Trang chủ, Hero banner, Bento categories
│   │   ├── Products/                     # Danh sách sản phẩm, Tìm kiếm, Chi tiết sản phẩm
│   │   ├── BuildPC/                      # Công cụ Build PC độc quyền
│   │   │   ├── BuildPcPage.tsx           # Trang chính ráp máy
│   │   │   ├── components/
│   │   │   │   ├── CompatibilityChecker.tsx # Thẻ kiểm tra tương thích & Cố vấn AI
│   │   │   │   ├── ComponentSelector.tsx    # Hộp chọn linh kiện 15 slots
│   │   │   │   ├── PCBuilderSummary.tsx     # Tóm tắt giá tiền, xuất Excel
│   │   │   │   └── PartPickerDialog.tsx     # Modal chọn linh kiện có lọc thông số
│   │   │   └── utils/
│   │   │       ├── compatibility.ts      # Engine phân tích socket, DDR, wattage, form factor
│   │   │       └── excel.ts              # Xuất báo giá ra tệp Excel (.xlsx)
│   │   ├── Cart/CartPage.tsx             # Trang giỏ hàng
│   │   ├── Order/                        # Trang thanh toán & Theo dõi đơn hàng
│   │   ├── Profile/ProfilePage.tsx       # Trang thông tin cá nhân
│   │   ├── admin/                        # Bảng điều khiển quản trị viên (Admin Panel)
│   │   ├── staff/                        # Bảng điều khiển nhân viên (Staff Panel)
│   │   └── auth/                         # Trang đăng nhập, đăng ký
│   └── services/                         # Lớp gọi API (Axios client kết nối Backend & AI)
│       ├── api.ts                        # Axios instance cấu hình baseURL & JWT Interceptor
│       ├── aiAdvisor.service.ts          # Kết nối Gemini AI & Local Hardware Expert Engine
│       ├── product.service.ts            # API sản phẩm, lọc thông số động
│       ├── order.service.ts              # API đơn hàng
│       └── cart.service.ts, inventory.service.ts, user.service.ts...
```

---

## 6. HƯỚNG DẪN CÀI ĐẶT, KHỞI CHẠY & TRIỂN KHAI (RUNBOOK)

### 6.1. Khởi Chạy Môi Trường Cục Bộ (Local Development)

#### Bước 1: Chuẩn Bị Cơ Sở Dữ Liệu PostgreSQL
1. Cài đặt PostgreSQL 15+ hoặc sử dụng Cloud DB (Supabase / Neon).
2. Tạo cơ sở dữ liệu `pc_shop_database_2`.
3. Chạy file khởi tạo schema: `database_schema.sql`.
4. (Tùy chọn) Chạy file mẫu danh mục thuộc tính: `attr_defs_from_json.sql`.

#### Bước 2: Chạy Backend Spring Boot
1. Tạo file cấu hình môi trường `backend/.env`:
   ```env
   DATABASE_URL=jdbc:postgresql://localhost:5432/pc_shop_database_2
   DB_USERNAME=postgres
   DB_PASSWORD=your_password_here
   ```
2. Mở terminal tại thư mục `backend` và chạy:
   ```bash
   mvn clean spring-boot:run
   ```
   *Backend hoạt động tại:* `http://localhost:8080` (Tài liệu API Swagger: `http://localhost:8080/swagger-ui.html`).

#### Bước 3: Chạy Frontend React / Vite
1. Mở terminal tại thư mục `frontend`:
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```
   *Frontend hoạt động tại:* `http://localhost:5173`.

---

### 6.2. Triển Khai Nhanh Bằng Docker Compose
Chỉ cần 1 lệnh duy nhất để build và khởi động toàn bộ Frontend (serve bằng Nginx) + Backend (Java 17):

```bash
docker compose up -d --build
```
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8080`

---

### 6.3. Triển Khai Đám Mây (Render Cloud & GitHub Actions CI/CD)
- Dự án đã tích hợp sẵn tệp cấu hình **Infrastructure as Code** `render.yaml`.
- Mỗi khi push mã nguồn lên nhánh `main`, **GitHub Actions** (`.github/workflows/ci.yml`) sẽ tự động:
  1. Kiểm tra biên dịch và chạy unit test backend (`mvn verify`).
  2. Kiểm tra biên dịch kiểu TypeScript và bundle frontend (`npm run build`).
  3. Tự động trigger Render webhook để deploy dịch vụ không gián đoạn.

---

### 6.4. Danh Sách Tài Khoản Thử Nghiệm Hệ Thống

| Vai trò (Role) | Tên đăng nhập | Mật khẩu mặc định | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **ROLE_ADMIN** | `admin` | `Abc1234@` | Toàn quyền quản trị, sản phẩm, danh mục, thuộc tính, voucher, doanh thu |
| **ROLE_STAFF** | `staff` | `Abc1234@` | Quản lý đơn hàng, nhập/xuất kho tồn, trả lời bình luận CSKH |
| **ROLE_CUSTOMER** | `customer` | `Abc1234@` | Đặt hàng, giỏ hàng, Build PC, lịch sử đơn hàng cá nhân |

---

## 7. TỔNG KẾT
Dự án **Computer Hardware Store** là một hệ thống thương mại điện tử hoàn chỉnh, kết hợp hài hòa giữa:
1. **Kiến trúc phần mềm vững chắc**: Spring Boot 3 + PostgreSQL JSONB + React 18 TypeScript.
2. **Thiết kế chuẩn quốc tế**: Giao diện sáng sủa (Light Mode mặc định), animation 60fps mượt mà, hỗ trợ Dark Mode và xem 3D tương tác.
3. **Tính năng độc quyền vượt trội**: Công cụ Build PC tích hợp AI Gemini và bộ kiểm tra tương thích phần cứng chuyên sâu theo thời gian thực.
