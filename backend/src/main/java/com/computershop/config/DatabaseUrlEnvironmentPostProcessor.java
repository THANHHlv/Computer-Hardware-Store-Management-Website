package com.computershop.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Tự động chuẩn hóa DATABASE_URL từ Render hoặc các Cloud providers:
 * - Hỗ trợ URL dạng "postgresql://" hoặc "postgres://" -> tự động chuyển thành "jdbc:postgresql://"
 * - Tự động trích xuất username & password nếu được nhúng trong URL (ví dụ: postgresql://user:pass@host:port/db)
 * - Tự động thêm ?sslmode=require cho host external nếu chưa có
 */
@Slf4j
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DATABASE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            return;
        }

        String raw = dbUrl.trim();
        Map<String, Object> overrides = new HashMap<>();

        if (raw.startsWith("postgres://") || raw.startsWith("postgresql://")) {
            try {
                String normalized = raw.replaceFirst("^postgres://", "postgresql://");
                URI uri = new URI(normalized);

                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String query = uri.getQuery();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + (path != null ? path : "");
                if (query != null && !query.isBlank()) {
                    jdbcUrl += "?" + query;
                } else if (host != null && !host.equals("localhost") && !host.equals("127.0.0.1") && !host.startsWith("dpg-")) {
                    jdbcUrl += "?sslmode=require";
                }

                overrides.put("spring.datasource.url", jdbcUrl);

                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isBlank()) {
                    String[] parts = userInfo.split(":", 2);
                    overrides.put("spring.datasource.username", parts[0]);
                    if (parts.length > 1) {
                        overrides.put("spring.datasource.password", parts[1]);
                    }
                }

                environment.getPropertySources().addFirst(new MapPropertySource("renderDatabaseUrlProcessor", overrides));
            } catch (Exception e) {
                // Fallback: chỉ thêm prefix jdbc:
                overrides.put("spring.datasource.url", "jdbc:" + raw);
                environment.getPropertySources().addFirst(new MapPropertySource("renderDatabaseUrlProcessor", overrides));
            }
        }
    }
}
