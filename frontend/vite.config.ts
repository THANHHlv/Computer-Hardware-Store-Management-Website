/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy frontend /api/* to backend http://localhost:8080 to bypass CORS in development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // No rewrite needed; '/api/v1' -> 'http://localhost:8080/api/v1'
      },
      // Proxy backend static resources (depends on Spring resource handlers)
      '/images': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/pages/BuildPC/utils/compatibility.ts',
        'src/services/aiAdvisor.service.ts',
        'src/pages/BuildPC/components/CompatibilityChecker.tsx',
      ],
    },
  },
})

