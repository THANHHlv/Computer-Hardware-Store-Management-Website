package com.computershop.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình VNPay Payment Gateway.
 * Đọc các property từ application.yml với prefix "vnpay".
 * Tất cả giá trị nhạy cảm (tmn-code, hash-secret) phải được truyền qua biến môi trường,
 * KHÔNG hardcode vào source code.
 */
@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VNPayConfig {

    /** Mã website (Terminal Code) từ VNPay merchant portal */
    private String tmnCode;

    /** Secret key để ký HMAC-SHA512 — KHÔNG được log hoặc commit */
    private String hashSecret;

    /** URL trang thanh toán VNPay (sandbox hoặc production) */
    private String payUrl;

    /** URL frontend mà VNPay redirect khách về sau khi thanh toán */
    private String returnUrl;

    /** URL backend mà VNPay gọi server-to-server (IPN) */
    private String ipnUrl;

    /** Phiên bản API VNPay */
    private String version;

    /** Lệnh thanh toán (thường là "pay") */
    private String command;

    /** Mã tiền tệ (VND) */
    private String currCode;

    /** Ngôn ngữ hiển thị trên trang thanh toán VNPay */
    private String locale;
}
