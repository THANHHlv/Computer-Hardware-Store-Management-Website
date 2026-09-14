import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    aiAdvisorService,
    generateLocalExpertAnalysis,
    buildAdvisorPayload,
    type AdvisorResponse,
} from '../aiAdvisor.service';
import { EMPTY_SELECTED, type SelectedParts, type CompatibilityIssue } from '../../pages/BuildPC/types';
import type { Product } from '../../types/product.types';

const createProduct = (partial: Partial<Product>): Product => ({
    id: 1,
    name: 'Sample Component',
    description: 'Sample Description',
    price: 1000000,
    quantity: 10,
    low_stock_threshold: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
        id: 1,
        name: 'Component',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    specifications: {},
    attributes: {},
    ...partial,
});

describe('AI Advisor — Local Hardware Expert Engine', () => {
    const getParts = (): SelectedParts => ({ ...EMPTY_SELECTED });

    describe('CPU & GPU Synergy & Bottleneck Analysis', () => {
        it('shouldDetectCpuBottleneck_whenGpuTierIsFarHigherThanCpuTier', () => {
            const parts = getParts();
            parts.cpu = createProduct({ name: 'Intel Core i3-12100' }); // Tier 2
            parts.gpu = createProduct({ name: 'NVIDIA GeForce RTX 4090 24GB' }); // Tier 5
            // diff = 5 - 2 = 3 >= 2 -> CPU Bottleneck

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.bottleneck_component).toBe('CPU');
            expect(result.bottleneck_percentage).toBeGreaterThanOrEqual(20);
            expect(result.bottleneck_analysis).toContain('Nghẽn cổ chai CPU');
            expect(result.advice.some(a => a.includes('Nâng cấp CPU'))).toBe(true);
            expect(result.source).toBe('expert_system');
        });

        it('shouldDetectGpuBottleneck_whenCpuTierIsFarHigherThanGpuTier', () => {
            const parts = getParts();
            parts.cpu = createProduct({ name: 'Intel Core i9-14900K' }); // Tier 5
            parts.gpu = createProduct({ name: 'NVIDIA GeForce GTX 1650 4GB' }); // Tier 2
            // diff = 2 - 5 = -3 <= -2 -> GPU Bottleneck

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.bottleneck_component).toBe('GPU');
            expect(result.bottleneck_percentage).toBeGreaterThanOrEqual(20);
            expect(result.bottleneck_analysis).toContain('Nghẽn cổ chai GPU');
            expect(result.advice.some(a => a.includes('nâng cấp dòng Card đồ họa'))).toBe(true);
        });

        it('shouldDetectBalancedSynergy_whenCpuAndGpuAreInSameOrAdjacentTier', () => {
            const parts = getParts();
            parts.cpu = createProduct({ name: 'AMD Ryzen 5 7600' }); // Tier 3
            parts.gpu = createProduct({ name: 'NVIDIA GeForce RTX 4060 8GB' }); // Tier 3
            // diff = 3 - 3 = 0 -> Balanced

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.bottleneck_component).toBe('NONE');
            expect(result.bottleneck_percentage).toBeLessThanOrEqual(15);
            expect(result.bottleneck_analysis).toContain('Cân bằng hiệu năng lý tưởng');
            expect(result.strengths?.some(s => s.includes('tương xứng hiệu năng'))).toBe(true);
        });

        it('shouldHandleSystemWithoutDedicatedGpu_indicatingIntegratedGraphics', () => {
            const parts = getParts();
            parts.cpu = createProduct({ name: 'Intel Core i5-13400' });
            parts.gpu = null;

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.bottleneck_component).toBe('NONE');
            expect(result.bottleneck_analysis).toContain('Chưa chọn Card đồ họa rời (VGA)');
            expect(result.advice.some(a => a.includes('Bổ sung thêm Card màn hình rời'))).toBe(true);
        });
    });

    describe('Hardware Recommendations (RAM, Storage, Cooler)', () => {
        it('shouldAdviseDualChannel_whenSingleRamStickSelected', () => {
            const parts = getParts();
            parts.ram1 = createProduct({ name: 'Kingston Fury Beast 16GB DDR5' });

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.advice.some(a => a.includes('Dual Channel'))).toBe(true);
        });

        it('shouldAcknowledgeHighSpeedNvmeStorage', () => {
            const parts = getParts();
            parts.drive1 = createProduct({ name: 'Samsung 990 Pro 1TB NVMe M.2 SSD' });

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.strengths?.some(s => s.includes('SSD M.2 NVMe tốc độ cao'))).toBe(true);
        });

        it('shouldAdviseNvmeUpgrade_whenUsingSataDrive', () => {
            const parts = getParts();
            parts.drive1 = createProduct({ name: 'Kingston A400 480GB SATA 2.5 Inch' });

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.advice.some(a => a.includes('ưu tiên chọn ổ cứng chuẩn SSD M.2 PCIe NVMe'))).toBe(true);
        });

        it('shouldAdviseAioOrDualTowerCooler_forHighTierCpu', () => {
            const parts = getParts();
            parts.cpu = createProduct({ name: 'AMD Ryzen 7 7800X3D' }); // Tier 5 (>= 4)
            parts.cpu_cooler = null;

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.advice.some(a => a.includes('tản nhiệt nước AIO'))).toBe(true);
        });
    });

    describe('Summary Categorization by Compatibility Score', () => {
        it('shouldReturnOptimalSummary_whenScoreIsHigh', () => {
            const parts = getParts();
            parts.cpu = createProduct({ name: 'Intel Core i5-14400F', attributes: { socket: 'LGA1700', tdp: 65 } });
            parts.mainboard = createProduct({ name: 'MSI B760 DDR5', attributes: { socket: 'LGA1700', form_factor: 'ATX' } });
            parts.ram1 = createProduct({ name: 'Corsair 32GB DDR5', attributes: { type: 'DDR5' } });
            parts.drive1 = createProduct({ name: 'Samsung 980 1TB NVMe' });
            parts.gpu = createProduct({ name: 'RTX 4060', attributes: { tdp: 115 } });
            parts.psu = createProduct({ name: 'Corsair 650W', attributes: { wattage: 650 } });
            parts.case = createProduct({ name: 'Mid Tower ATX Case', attributes: { motherboard_support: 'ATX' } });
            parts.cpu_cooler = createProduct({ name: 'Thermalright Assassin X', attributes: { tdp_rating: 180 } });

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.compatibility_score).toBeGreaterThanOrEqual(9.0);
            expect(result.summary).toContain('bài bản');
        });

        it('shouldReturnConflictSummary_whenHardwareMismatchOccurs', () => {
            const parts = getParts();
            parts.cpu = createProduct({ name: 'AMD Ryzen 7 7800X3D', attributes: { socket: 'AM5' } });
            parts.mainboard = createProduct({ name: 'Intel B760', attributes: { socket: 'LGA1700' } });

            const result = generateLocalExpertAnalysis(parts, []);
            expect(result.compatibility_score).toBeLessThan(5.0);
            expect(result.summary).toContain('Phát hiện linh kiện xung đột phần cứng');
        });
    });
});

