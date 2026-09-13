-- =============================================
-- V002: VNPay Payment Integration Migration
-- Run this BEFORE deploying the new code.
-- Hibernate ddl-auto: update will NOT fix CHECK constraints.
-- =============================================

-- 1. Mở rộng payment_method constraint: thêm VNPAY và BANK_TRANSFER
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_payment_method;
ALTER TABLE orders ADD CONSTRAINT chk_payment_method
    CHECK (payment_method IN ('COD', 'BANK_TRANSFER', 'VNPAY'));

-- 2. Thêm cột payment_status (trạng thái thanh toán, tách biệt trạng thái đơn hàng)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE orders ADD CONSTRAINT chk_payment_status
    CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED'));

-- 3. Thêm cột vnpay_transaction_no (mã giao dịch VNPay để đối soát)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vnpay_transaction_no VARCHAR(100);

-- 4. Index cho lookup nhanh theo vnpay_transaction_no
CREATE INDEX IF NOT EXISTS idx_orders_vnpay_txn
    ON orders(vnpay_transaction_no) WHERE vnpay_transaction_no IS NOT NULL;

-- 5. Index cho tra cứu theo payment_status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
