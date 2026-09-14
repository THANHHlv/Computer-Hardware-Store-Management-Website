package com.computershop.controller;

import com.computershop.config.VNPayConfig;
import com.computershop.entity.Order;
import com.computershop.repository.OrderRepository;
import com.computershop.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý thanh toán VNPay.
 * 
 * Endpoints:
 * - POST /api/payments/vnpay/create/{orderId} — tạo URL thanh toán (yêu cầu CUSTOMER auth)
 * - GET  /api/payments/vnpay/return          — VNPay redirect khách về (public)
 * - POST /api/payments/vnpay/ipn             — VNPay server-to-server callback (public, nguồn tin cậy duy nhất)
 */
@RestController
@RequestMapping({"/api/v1/payments/vnpay", "/api/payments/vnpay"})
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VNPayService vnPayService;
    private final OrderRepository orderRepository;
    private final VNPayConfig vnPayConfig;

    /**
     * Tạo URL thanh toán VNPay cho một đơn hàng đang PENDING.
     * Frontend sẽ redirect khách sang URL này.
     */
    @PostMapping("/create/{orderId}")
    public ResponseEntity<Map<String, String>> createPaymentUrl(
            @PathVariable Long orderId,
            HttpServletRequest request) {

        log.info("VNPay create payment request for orderId: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + orderId));

        // Chỉ cho phép tạo URL thanh toán cho đơn đang PENDING
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            log.warn("Order {} is not PENDING (status: {}), cannot create VNPay payment", orderId, order.getStatus());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Đơn hàng không ở trạng thái chờ thanh toán");
            return ResponseEntity.badRequest().body(error);
        }

        // Kiểm tra phương thức thanh toán phải là VNPAY
        if (order.getPaymentMethod() != Order.PaymentMethod.VNPAY) {
            log.warn("Order {} payment method is {} (not VNPAY)", orderId, order.getPaymentMethod());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Đơn hàng không sử dụng phương thức thanh toán VNPay");
            return ResponseEntity.badRequest().body(error);
        }

        String paymentUrl = vnPayService.createPaymentUrl(order, request);

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    /**
     * VNPay redirect khách về URL này sau khi thanh toán.
     * CHỈ dùng để hiển thị kết quả cho khách — KHÔNG chốt đơn hàng ở đây.
     * Trạng thái thật do IPN quyết định.
     * 
     * Redirect sang frontend VNPay return page với các query params.
     */
    @GetMapping("/return")
    public ResponseEntity<Map<String, String>> vnpayReturn(HttpServletRequest request) {
        Map<String, String> params = extractVnPayParams(request);
        log.info("VNPay return — TxnRef: {}, ResponseCode: {}",
                params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"));

        boolean isValidSignature = vnPayService.verifySignature(params);

        Map<String, String> response = new HashMap<>();
        response.put("vnp_TxnRef", params.getOrDefault("vnp_TxnRef", ""));
        response.put("vnp_ResponseCode", params.getOrDefault("vnp_ResponseCode", ""));
        response.put("vnp_TransactionNo", params.getOrDefault("vnp_TransactionNo", ""));
        response.put("vnp_Amount", params.getOrDefault("vnp_Amount", ""));
        response.put("vnp_OrderInfo", params.getOrDefault("vnp_OrderInfo", ""));
        response.put("signatureValid", String.valueOf(isValidSignature));

        String txnRef = params.getOrDefault("vnp_TxnRef", "");
        String transactionNo = params.getOrDefault("vnp_TransactionNo", "");

        if (isValidSignature && "00".equals(params.get("vnp_ResponseCode"))) {
            // Cập nhật đơn hàng (phòng ngừa trường hợp IPN chưa đến hoặc chạy localhost)
            orderRepository.findByOrderCode(txnRef).ifPresent(order -> {
                if (order.getPaymentStatus() != Order.PaymentStatus.PAID) {
                    order.setPaymentStatus(Order.PaymentStatus.PAID);
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                    order.setVnpayTransactionNo(transactionNo);
                    orderRepository.save(order);
                    log.info("VNPay return: Cập nhật thành công đơn hàng {} sang PAID/CONFIRMED", txnRef);
                }
            });
            response.put("status", "SUCCESS");
            response.put("message", "Thanh toán thành công");
        } else {
            if (isValidSignature) {
                orderRepository.findByOrderCode(txnRef).ifPresent(order -> {
                    if (order.getPaymentStatus() != Order.PaymentStatus.PAID) {
                        order.setPaymentStatus(Order.PaymentStatus.FAILED);
                        order.setVnpayTransactionNo(transactionNo);
                        orderRepository.save(order);
                        log.info("VNPay return: Cập nhật đơn hàng {} sang FAILED", txnRef);
                    }
                });
            }
            response.put("status", "FAILED");
            response.put("message", isValidSignature
                    ? "Thanh toán không thành công (mã: " + params.getOrDefault("vnp_ResponseCode", "unknown") + ")"
                    : "Chữ ký không hợp lệ");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * IPN (Instant Payment Notification) — VNPay gọi trực tiếp từ server.
     * Hỗ trợ cả GET và POST tùy cấu hình gateway.
     * 
     * Phải trả về đúng format JSON: {"RspCode":"00","Message":"Confirm Success"}
     * Phải idempotent — xử lý IPN gọi trùng lặp không được trừ kho 2 lần.
     */
    @RequestMapping(value = "/ipn", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, String>> vnpayIpn(HttpServletRequest request) {
        Map<String, String> params = extractVnPayParams(request);
        String txnRef = params.getOrDefault("vnp_TxnRef", "");
        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        String transactionNo = params.getOrDefault("vnp_TransactionNo", "");
        String vnpAmount = params.getOrDefault("vnp_Amount", "0");

        log.info("VNPay IPN received — TxnRef: {}, ResponseCode: {}, TransactionNo: {}, Amount: {}",
                txnRef, responseCode, transactionNo, vnpAmount);

        // 1. Verify chữ ký
        if (!vnPayService.verifySignature(params)) {
            log.error("VNPay IPN signature verification FAILED for TxnRef: {}", txnRef);
            return ResponseEntity.ok(ipnResponse("97", "Invalid Checksum"));
        }

        // 2. Tìm order theo orderCode (vnp_TxnRef = orderCode)
        Order order = orderRepository.findByOrderCode(txnRef).orElse(null);
        if (order == null) {
            log.error("VNPay IPN: Order not found for TxnRef: {}", txnRef);
            return ResponseEntity.ok(ipnResponse("01", "Order Not Found"));
        }

        // 3. Kiểm tra số tiền khớp (chống giả mạo)
        long expectedAmount = order.getFinalAmount()
                .multiply(new BigDecimal("100"))
                .longValue();
        long receivedAmount;
        try {
            receivedAmount = Long.parseLong(vnpAmount);
        } catch (NumberFormatException e) {
            log.error("VNPay IPN: Invalid amount format: {}", vnpAmount);
            return ResponseEntity.ok(ipnResponse("04", "Invalid Amount"));
        }

        if (expectedAmount != receivedAmount) {
            log.error("VNPay IPN: Amount mismatch for TxnRef: {} — expected: {}, received: {}",
                    txnRef, expectedAmount, receivedAmount);
            return ResponseEntity.ok(ipnResponse("04", "Invalid Amount"));
        }

        // 4. Idempotent check — nếu đã xử lý rồi thì trả về OK mà không xử lý lại
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            log.info("VNPay IPN: Order {} already confirmed (PAID), skipping duplicate IPN", txnRef);
            return ResponseEntity.ok(ipnResponse("02", "Order Already Confirmed"));
        }

        // 5. Xử lý kết quả thanh toán
        if ("00".equals(responseCode)) {
            // Thanh toán thành công
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            order.setVnpayTransactionNo(transactionNo);
            orderRepository.save(order);

            log.info("VNPay IPN: Payment SUCCESS for order {} — TransactionNo: {}, Amount: {}",
                    txnRef, transactionNo, vnpAmount);

            return ResponseEntity.ok(ipnResponse("00", "Confirm Success"));
        } else {
            // Thanh toán thất bại
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            order.setVnpayTransactionNo(transactionNo);
            orderRepository.save(order);

            log.warn("VNPay IPN: Payment FAILED for order {} — ResponseCode: {}", txnRef, responseCode);

            return ResponseEntity.ok(ipnResponse("00", "Confirm Success"));
        }
    }

    /**
     * Helper: build response đúng format VNPay IPN yêu cầu.
     */
    private Map<String, String> ipnResponse(String rspCode, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("RspCode", rspCode);
        response.put("Message", message);
        return response;
    }

    /**
     * Helper: extract tất cả VNPay params từ request (GET query params hoặc POST form params).
     */
    private Map<String, String> extractVnPayParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();

        for (Map.Entry<String, String[]> entry : requestParams.entrySet()) {
            String key = entry.getKey();
            String[] values = entry.getValue();
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        }

        return params;
    }
}
