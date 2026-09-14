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

            System.out.println("=== MIGRATION THÀNH CÔNG RỰC RỠ! ===");
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
