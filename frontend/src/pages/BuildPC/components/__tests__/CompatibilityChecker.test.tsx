import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CompatibilityChecker } from '../CompatibilityChecker';
import { EMPTY_SELECTED, type CompatibilityIssue } from '../../types';
import type { AdvisorResponse } from '../../../../services/aiAdvisor.service';

const theme = createTheme();

const renderChecker = (props: React.ComponentProps<typeof CompatibilityChecker>) => {
    return render(
        <ThemeProvider theme={theme}>
            <CompatibilityChecker {...props} />
        </ThemeProvider>
    );
};

describe('CompatibilityChecker UI Component', () => {
    it('shouldRenderPerfectCompatibilityBadge_whenNoErrorsOrWarnings', () => {
        renderChecker({
            selectedParts: { ...EMPTY_SELECTED },
            warnings: [],
            advisorData: {
                compatibility_score: 10.0,
                summary: 'Cấu hình hoàn hảo',
                bottleneck_percentage: 4,
                bottleneck_component: 'NONE',
                estimated_wattage: 320,
                recommended_psu_wattage: 550,
                advice: [],
                strengths: ['Tương thích hoàn hảo'],
                source: 'expert_system',
            },
        });

        expect(screen.getByText('10.0')).toBeInTheDocument();
        expect(screen.getByText('Tương Thích Tối Ưu')).toBeInTheDocument();
        expect(screen.getByText(/Toàn bộ linh kiện đã chọn hoàn toàn ăn khớp/i)).toBeInTheDocument();
        expect(screen.getByText(/320 W/i)).toBeInTheDocument();
        expect(screen.getByText(/550W\+/i)).toBeInTheDocument();
    });

    it('shouldRenderConflictErrors_withExactIssueMessages', () => {
        const errors: CompatibilityIssue[] = [
            {
                code: 'socket_mismatch',
                message: 'Lỗi Socket: CPU sử dụng socket AM5, không khớp với Mainboard sử dụng socket LGA1700.',
                severity: 'error',
                related: ['cpu', 'mainboard'],
            },
            {
                code: 'psu_under_requirement',
                message: 'Lỗi thiếu nguồn: Nguồn 400W không đủ công suất cung cấp cho hệ thống.',
                severity: 'error',
                related: ['psu'],
            },
        ];

        renderChecker({
            selectedParts: { ...EMPTY_SELECTED },
            warnings: errors,
            advisorData: null, // Fallback score should calculate based on errors
        });

        expect(screen.getByText(/LỖI XUNG ĐỘT PHẦN CỨNG \(2\):/i)).toBeInTheDocument();
        expect(screen.getByText(/CPU sử dụng socket AM5, không khớp với Mainboard sử dụng socket LGA1700/i)).toBeInTheDocument();
        expect(screen.getByText(/Nguồn 400W không đủ công suất/i)).toBeInTheDocument();
        expect(screen.getByText('Xung Đột Phần Cứng')).toBeInTheDocument();
    });

    it('shouldRenderOptimizationWarnings_withAccurateStyling', () => {
        const warnings: CompatibilityIssue[] = [
            {
                code: 'psu_margin_low',
                message: 'Cảnh báo nguồn: Nguồn 550W đủ tải cơ bản nhưng mức dự phòng thấp.',
                severity: 'warning',
                related: ['psu'],
            },
            {
                code: 'missing_cooler_high_tdp',
                message: 'CPU có mức nhiệt lượng cao, bạn nên trang bị thêm tản nhiệt.',
                severity: 'warning',
                related: ['cpu_cooler'],
            },
        ];

        renderChecker({
            selectedParts: { ...EMPTY_SELECTED },
            warnings,
            advisorData: {
                compatibility_score: 7.2,
                summary: 'Cấu hình cần tối ưu thêm',
                bottleneck_percentage: 12,
                bottleneck_component: 'NONE',
                estimated_wattage: 420,
                recommended_psu_wattage: 650,
                advice: ['Lắp thêm tản nhiệt rời'],
                strengths: [],
                source: 'expert_system',
            },
        });

        expect(screen.getByText(/CẢNH BÁO TỐI ƯU \(2\):/i)).toBeInTheDocument();
        expect(screen.getByText(/Nguồn 550W đủ tải cơ bản nhưng mức dự phòng thấp/i)).toBeInTheDocument();
        expect(screen.getByText(/CPU có mức nhiệt lượng cao/i)).toBeInTheDocument();
        expect(screen.getByText('Cần Lưu Ý')).toBeInTheDocument();
    });

    it('shouldDisplayBottleneckAnalysisAndComponentIndicator', () => {
        const advisor: AdvisorResponse = {
            compatibility_score: 6.5,
            bottleneck_analysis: 'Nghẽn cổ chai CPU (~35%). Card đồ họa quá mạnh so với CPU.',
            bottleneck_percentage: 35,
            bottleneck_component: 'CPU',
            estimated_wattage: 500,
            recommended_psu_wattage: 750,
            advice: ['Nâng cấp CPU lên phân khúc Core i7 hoặc Ryzen 7'],
            strengths: [],
            source: 'gemini',
        };

        renderChecker({
            selectedParts: { ...EMPTY_SELECTED },
            warnings: [],
            advisorData: advisor,
        });

        expect(screen.getByText(/Nghẽn ~35% \(CPU\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Nâng cấp CPU lên phân khúc Core i7 hoặc Ryzen 7/i)).toBeInTheDocument();
        expect(screen.getByText('Gemini AI Pro')).toBeInTheDocument();
    });
});
