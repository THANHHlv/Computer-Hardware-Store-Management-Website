package com.computershop.service;

import com.computershop.config.VNPayConfig;
import com.computershop.entity.Order;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service xử lý thanh toán VNPay.
 * - Tạo URL redirect sang trang thanh toán VNPay (sandbox hoặc production).
 * - Xác thực chữ ký (HMAC-SHA512) cho Return URL và IPN callback.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    private static final DateTimeFormatter VN_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /**
     * Tạo URL thanh toán VNPay cho một đơn hàng.
     *
     * @param order   Đơn hàng cần thanh toán (phải có orderCode, finalAmount)
     * @param request HttpServletRequest để lấy IP client
     * @return URL đầy đủ để redirect khách sang trang thanh toán VNPay
     */
    public String createPaymentUrl(Order order, HttpServletRequest request) {
        log.info("Tạo URL thanh toán VNPay cho đơn hàng: {} (orderCode: {})", order.getId(), order.getOrderCode());

        if (vnPayConfig.getTmnCode() == null || vnPayConfig.getTmnCode().isBlank()
                || vnPayConfig.getHashSecret() == null || vnPayConfig.getHashSecret().isBlank()) {
            log.error("VNPay configuration missing: VNPAY_TMN_CODE or VNPAY_HASH_SECRET is blank.");
            throw new RuntimeException("Chưa cấu hình VNPAY_TMN_CODE hoặc VNPAY_HASH_SECRET trong file .env của backend.");
        }

        // Số tiền VNPay yêu cầu nhân 100 (đơn vị xu)
        long amount = order.getFinalAmount()
                .multiply(new BigDecimal("100"))
                .longValue();

        String vnpTxnRef = order.getOrderCode();
        String vnpOrderInfo = "Thanh toan don hang " + order.getOrderCode();
        String ipAddress = getClientIpAddress(request);
        
        // VNPay bắt buộc sử dụng múi giờ GMT+7 (Asia/Ho_Chi_Minh)
        ZoneId vnZone = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(vnZone);
        String createDate = now.format(VN_DATE_FORMAT);
        String expireDate = now.plusMinutes(20).format(VN_DATE_FORMAT);

        // Build tham số theo chuẩn VNPay
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", vnPayConfig.getVersion());
        params.put("vnp_Command", vnPayConfig.getCommand());
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", vnPayConfig.getCurrCode());
        params.put("vnp_TxnRef", vnpTxnRef);
        params.put("vnp_OrderInfo", vnpOrderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", vnPayConfig.getLocale());
        params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        // Build query string và hash data (đã sort theo alphabet nhờ TreeMap)
        StringBuilder queryBuilder = new StringBuilder();
        StringBuilder hashData = new StringBuilder();
        boolean first = true;

        for (Map.Entry<String, String> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            if (value != null && !value.isEmpty()) {
                if (!first) {
                    hashData.append('&');
                    queryBuilder.append('&');
                }
                first = false;

                String encodedKey = URLEncoder.encode(key, StandardCharsets.US_ASCII);
                String encodedValue = URLEncoder.encode(value, StandardCharsets.US_ASCII);

                hashData.append(encodedKey).append('=').append(encodedValue);
                queryBuilder.append(encodedKey).append('=').append(encodedValue);
            }
        }

        // Tính chữ ký HMAC-SHA512
        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryBuilder.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryBuilder;

        log.info("URL thanh toán VNPay đã tạo cho đơn hàng {} — txnRef: {}, amount: {} xu",
                order.getId(), vnpTxnRef, amount);

        return paymentUrl;
    }

    /**
     * Xác thực chữ ký từ VNPay (dùng cho cả Return URL và IPN).
     *
     * @param params Map các tham số VNPay trả về (bao gồm vnp_SecureHash)
     * @return true nếu chữ ký hợp lệ
     */
    public boolean verifySignature(Map<String, String> params) {
        // Tách vnp_SecureHash ra khỏi map
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isEmpty()) {
            log.warn("VNPay signature verification failed: vnp_SecureHash is missing");
            return false;
        }

        // Xóa các field hash ra khỏi bản sao để tính lại
        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");

        // Build hash data (sort theo alphabet, nhờ TreeMap)
        StringBuilder hashData = new StringBuilder();
        boolean first = true;

        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            if (value != null && !value.isEmpty()) {
                if (!first) {
                    hashData.append('&');
                }
                first = false;

                String encodedKey = URLEncoder.encode(key, StandardCharsets.US_ASCII);
                String encodedValue = URLEncoder.encode(value, StandardCharsets.US_ASCII);

                hashData.append(encodedKey).append('=').append(encodedValue);
            }
        }

        // Tính lại hash và so sánh
        String calculatedHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        boolean isValid = calculatedHash.equalsIgnoreCase(receivedHash);

        if (!isValid) {
            log.warn("VNPay signature verification failed — expected: {}..., received: {}...",
                    calculatedHash.substring(0, Math.min(16, calculatedHash.length())),
                    receivedHash.substring(0, Math.min(16, receivedHash.length())));
        } else {
            log.debug("VNPay signature verified successfully");
        }

        return isValid;
    }

    /**
     * Tính HMAC-SHA512.
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKeySpec);
            byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("HMAC-SHA512 computation failed", e);
            throw new RuntimeException("Lỗi tính toán chữ ký HMAC-SHA512", e);
        }
    }

    /**
     * Lấy IP thật của client, xử lý cả trường hợp qua proxy/load balancer.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }
        // Thử các header proxy phổ biến trước
        String[] headerNames = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_CLIENT_IP"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For có thể chứa nhiều IP, lấy IP đầu tiên (client gốc)
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                log.debug("Client IP from header {}: {}", header, ip);
                return ip;
            }
        }

        // Fallback: getRemoteAddr
        String remoteAddr = request.getRemoteAddr();
        log.debug("Client IP from remoteAddr: {}", remoteAddr);
        return remoteAddr;
    }
}