describe('AI Advisor — Payload Builder', () => {
    it('shouldFilterOutNullPartsAndFormatPayloadCorrectly', () => {
        const parts: SelectedParts = {
            ...EMPTY_SELECTED,
            cpu: createProduct({
                id: 101,
                name: 'AMD Ryzen 5 7600',
                price: 5200000,
                attributes: { socket: 'AM5' },
                specifications: { cores: 6 },
            }),
            gpu: createProduct({
                id: 202,
                name: 'RTX 4060',
                price: 8500000,
            }),
        };

        const issues: CompatibilityIssue[] = [
            { code: 'missing_psu', message: 'Missing PSU', severity: 'warning', related: ['psu'] },
        ];

        const payload = buildAdvisorPayload(parts, issues);

        expect(payload.issues).toEqual(issues);
        expect(payload.parts).toHaveLength(2);
        expect(payload.parts.map(p => p.key)).toEqual(['cpu', 'gpu']);
        expect(payload.parts[0]).toMatchObject({
            key: 'cpu',
            product_id: 101,
            name: 'AMD Ryzen 5 7600',
            price: 5200000,
            specifications: { cores: 6 },
            attributes: { socket: 'AM5' },
        });
    });
});

describe('AI Advisor — Gemini Integration & Graceful Degradation', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it('shouldFallbackToLocalExpertEngine_whenGeminiKeyIsMissingOrDummy', async () => {
        // Default env does not have valid key (starts with AIzaSyChD5c0vg or undefined)
        const parts = { ...EMPTY_SELECTED };
        parts.cpu = createProduct({ name: 'AMD Ryzen 5 5600', attributes: { socket: 'AM4' } });

        const result = await aiAdvisorService.analyzeBuild(parts, []);
        expect(result.source).toBe('expert_system');
        expect(result.compatibility_score).toBeDefined();
        expect(result.summary).toBeDefined();
    });

    it('shouldParseValidGeminiResponse_whenApiReturnsStructuredJson', async () => {
        const mockGeminiResponse: AdvisorResponse = {
            summary: 'Dàn máy cấu hình gaming tầm trung rất cân đối.',
            compatibility_score: 9.2,
            bottleneck_analysis: 'Độ tương thích CPU và GPU đạt 96%, hoàn toàn không nghẽn.',
            bottleneck_percentage: 4,
            bottleneck_component: 'NONE',
            estimated_wattage: 320,
            recommended_psu_wattage: 550,
            advice: ['Bật XMP trong BIOS', 'Cài driver GPU mới nhất'],
            strengths: ['Hiệu năng gaming 1080p cực tốt', 'Tiết kiệm điện'],
            source: 'gemini',
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                candidates: [
                    {
                        content: {
                            parts: [{ text: JSON.stringify(mockGeminiResponse) }],
                        },
                    },
                ],
            }),
        } as any);

        vi.resetModules();
        vi.stubEnv('VITE_GEMINI_API_KEY', 'AIzaSyRealValidGeminiKeyForTesting123');
        const dynamicModule = await import('../aiAdvisor.service');

        const parts = { ...EMPTY_SELECTED };
        parts.cpu = createProduct({ name: 'Intel i5-13400' });
        const result = await dynamicModule.aiAdvisorService.analyzeBuild(parts, []);

        expect(result.source).toBe('gemini');
        expect(result.compatibility_score).toBe(9.2);
        expect(result.bottleneck_percentage).toBe(4);
        expect(result.advice).toEqual(mockGeminiResponse.advice);
        expect(result.strengths).toEqual(mockGeminiResponse.strengths);

        vi.unstubAllEnvs();
    });

    it('shouldDegradeGracefullyToLocalExpertEngine_whenGeminiReturnsHttpError', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        } as any);

        vi.stubEnv('VITE_GEMINI_API_KEY', 'valid_key_testing_error');

        const parts = { ...EMPTY_SELECTED };
        parts.cpu = createProduct({ name: 'Intel i5-13400' });

        // Must NOT throw; should degrade gracefully to expert_system
        let result: AdvisorResponse | null = null;
        expect(async () => {
            result = await aiAdvisorService.analyzeBuild(parts, []);
        }).not.toThrow();

        result = await aiAdvisorService.analyzeBuild(parts, []);
        expect(result).toBeDefined();
        expect(result!.source).toBe('expert_system');

        vi.unstubAllEnvs();
    });

    it('shouldDegradeGracefullyToLocalExpertEngine_whenGeminiReturnsMalformedJson', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                candidates: [
                    {
                        content: {
                            parts: [{ text: 'NOT A VALID JSON STRING <<ERROR>>' }],
                        },
                    },
                ],
            }),
        } as any);

        vi.stubEnv('VITE_GEMINI_API_KEY', 'valid_key_testing_malformed');

        const parts = { ...EMPTY_SELECTED };
        parts.cpu = createProduct({ name: 'Intel i5-13400' });

        const result = await aiAdvisorService.analyzeBuild(parts, []);
        expect(result).toBeDefined();
        expect(result.source).toBe('expert_system');

        vi.unstubAllEnvs();
    });

    it('shouldDegradeGracefullyToLocalExpertEngine_whenNetworkTimesOutOrThrows', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network request timed out'));

        vi.stubEnv('VITE_GEMINI_API_KEY', 'valid_key_testing_timeout');

        const parts = { ...EMPTY_SELECTED };
        parts.cpu = createProduct({ name: 'Intel i5-13400' });

        const result = await aiAdvisorService.analyzeBuild(parts, []);
        expect(result).toBeDefined();
        expect(result.source).toBe('expert_system');

        vi.unstubAllEnvs();
    });

    it('shouldReturnTrueForIsConfigured', () => {
        expect(aiAdvisorService.isConfigured()).toBe(true);
    });
});
