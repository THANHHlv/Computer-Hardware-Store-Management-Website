import { describe, it, expect } from 'vitest';
import {
    normalizeSocket,
    extractSocketFromName,
    extractRamType,
    aggregateCompatibility,
    analyzeDetailedCompatibility,
} from '../compatibility';
import { EMPTY_SELECTED, type SelectedParts } from '../../types';
import type { Product } from '../../../../types/product.types';

// Helper to create mock product
const createProduct = (partial: Partial<Product>): Product => ({
    id: 1,
    name: 'Sample Product',
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

describe('PC Builder Compatibility Engine — Helper Functions', () => {
    describe('normalizeSocket', () => {
        it('should return empty string for null, undefined, or empty values', () => {
            expect(normalizeSocket(null)).toBe('');
            expect(normalizeSocket(undefined)).toBe('');
            expect(normalizeSocket('')).toBe('');
        });

        it('should lowercase and strip spaces, dashes, and underscores', () => {
            expect(normalizeSocket('LGA-1700')).toBe('lga1700');
            expect(normalizeSocket('lga_1700')).toBe('lga1700');
            expect(normalizeSocket('LGA 1700')).toBe('lga1700');
            expect(normalizeSocket('  AM-5  ')).toBe('am5');
            expect(normalizeSocket('LGA_1851')).toBe('lga1851');
        });

        it('should handle numeric input safely', () => {
            expect(normalizeSocket(1700)).toBe('1700');
        });
    });

    describe('extractSocketFromName', () => {
        it.each([
            ['Intel Core Ultra 7 265K LGA 1851', 'lga1851'],
            ['Mainboard ASUS ROG MAXIMUS Z890 HERO', 'lga1851'],
            ['ASRock B860 Pro RS Motherboard', 'lga1851'],
            ['Intel Core i5-14600K LGA1700', 'lga1700'],
            ['MSI MAG B760 TOMAHAWK WIFI', 'lga1700'],
            ['ASUS Prime Z790-P', 'lga1700'],
            ['GIGABYTE H610M H V2', 'lga1700'],
            ['Intel Core i5-10400 LGA 1200', 'lga1200'],
            ['ASUS TUF GAMING B560-PLUS WIFI', 'lga1200'],
            ['AMD Ryzen 7 7800X3D Box AM5', 'am5'],
            ['AMD Ryzen 9 9950X Socket AM5', 'am5'],
            ['Mainboard GIGABYTE B650 AORUS ELITE AX', 'am5'],
            ['ASUS ROG STRIX X870-E GAMING WIFI', 'am5'],
            ['AMD Ryzen 5 5600 Box AM4', 'am4'],
            ['MSI B450 TOMAHAWK MAX AM4', 'am4'],
            ['ASUS TUF GAMING B550-PLUS', 'am4'],
        ])('should extract socket "%s" -> "%s"', (name, expectedSocket) => {
            expect(extractSocketFromName(name)).toBe(expectedSocket);
        });

        it('should return empty string for unknown or unrelated product names', () => {
            expect(extractSocketFromName('NVIDIA GeForce RTX 4070 SUPER 12GB')).toBe('');
            expect(extractSocketFromName('Kingston NV2 1TB M.2 2280 NVMe SSD')).toBe('');
        });
    });

    describe('extractRamType', () => {
        it('should extract RAM type from product attributes', () => {
            const ramD5 = createProduct({
                name: 'RAM Kingston Fury Beast',
                attributes: { type: 'DDR5' },
            });
            expect(extractRamType(ramD5)).toBe('DDR5');

            const ramD4 = createProduct({
                name: 'RAM Corsair Vengeance',
                attributes: { memory_type: 'DDR4' },
            });
            expect(extractRamType(ramD4)).toBe('DDR4');

            const ramD3 = createProduct({
                name: 'Old RAM',
                specifications: { ram_type: 'DDR3' },
            });
            expect(extractRamType(ramD3)).toBe('DDR3');
        });

        it('should extract RAM type from product name when attributes are missing', () => {
            expect(extractRamType(createProduct({ name: 'RAM Kingston Fury Beast 16GB DDR5 5600MHz' }))).toBe('DDR5');
            expect(extractRamType(createProduct({ name: 'RAM Corsair Vengeance LPX 8GB DDR4 3200MHz' }))).toBe('DDR4');
            expect(extractRamType(createProduct({ name: 'TeamGroup T-Force Delta D5 RGB 32GB' }))).toBe('DDR5');
            expect(extractRamType(createProduct({ name: 'G.Skill Ripjaws V D4 16GB' }))).toBe('DDR4');
        });

        it('should return null when RAM type cannot be resolved', () => {
            expect(extractRamType(createProduct({ name: 'Generic Desktop Memory 8GB' }))).toBeNull();
        });
    });
});

describe('PC Builder Compatibility Engine — Rules Testing', () => {
    // Helper to start with empty parts
    const getBaseParts = (): SelectedParts => ({ ...EMPTY_SELECTED });

    describe('Rule 1: Missing Core Parts Check', () => {
        it('shouldReturnError_whenCpuIsMissing', () => {
            const parts = getBaseParts();
            const result = analyzeDetailedCompatibility(parts);
            const cpuIssue = result.issues.find(i => i.code === 'missing_cpu');
            expect(cpuIssue).toBeDefined();
            expect(cpuIssue?.severity).toBe('error');
            expect(cpuIssue?.related).toContain('cpu');
        });

        it('shouldReturnError_whenMainboardIsMissing', () => {
            const parts = getBaseParts();
            const result = analyzeDetailedCompatibility(parts);
            const mbIssue = result.issues.find(i => i.code === 'missing_mainboard');
            expect(mbIssue).toBeDefined();
            expect(mbIssue?.severity).toBe('error');
            expect(mbIssue?.related).toContain('mainboard');
        });

        it('shouldReturnWarning_whenRamIsMissing', () => {
            const parts = getBaseParts();
            const result = analyzeDetailedCompatibility(parts);
            const ramIssue = result.issues.find(i => i.code === 'missing_ram1');
            expect(ramIssue).toBeDefined();
            expect(ramIssue?.severity).toBe('warning');
        });

        it('shouldReturnWarning_whenPsuIsMissing', () => {
            const parts = getBaseParts();
            const result = analyzeDetailedCompatibility(parts);
            const psuIssue = result.issues.find(i => i.code === 'missing_psu');
            expect(psuIssue).toBeDefined();
            expect(psuIssue?.severity).toBe('warning');
        });

        it('shouldReturnWarning_whenCaseIsMissing', () => {
            const parts = getBaseParts();
            const result = analyzeDetailedCompatibility(parts);
            const caseIssue = result.issues.find(i => i.code === 'missing_case');
            expect(caseIssue).toBeDefined();
            expect(caseIssue?.severity).toBe('warning');
        });

        it('shouldReturnWarning_whenAllStorageDrivesAreMissing', () => {
            const parts = getBaseParts();
            const result = analyzeDetailedCompatibility(parts);
            const storageIssue = result.issues.find(i => i.code === 'missing_storage');
            expect(storageIssue).toBeDefined();
            expect(storageIssue?.severity).toBe('warning');
        });

        it('shouldNotReturnStorageWarning_whenAtLeastOneDriveIsPresent', () => {
            const parts = getBaseParts();
            parts.drive1 = createProduct({ name: 'Samsung 980 Pro 1TB NVMe' });
            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'missing_storage')).toBeUndefined();
        });
    });

    describe('Rule 2: Socket Compatibility (CPU & Mainboard)', () => {
        it('shouldReturnCompatible_whenCpuSocketMatchesMainboard', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Intel Core i5-13400F',
                attributes: { socket: 'LGA1700' },
            });
            parts.mainboard = createProduct({
                name: 'MSI PRO B760M-A WIFI DDR5',
                attributes: { socket: 'LGA1700' },
            });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'socket_mismatch')).toBeUndefined();
            expect(result.verified.some(v => v.includes('LGA1700'))).toBe(true);
        });

        it('shouldReturnIncompatible_whenCpuSocketDoesNotMatchMainboard', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'AMD Ryzen 7 7800X3D AM5',
                attributes: { socket: 'AM5' },
            });
            parts.mainboard = createProduct({
                name: 'ASUS ROG STRIX B760-A GAMING WIFI LGA1700',
                attributes: { socket: 'LGA1700' },
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'socket_mismatch');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.related).toEqual(['cpu', 'mainboard']);
            expect(issue?.message).toContain('AM5');
            expect(issue?.message).toContain('LGA1700');
        });

        it('shouldInferSocketFromNameAndMatch_whenSocketAttributeIsMissing', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Intel Core i7-14700K',
                attributes: {}, // Thiếu thuộc tính socket trong DB
            });
            parts.mainboard = createProduct({
                name: 'GIGABYTE Z790 AORUS ELITE AX',
                attributes: {}, // Thiếu thuộc tính socket trong DB
            });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'socket_mismatch')).toBeUndefined();
            expect(result.verified.some(v => v.includes('LGA1700'))).toBe(true);
        });
    });

    describe('Rule 3: RAM Generation Compatibility (DDR4 vs DDR5)', () => {
        it('shouldReturnIncompatible_whenRamDdr4SelectedWithAm5Platform', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'AMD Ryzen 5 7600', attributes: { socket: 'AM5' } });
            parts.mainboard = createProduct({ name: 'MSI B650 GAMING PLUS WIFI', attributes: { socket: 'AM5' } });
            parts.ram1 = createProduct({ name: 'Kingston Fury Beast 16GB DDR4 3200MHz', attributes: { type: 'DDR4' } });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'ram_generation_incompatible');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.message).toContain('bắt buộc sử dụng RAM DDR5');
        });

        it('shouldReturnCompatible_whenRamDdr5SelectedWithAm5Platform', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'AMD Ryzen 5 7600', attributes: { socket: 'AM5' } });
            parts.mainboard = createProduct({ name: 'MSI B650 GAMING PLUS WIFI', attributes: { socket: 'AM5' } });
            parts.ram1 = createProduct({ name: 'Kingston Fury Beast 16GB DDR5 5600MHz', attributes: { type: 'DDR5' } });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'ram_generation_incompatible')).toBeUndefined();
            expect(result.verified.some(v => v.includes('RAM DDR5 chuẩn xác cho nền tảng AM5'))).toBe(true);
        });

        it('shouldReturnIncompatible_whenRamDdr5SelectedWithAm4Platform', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'AMD Ryzen 5 5600', attributes: { socket: 'AM4' } });
            parts.mainboard = createProduct({ name: 'ASUS TUF GAMING B550M-PLUS', attributes: { socket: 'AM4' } });
            parts.ram1 = createProduct({ name: 'Kingston Fury Beast 16GB DDR5', attributes: { type: 'DDR5' } });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'ram_generation_incompatible');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.message).toContain('AM4 chỉ hỗ trợ RAM DDR4');
        });

        it('shouldReturnIncompatible_whenRamDdr5SelectedWithLga1700Ddr4Motherboard', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'Intel Core i5-13400', attributes: { socket: 'LGA1700' } });
            parts.mainboard = createProduct({
                name: 'ASUS PRIME B760M-A D4',
                attributes: { socket: 'LGA1700' },
            });
            parts.ram1 = createProduct({ name: 'Corsair Vengeance 32GB DDR5', attributes: { type: 'DDR5' } });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'ram_mb_ddr_mismatch');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.message).toContain('DDR4, không tương thích với thanh RAM DDR5');
        });

        it('shouldReturnIncompatible_whenRamDdr4SelectedWithLga1700Ddr5Motherboard', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'Intel Core i5-13400', attributes: { socket: 'LGA1700' } });
            parts.mainboard = createProduct({
                name: 'ASUS PRIME B760M-A DDR5',
                attributes: { socket: 'LGA1700' },
            });
            parts.ram1 = createProduct({ name: 'Corsair Vengeance 16GB DDR4', attributes: { type: 'DDR4' } });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'ram_mb_ddr_mismatch');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.message).toContain('sử dụng khe cắm DDR5, không gắn vừa thanh RAM DDR4');
        });
    });

    describe('Rule 4: Form Factor Fit (Mainboard vs Case)', () => {
        it('shouldReturnIncompatible_whenEatxMotherboardInMiniItxCase', () => {
            const parts = getBaseParts();
            parts.mainboard = createProduct({
                name: 'ROG Zenith II Extreme Alpha E-ATX',
                attributes: { form_factor: 'E-ATX' },
            });
            parts.case = createProduct({
                name: 'NZXT H1 V2 Mini-ITX',
                attributes: { motherboard_support: 'Mini-ITX' },
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'motherboard_case_size_mismatch');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.related).toEqual(['mainboard', 'case']);
        });

        it('shouldReturnIncompatible_whenAtxMotherboardInMiniItxCase', () => {
            const parts = getBaseParts();
            parts.mainboard = createProduct({
                name: 'MSI MAG B760 TOMAHAWK ATX',
                attributes: { form_factor: 'ATX' },
            });
            parts.case = createProduct({
                name: 'NZXT H1 V2 Mini-ITX',
                attributes: { motherboard_support: 'Mini-ITX' },
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'motherboard_case_size_mismatch');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.message).toContain('ATX');
            expect(issue?.message).toContain('Mini-ITX');
        });

        it('shouldDocumentKnownBug_whereMicroAtxCaseSubstringMatchesAtx', () => {
            // BUG DOCUMENTATION: In compatibility.ts, caseSupportRaw.includes(key) checks 'atx'.
            // Because 'micro-atx' contains the substring 'atx', caseMaxRank becomes 3 instead of 2.
            // Therefore, ATX motherboard (rank 3) is currently NOT flagged when paired with a Micro-ATX case (rank 3).
            const parts = getBaseParts();
            parts.mainboard = createProduct({
                name: 'MSI MAG B760 TOMAHAWK ATX',
                attributes: { form_factor: 'ATX' },
            });
            parts.case = createProduct({
                name: 'ASUS Prime AP201 Micro-ATX Case',
                attributes: { motherboard_support: 'Micro-ATX' },
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'motherboard_case_size_mismatch');
            // Currently undefined due to the bug where 'micro-atx'.includes('atx') evaluates to true
            expect(issue).toBeUndefined();
        });

        it('shouldInferFormFactorFromNames_whenAttributesAreEmpty', () => {
            const parts = getBaseParts();
            // Mainboard name contains 'm-atx' (rank 2)
            parts.mainboard = createProduct({
                name: 'GIGABYTE B760M DS3H Micro Motherboard',
                attributes: {},
            });
            // Case name contains 'Mini ITX' (rank 1)
            parts.case = createProduct({
                name: 'Cooler Master MasterBox NR200 Mini ITX Case',
                attributes: {},
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'motherboard_case_size_mismatch');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
        });

        it('shouldInferEatxAndItxFromMotherboardName', () => {
            const parts1 = getBaseParts();
            parts1.mainboard = createProduct({ name: 'ASUS ROG MAXIMUS E-ATX Motherboard', attributes: {} });
            parts1.case = createProduct({ name: 'NZXT H1 V2 Mini-ITX', attributes: { motherboard_support: 'Mini-ITX' } });
            expect(analyzeDetailedCompatibility(parts1).issues.some(i => i.code === 'motherboard_case_size_mismatch')).toBe(true);

            const parts2 = getBaseParts();
            parts2.mainboard = createProduct({ name: 'ASRock B650I Lightning WiFi ITX Motherboard', attributes: {} });
            parts2.case = createProduct({ name: 'NZXT H1 V2 Mini-ITX', attributes: { motherboard_support: 'Mini-ITX' } });
            expect(analyzeDetailedCompatibility(parts2).issues.some(i => i.code === 'motherboard_case_size_mismatch')).toBe(false);
        });

        it('shouldReturnCompatible_whenMicroAtxMotherboardInAtxCase', () => {
            const parts = getBaseParts();
            parts.mainboard = createProduct({
                name: 'MSI PRO B760M-A Micro-ATX',
                attributes: { form_factor: 'Micro-ATX' },
            });
            parts.case = createProduct({
                name: 'Corsair 4000D Airflow ATX Mid-Tower',
                attributes: { motherboard_support: 'ATX' },
            });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'motherboard_case_size_mismatch')).toBeUndefined();
            expect(result.verified.some(v => v.includes('khoang gắn của Vỏ Case'))).toBe(true);
        });

        it('shouldDefaultToMidTowerAtx_whenCaseSpecificationsAreMissing', () => {
            const parts = getBaseParts();
            parts.mainboard = createProduct({
                name: 'GIGABYTE B760 DS3H ATX',
                attributes: { form_factor: 'ATX' },
            });
            // Case không có attributes và tên không có từ khóa nhận diện form factor
            parts.case = createProduct({
                name: 'Generic Standard Case',
                attributes: {},
            });

            const result = analyzeDetailedCompatibility(parts);
            // Case mặc định là rank 3 (Mid Tower ATX), nên ATX (rank 3) vẫn vừa vặn
            expect(result.issues.find(i => i.code === 'motherboard_case_size_mismatch')).toBeUndefined();
            expect(result.verified.some(v => v.includes('khoang gắn của Vỏ Case'))).toBe(true);
        });
    });

    describe('Rule 5: Power Calculation & PSU Wattage', () => {
        it('shouldEstimateCorrectWattage_andRecommendHeadroom', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Intel Core i5-13400', // heuristic i5: 100W
                attributes: { tdp: 100 },
            });
            parts.gpu = createProduct({
                name: 'NVIDIA RTX 4060', // heuristic 4060: 120W
                attributes: { tdp: 120 },
            });
            // peripheralBuffer = 85W
            // Total Peak = 100 + 120 + 85 = 305W
            // Recommended PSU = ceil(305 * 1.25 / 50) * 50 = ceil(381.25 / 50) * 50 = 400W

            const result = analyzeDetailedCompatibility(parts);
            expect(result.estimatedWattage).toBe(305);
            expect(result.recommendedPsu).toBe(400);
        });

        it('shouldReturnIncompatible_whenPsuWattageIsLowerThanPeakDemand', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'Core i9-14900K', attributes: { tdp: 230 } });
            parts.gpu = createProduct({ name: 'RTX 4090', attributes: { tdp: 450 } });
            // Total peak = 230 + 450 + 85 = 765W
            parts.psu = createProduct({
                name: 'Cooler Master 550W',
                attributes: { wattage: 550 },
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'psu_under_requirement');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.message).toContain('Nguy cơ sập nguồn');
            expect(issue?.related).toEqual(['psu', 'gpu', 'cpu']);
        });

        it('shouldReturnWarning_whenPsuWattageIsBetweenPeakAndRecommendedHeadroom', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'Core i5-14400', attributes: { tdp: 100 } });
            parts.gpu = createProduct({ name: 'RTX 4060', attributes: { tdp: 120 } });
            // Total peak = 305W, recommended = 400W
            parts.psu = createProduct({
                name: 'Antec 350W Power Supply',
                attributes: { wattage: 350 }, // 305 <= 350 < 400
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'psu_margin_low');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('warning');
            expect(issue?.message).toContain('mức dự phòng thấp');
        });

        it('shouldReturnCompatible_whenPsuWattageMeetsOrExceedsRecommendedHeadroom', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'Core i5-14400', attributes: { tdp: 100 } });
            parts.gpu = createProduct({ name: 'RTX 4060', attributes: { tdp: 120 } });
            // Total peak = 305W, recommended = 400W
            parts.psu = createProduct({
                name: 'Corsair RM650 650W',
                attributes: { wattage: 650 },
            });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'psu_under_requirement')).toBeUndefined();
            expect(result.issues.find(i => i.code === 'psu_margin_low')).toBeUndefined();
            expect(result.verified.some(v => v.includes('650W đáp ứng hoàn hảo'))).toBe(true);
        });

        it('shouldEstimateTdpFromName_whenPowerAttributesAreMissing', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'Intel Core i9-14900K Box', attributes: {} }); // i9 heuristic: 230W
            parts.gpu = createProduct({ name: 'GIGABYTE GeForce RTX 4080 Gaming OC', attributes: {} }); // 4080 heuristic: 320W
            parts.psu = createProduct({ name: 'Corsair RM850e 850W Gold', attributes: {} }); // parse wattage from name: 850W

            // Total peak = 230 + 320 + 85 = 635W
            // Recommended = ceil(635 * 1.25 / 50) * 50 = ceil(793.75 / 50) * 50 = 800W
            // PSU is 850W >= 800W -> verified!
            const result = analyzeDetailedCompatibility(parts);
            expect(result.estimatedWattage).toBe(635);
            expect(result.recommendedPsu).toBe(800);
            expect(result.issues.find(i => i.code === 'psu_under_requirement')).toBeUndefined();
            expect(result.issues.find(i => i.code === 'psu_margin_low')).toBeUndefined();
        });

        it.each([
            ['AMD Radeon RX 7800 XT 16GB', 260],
            ['Sapphire Pulse RX 7900 XT 20GB', 330],
            ['MSI RTX 4070 Ti SUPER Gaming X', 285],
            ['ASUS Dual RTX 4070 12GB', 200],
            ['GIGABYTE RTX 4060 Ti Eagle', 160],
            ['Generic Unknown Graphics Card', 150],
        ])('shouldInferGpuTdpFromName: %s -> %dW', (gpuName, expectedTdp) => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'Intel Core i3-12100', attributes: { tdp: 60 } });
            parts.gpu = createProduct({ name: gpuName, attributes: {} });
            // Total peak = 60 + expectedTdp + 85
            const result = analyzeDetailedCompatibility(parts);
            expect(result.estimatedWattage).toBe(60 + expectedTdp + 85);
        });
    });

    describe('Rule 6: CPU Cooler TDP Check', () => {
        it('shouldReturnWarning_whenHighTdpCpuLacksCooler', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Intel Core i7-14700K',
                attributes: { tdp: 160 }, // >= 95W
            });
            parts.cpu_cooler = null;

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'missing_cooler_high_tdp');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('warning');
            expect(issue?.message).toContain('mức nhiệt lượng cao');
        });

        it('shouldNotReturnWarning_whenLowTdpCpuLacksCooler', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Intel Core i3-12100',
                attributes: { tdp: 60 }, // < 95W
            });
            parts.cpu_cooler = null;

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'missing_cooler_high_tdp')).toBeUndefined();
        });

        it('shouldReturnWarning_whenCoolerTdpIsLowerThanCpuTdp', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'AMD Ryzen 9 7950X',
                attributes: { tdp: 230 },
            });
            parts.cpu_cooler = createProduct({
                name: 'Basic Budget Air Cooler',
                attributes: { tdp_rating: 130 }, // 130W < 230W
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'cooler_capacity_low');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('warning');
            expect(issue?.message).toContain('thấp hơn nhiệt lượng tỏa ra');
        });

        it('shouldNotReturnWarning_whenCoolerTdpIsSufficient', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Intel Core i7-14700K',
                attributes: { tdp: 160 },
            });
            parts.cpu_cooler = createProduct({
                name: 'Thermalright Peerless Assassin 120 SE',
                attributes: { cooling_capacity: 245 },
            });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'cooler_capacity_low')).toBeUndefined();
            expect(result.issues.find(i => i.code === 'missing_cooler_high_tdp')).toBeUndefined();
        });
    });

    describe('Rule 7: GPU Length vs Case Clearance', () => {
        it('shouldReturnIncompatible_whenGpuLengthExceedsCaseClearance', () => {
            const parts = getBaseParts();
            parts.case = createProduct({
                name: 'Compact Mini Case',
                attributes: { gpu_max_length: 290 },
            });
            parts.gpu = createProduct({
                name: 'ASUS ROG Strix RTX 4080',
                attributes: { length: 357 },
            });

            const result = analyzeDetailedCompatibility(parts);
            const issue = result.issues.find(i => i.code === 'gpu_case_fit');
            expect(issue).toBeDefined();
            expect(issue?.severity).toBe('error');
            expect(issue?.message).toContain('357mm');
            expect(issue?.message).toContain('290mm');
        });

        it('shouldReturnCompatible_whenGpuLengthWithinCaseClearance', () => {
            const parts = getBaseParts();
            parts.case = createProduct({
                name: 'Lian Li O11 Dynamic EVO',
                attributes: { max_gpu_length: 422 },
            });
            parts.gpu = createProduct({
                name: 'MSI Gaming X RTX 4070',
                attributes: { card_length: 307 },
            });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'gpu_case_fit')).toBeUndefined();
        });
    });

    describe('Rule 8: Compatibility Score Formula & Issue Sorting', () => {
        it('shouldCalculateCorrectScoreAndClampBetween1And10', () => {
            const emptyParts = getBaseParts();
            // Empty parts has missing_cpu (error), missing_mainboard (error) -> 2 errors (-6.0)
            // missing_ram1 (warning), missing_psu (warning), missing_case (warning), missing_storage (warning) -> 4 warnings (-3.2)
            // missing core parts: 5 (cpu, mainboard, ram1, psu, case) + 1 (missing_storage) = 6 missing_* (-3.0)
            // 10 - 6.0 - 3.2 - 3.0 = -2.2 -> clamped to 1.0
            const result = analyzeDetailedCompatibility(emptyParts);
            expect(result.compatibilityScore).toBe(1.0);
        });

        it('shouldSortIssuesBySeverity_errorFirst_thenWarning_thenInfo', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({ name: 'AMD Ryzen 7 7800X3D', attributes: { socket: 'AM5', tdp: 120 } });
            parts.mainboard = createProduct({ name: 'Intel B760 Board', attributes: { socket: 'LGA1700' } }); // Error: socket_mismatch
            // Missing RAM, PSU, Case, Storage generate warnings

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.length).toBeGreaterThan(0);

            // Verify sorting: all 'error' come before any 'warning'
            const severities = result.issues.map(i => i.severity);
            const firstWarningIdx = severities.indexOf('warning');
            const lastErrorIdx = severities.lastIndexOf('error');

            if (firstWarningIdx !== -1 && lastErrorIdx !== -1) {
                expect(lastErrorIdx).toBeLessThan(firstWarningIdx);
            }
        });

        it('shouldAggregateCompatibility_returnIssuesArrayDirectly', () => {
            const parts = getBaseParts();
            const issues = aggregateCompatibility(parts);
            expect(Array.isArray(issues)).toBe(true);
            expect(issues.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases & Resiliency', () => {
        it('shouldHandleProductsWithNullOrUndefinedSpecificationsGracefully', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Intel Core i5-12400',
                specifications: null as any,
                attributes: undefined as any,
            });
            parts.mainboard = createProduct({
                name: 'MSI H610M-E DDR4',
                specifications: null as any,
                attributes: undefined as any,
            });

            expect(() => analyzeDetailedCompatibility(parts)).not.toThrow();
            const result = analyzeDetailedCompatibility(parts);
            // Sockets are inferred from names (12400 -> lga1700, h610 -> lga1700)
            expect(result.issues.find(i => i.code === 'socket_mismatch')).toBeUndefined();
        });

        it('shouldSupportNestedAttributeValues', () => {
            const parts = getBaseParts();
            parts.cpu = createProduct({
                name: 'Generic CPU',
                attributes: {
                    socket: { value: 'AM5' },
                    tdp: { value: '105W' },
                },
            });
            parts.mainboard = createProduct({
                name: 'Generic MB',
                attributes: {
                    cpu_socket: { value: 'AM5' },
                },
            });

            const result = analyzeDetailedCompatibility(parts);
            expect(result.issues.find(i => i.code === 'socket_mismatch')).toBeUndefined();
            expect(result.verified.some(v => v.includes('AM5'))).toBe(true);
        });
    });

    describe('Full System Builds (Real-world Scenarios)', () => {
        it('shouldValidateFullCompatibleBuild_withHighScoreAndNoErrors', () => {
            const fullBuild: SelectedParts = {
                cpu: createProduct({
                    name: 'Intel Core i5-14400F',
                    attributes: { socket: 'LGA1700', tdp: 65 },
                }),
                mainboard: createProduct({
                    name: 'MSI B760 GAMING PLUS WIFI DDR5',
                    attributes: { socket: 'LGA1700', form_factor: 'ATX' },
                }),
                ram1: createProduct({
                    name: 'Corsair Vengeance 32GB DDR5 5600MHz',
                    attributes: { type: 'DDR5' },
                }),
                drive1: createProduct({
                    name: 'Kingston KC3000 1TB M.2 PCIe 4.0 NVMe SSD',
                }),
                drive2: null,
                drive3: null,
                gpu: createProduct({
                    name: 'ASUS Dual GeForce RTX 4060 EVO OC 8GB',
                    attributes: { tdp: 115, length: 227 },
                }),
                psu: createProduct({
                    name: 'MSI MAG A650BN 650W Bronze',
                    attributes: { wattage: 650 },
                }),
                case: createProduct({
                    name: 'Montech AIR 903 MAX ATX Mid-Tower',
                    attributes: { motherboard_support: 'ATX', gpu_max_length: 400 },
                }),
                cpu_cooler: createProduct({
                    name: 'Thermalright Assassin X 120 Refined SE',
                    attributes: { tdp_rating: 180 },
                }),
                case_fan1: null,
                case_fan2: null,
                monitor: null,
                keyboard: null,
                mouse: null,
            };

            const result = analyzeDetailedCompatibility(fullBuild);

            // No errors or warnings
            expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
            expect(result.compatibilityScore).toBe(10.0);
            expect(result.verified.length).toBeGreaterThanOrEqual(3);
            expect(result.verified.some(v => v.includes('LGA1700'))).toBe(true);
            expect(result.verified.some(v => v.includes('khoang gắn của Vỏ Case'))).toBe(true);
            expect(result.verified.some(v => v.includes('650W đáp ứng hoàn hảo'))).toBe(true);
        });

        it('shouldDetectMultipleIncompatibilities_inSeverelyMismatchedBuild', () => {
            const mismatchedBuild: SelectedParts = {
                cpu: createProduct({
                    name: 'AMD Ryzen 7 7800X3D',
                    attributes: { socket: 'AM5', tdp: 120 },
                }),
                mainboard: createProduct({
                    name: 'ASUS ROG STRIX Z790-A D4', // Intel LGA1700 DDR4
                    attributes: { socket: 'LGA1700', form_factor: 'ATX' },
                }),
                ram1: createProduct({
                    name: 'G.Skill Trident Z5 32GB DDR5', // DDR5 on AM5, but board is DDR4!
                    attributes: { type: 'DDR5' },
                }),
                drive1: null,
                drive2: null,
                drive3: null, // missing storage
                gpu: createProduct({
                    name: 'GIGABYTE GeForce RTX 4090 GAMING OC 24G',
                    attributes: { tdp: 450, length: 340 },
                }),
                psu: createProduct({
                    name: 'FSP 450W Power Supply', // 450W is far too low for 7800X3D + 4090 (needs ~655W peak)
                    attributes: { wattage: 450 },
                }),
                case: createProduct({
                    name: 'SSUPD Meshlicious Mini-ITX Case',
                    attributes: { motherboard_support: 'Mini-ITX', gpu_max_length: 336 }, // ATX mb doesn't fit, 340mm GPU > 336mm!
                }),
                cpu_cooler: null, // 120W CPU missing cooler
                case_fan1: null,
                case_fan2: null,
                monitor: null,
                keyboard: null,
                mouse: null,
            };

            const result = analyzeDetailedCompatibility(mismatchedBuild);

            const issueCodes = result.issues.map(i => i.code);
            expect(issueCodes).toContain('socket_mismatch');
            expect(issueCodes).toContain('ram_mb_ddr_mismatch');
            expect(issueCodes).toContain('motherboard_case_size_mismatch');
            expect(issueCodes).toContain('psu_under_requirement');
            expect(issueCodes).toContain('missing_cooler_high_tdp');
            expect(issueCodes).toContain('gpu_case_fit');
            expect(issueCodes).toContain('missing_storage');

            expect(result.compatibilityScore).toBeLessThanOrEqual(3.0);
        });
    });
});
