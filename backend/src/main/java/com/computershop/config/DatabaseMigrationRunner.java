package com.computershop.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Tự động chạy migration cho các constraint và cột mới của VNPay.
 * Chạy tự động khi Spring Boot khởi động, và hỗ trợ chạy standalone qua main().
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        migrate(jdbcTemplate);
    }

    public static void migrate(JdbcTemplate jdbcTemplate) {
        log.info("Kiểm tra và thực thi migration database cho VNPay...");
        try {
            // 1. Mở rộng payment_method constraint: thêm VNPAY và BANK_TRANSFER
            jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_payment_method;");
            jdbcTemplate.execute("ALTER TABLE orders ADD CONSTRAINT chk_payment_method CHECK (payment_method IN ('COD', 'BANK_TRANSFER', 'VNPAY'));");
            log.info("Đã cập nhật constraint chk_payment_method trên bảng orders.");

            // 2. Thêm cột payment_status nếu chưa có
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING';");
            jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_payment_status;");
            jdbcTemplate.execute("ALTER TABLE orders ADD CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED'));");
            log.info("Đã cập nhật cột payment_status và constraint chk_payment_status.");

            // 3. Thêm cột vnpay_transaction_no nếu chưa có
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS vnpay_transaction_no VARCHAR(100);");
            log.info("Đã cập nhật cột vnpay_transaction_no.");

            // 4. Index cho lookup nhanh theo vnpay_transaction_no
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_orders_vnpay_txn ON orders(vnpay_transaction_no) WHERE vnpay_transaction_no IS NOT NULL;");

            // 5. Index cho tra cứu theo payment_status
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);");

            log.info("Migration database cho VNPay hoàn tất thành công!");

            // ===== WISHLIST MIGRATION =====
            jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS wishlists_seq START 1;");
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS wishlists (
                    id BIGINT PRIMARY KEY DEFAULT nextval('wishlists_seq'),
                    user_id BIGINT NOT NULL,
                    product_id BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                    CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id)
                );
            """);
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);");
            log.info("Migration database cho Wishlist hoàn tất thành công!");

        } catch (Exception e) {
            log.error("Lỗi khi thực thi database migration: {}", e.getMessage(), e);
        }
    }

    // Main method để chạy trực tiếp qua Maven: mvn compile exec:java -Dexec.mainClass="com.computershop.config.DatabaseMigrationRunner"
    public static void main(String[] args) {
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = "jdbc:postgresql://dpg-dai27h1ijrss738c74m0-a.oregon-postgres.render.com:5432/pcshop_0uxk?sslmode=require";
        }
        String user = System.getenv("DB_USERNAME");
        if (user == null || user.isBlank()) {
            user = "thanhlv";
        }
        String password = System.getenv("DB_PASSWORD");
        if (password == null || password.isBlank()) {
            password = "oOkgxCkPSnm7jj0sxbfmlSqWaHBDTleS";
        }

        System.out.println("=== KẾT NỐI DATABASE: " + dbUrl + " ===");
        try (Connection conn = DriverManager.getConnection(dbUrl, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Đang thực thi các câu lệnh migration...");

            stmt.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_payment_method;");
            stmt.execute("ALTER TABLE orders ADD CONSTRAINT chk_payment_method CHECK (payment_method IN ('COD', 'BANK_TRANSFER', 'VNPAY'));");
            System.out.println("[OK] 1. Đã sửa constraint chk_payment_method cho phép 'COD', 'BANK_TRANSFER', 'VNPAY'");

            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING';");
            stmt.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_payment_status;");
            stmt.execute("ALTER TABLE orders ADD CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED'));");
            System.out.println("[OK] 2. Đã thêm cột payment_status và constraint chk_payment_status");

            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS vnpay_transaction_no VARCHAR(100);");
            System.out.println("[OK] 3. Đã thêm cột vnpay_transaction_no");

            stmt.execute("CREATE INDEX IF NOT EXISTS idx_orders_vnpay_txn ON orders(vnpay_transaction_no) WHERE vnpay_transaction_no IS NOT NULL;");
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);");
            System.out.println("[OK] 4. Đã tạo các index idx_orders_vnpay_txn và idx_orders_payment_status");

            System.out.println("=== MIGRATION THÀNH CÔNG! ===");
            try (java.sql.ResultSet rs = stmt.executeQuery("SELECT id, order_code, payment_method, status, created_at FROM orders ORDER BY id DESC LIMIT 5")) {
                while (rs.next()) {
                    System.out.println("ORDER: id=" + rs.getLong("id")
                            + ", code=" + rs.getString("order_code")
                            + ", method=" + rs.getString("payment_method")
                            + ", status=" + rs.getString("status")
                            + ", created_at=" + rs.getTimestamp("created_at"));
                }
            }

            com.computershop.config.VNPayConfig cfg = new com.computershop.config.VNPayConfig();
            cfg.setTmnCode("D66TTI4G");
            cfg.setHashSecret("PHZDECBXGRERDUMSMFRUUCWZNVKUVCYT");
            cfg.setPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
            cfg.setReturnUrl("http://localhost:5173/order/vnpay-return");
            cfg.setVersion("2.1.0");
            cfg.setCommand("pay");
            cfg.setCurrCode("VND");
            cfg.setLocale("vn");

            com.computershop.service.VNPayService vnPayService = new com.computershop.service.VNPayService(cfg);
            com.computershop.entity.Order testOrder = new com.computershop.entity.Order();
            testOrder.setId(9L);
            testOrder.setOrderCode("ORD-20260914090933-360A2C");
            testOrder.setFinalAmount(new java.math.BigDecimal("50000.00"));

            String testUrl = vnPayService.createPaymentUrl(testOrder, null);
            System.out.println(">>> GENERATED VNPAY URL: " + testUrl);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
