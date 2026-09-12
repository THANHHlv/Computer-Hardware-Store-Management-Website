import type { CompatibilityIssue, IssueSeverity, PartKey, SelectedParts } from '../types';

const REQUIRED_PARTS: Array<{ key: PartKey; message: string }> = [
    { key: 'cpu', message: 'Cấu hình chưa có CPU (Bộ vi xử lý).' },
    { key: 'mainboard', message: 'Cần chọn Mainboard (Bo mạch chủ) tương thích với CPU.' },
    { key: 'ram1', message: 'Nên bổ sung ít nhất một thanh RAM.' },
    { key: 'psu', message: 'Cần có Nguồn máy tính (PSU) để cấp điện cho hệ thống.' },
    { key: 'case', message: 'Chưa chọn Vỏ case cho dàn máy.' },
];

const SEVERITY_ORDER: Record<IssueSeverity, number> = {
    error: 3,
    warning: 2,
    info: 1,
};

export const normalizeSocket = (value?: string | number | null): string => {
    if (!value) return '';
    return value.toString().toLowerCase().replace(/[\s\-_]/g, '');
};

const pickValue = (product: NonNullable<SelectedParts[keyof SelectedParts]>, keys: string[]): string | number | null => {
    const source: Record<string, unknown> = {
        ...(product.specifications || {}),
        ...(product.attributes || {}),
    };
    for (const key of keys) {
        const target = Object.keys(source).find(k => k.toLowerCase() === key.toLowerCase());
        if (target) {
            const raw = source[target];
            if (raw === undefined || raw === null) continue;
            if (typeof raw === 'number') return raw;
            if (typeof raw === 'string') return raw;
            if (typeof raw === 'object') {
                const maybeValue = (raw as { value?: unknown })?.value;
                if (typeof maybeValue === 'number' || typeof maybeValue === 'string') {
                    return maybeValue as string | number;
                }
            }
        }
    }
    return null;
};

const parseNumber = (value: string | number | null): number | null => {
    if (value == null) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const base = typeof value === 'string' ? value : value.toString();
    const sanitized = base.replace(/,/g, '.');
    const match = sanitized.match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    return Number(match[0]);
};

const parseWatt = (value: string | number | null): number | null => {
    return parseNumber(value);
};

export const extractSocketFromName = (name: string): string => {
    const n = name.toLowerCase();
    if (/lga\s*1851|z890|b860|core ultra/i.test(n)) return 'lga1851';
    if (/lga\s*1700|b760|z790|h610|z690|b660|12\d{3}|13\d{3}|14\d{3}/i.test(n)) return 'lga1700';
    if (/lga\s*1200|b560|b460|z490|z590|10\d{3}|11\d{3}/i.test(n)) return 'lga1200';
    if (/am5|b650|x670|x870|b840|a620|ryzen.*[789]\d{3}/i.test(n)) return 'am5';
    if (/am4|b550|b450|x570|a520|ryzen.*[1-5]\d{3}/i.test(n)) return 'am4';
    return '';
};

export const extractRamType = (product: NonNullable<SelectedParts[keyof SelectedParts]>): 'DDR4' | 'DDR5' | 'DDR3' | null => {
    const raw = pickValue(product, ['type', 'memory_type', 'ram_type']);
    if (raw) {
        const str = raw.toString().toUpperCase();
        if (str.includes('DDR5')) return 'DDR5';
        if (str.includes('DDR4')) return 'DDR4';
        if (str.includes('DDR3')) return 'DDR3';
    }
    const name = (product.name || '').toUpperCase();
    if (name.includes('DDR5') || name.includes(' D5 ')) return 'DDR5';
    if (name.includes('DDR4') || name.includes(' D4 ')) return 'DDR4';
    if (name.includes('DDR3')) return 'DDR3';
    return null;
};

const FORM_FACTOR_RANK: Record<string, number> = {
    'mini itx': 1,
    'mini-itx': 1,
    'itx': 1,
    'micro atx': 2,
    'micro-atx': 2,
    'm-atx': 2,
    'matx': 2,
    'atx': 3,
    'e-atx': 4,
    'eatx': 4,
};

const appendIssue = (list: CompatibilityIssue[], issue: CompatibilityIssue) => {
    const exists = list.find(item => item.code === issue.code);
    if (!exists) list.push(issue);
};

export interface DetailedCompatibilityResult {
    issues: CompatibilityIssue[];
    verified: string[];
    estimatedWattage: number;
    recommendedPsu: number;
    compatibilityScore: number;
}

export const aggregateCompatibility = (parts: SelectedParts): CompatibilityIssue[] => {
    return analyzeDetailedCompatibility(parts).issues;
};

export const analyzeDetailedCompatibility = (parts: SelectedParts): DetailedCompatibilityResult => {
    const issues: CompatibilityIssue[] = [];
    const verified: string[] = [];

    // 1. Kiểm tra các thành phần cơ bản
    REQUIRED_PARTS.forEach(({ key, message }) => {
        if (!parts[key]) {
            appendIssue(issues, {
                code: `missing_${key}`,
                message,
                severity: key === 'cpu' || key === 'mainboard' ? 'error' : 'warning',
                related: [key],
            });
        }
    });

    if (!parts.drive1 && !parts.drive2 && !parts.drive3) {
        appendIssue(issues, {
            code: 'missing_storage',
            message: 'Bạn chưa chọn ổ cứng lưu trữ (SSD NVMe / SATA).',
            severity: 'warning',
            related: ['drive1', 'drive2', 'drive3'],
        });
    }

    const cpu = parts.cpu;
    const mainboard = parts.mainboard;
    const ram = parts.ram1;
    const gpu = parts.gpu;
    const psu = parts.psu;
    const cooler = parts.cpu_cooler;
    const pcCase = parts.case;

    // 2. Kiểm tra Socket CPU & Mainboard
    if (cpu && mainboard) {
        let cpuSocket = normalizeSocket(pickValue(cpu, ['socket', 'cpu_socket', 'cpu-socket']));
        let boardSocket = normalizeSocket(pickValue(mainboard, ['socket', 'cpu_socket', 'socket_type']));

        if (!cpuSocket) cpuSocket = extractSocketFromName(cpu.name);
        if (!boardSocket) boardSocket = extractSocketFromName(mainboard.name);

        if (cpuSocket && boardSocket) {
            if (cpuSocket !== boardSocket) {
                appendIssue(issues, {
                    code: 'socket_mismatch',
                    message: `Lỗi Socket: CPU sử dụng socket ${cpuSocket.toUpperCase()}, không khớp với Mainboard sử dụng socket ${boardSocket.toUpperCase()}.`,
                    severity: 'error',
                    related: ['cpu', 'mainboard'],
                });
            } else {
                verified.push(`Socket tương thích hoàn hảo: ${cpuSocket.toUpperCase()} giữa CPU và Mainboard.`);
            }
        }
    }

    // 3. Kiểm tra Tương thích Thế hệ RAM (DDR4 vs DDR5)
    if (ram && (mainboard || cpu)) {
        const ramType = extractRamType(ram);
        let boardSocket = mainboard ? normalizeSocket(pickValue(mainboard, ['socket', 'cpu_socket'])) : '';
        if (!boardSocket && mainboard) boardSocket = extractSocketFromName(mainboard.name);
        if (!boardSocket && cpu) boardSocket = normalizeSocket(pickValue(cpu, ['socket'])) || extractSocketFromName(cpu.name);

        const mbName = (mainboard?.name || '').toUpperCase();
        const isMbDdr4 = mbName.includes('D4') || mbName.includes('DDR4');
        const isMbDdr5 = mbName.includes('DDR5') || mbName.includes(' D5 ');

        if (boardSocket === 'am5' || boardSocket === 'lga1851') {
            if (ramType === 'DDR4') {
                appendIssue(issues, {
                    code: 'ram_generation_incompatible',
                    message: `Lỗi RAM: Nền tảng ${boardSocket.toUpperCase()} bắt buộc sử dụng RAM DDR5. RAM bạn chọn là DDR4 sẽ không thể gắn vừa khe cắm.`,
                    severity: 'error',
                    related: ['ram1', 'mainboard'],
                });
            } else if (ramType === 'DDR5') {
                verified.push(`RAM DDR5 chuẩn xác cho nền tảng ${boardSocket.toUpperCase()}.`);
            }
        } else if (boardSocket === 'am4') {
            if (ramType === 'DDR5') {
                appendIssue(issues, {
                    code: 'ram_generation_incompatible',
                    message: 'Lỗi RAM: Nền tảng AM4 chỉ hỗ trợ RAM DDR4. RAM bạn chọn là DDR5 sẽ không thể gắn vừa.',
                    severity: 'error',
                    related: ['ram1', 'mainboard'],
                });
            } else if (ramType === 'DDR4') {
                verified.push('RAM DDR4 chuẩn xác cho nền tảng AM4.');
            }
        } else if (boardSocket === 'lga1700' && mainboard) {
            if (isMbDdr4 && ramType === 'DDR5') {
                appendIssue(issues, {
                    code: 'ram_mb_ddr_mismatch',
                    message: `Lỗi RAM: Mainboard ${mainboard.name} là phiên bản DDR4, không tương thích với thanh RAM DDR5 đã chọn.`,
                    severity: 'error',
                    related: ['ram1', 'mainboard'],
                });
            } else if (isMbDdr5 && ramType === 'DDR4') {
                appendIssue(issues, {
                    code: 'ram_mb_ddr_mismatch',
                    message: `Lỗi RAM: Mainboard ${mainboard.name} sử dụng khe cắm DDR5, không gắn vừa thanh RAM DDR4 đã chọn.`,
                    severity: 'error',
                    related: ['ram1', 'mainboard'],
                });
            }
        }
    }

    // 4. Kiểm tra Kích cỡ Mainboard vs Vỏ Case (Form Factor Fit)
    if (mainboard && pcCase) {
        const mbFactorRaw = (pickValue(mainboard, ['form_factor', 'formfactor', 'size']) || '').toString().toLowerCase();
        const caseSupportRaw = (pickValue(pcCase, ['motherboard_support', 'mb_support', 'form_factor', 'type']) || '').toString().toLowerCase();

        let mbRank = 0;
        for (const [key, rank] of Object.entries(FORM_FACTOR_RANK)) {
            if (mbFactorRaw.includes(key) || mainboard.name.toLowerCase().includes(key)) {
                mbRank = Math.max(mbRank, rank);
            }
        }
        // Phỏng đoán từ tên: ATX, M-ATX, ITX
        if (mbRank === 0) {
            if (/e-atx|eatx/i.test(mainboard.name)) mbRank = 4;
            else if (/m-atx|matx|micro/i.test(mainboard.name)) mbRank = 2;
            else if (/itx/i.test(mainboard.name)) mbRank = 1;
            else if (/atx/i.test(mainboard.name)) mbRank = 3;
        }

        let caseMaxRank = 0;
        for (const [key, rank] of Object.entries(FORM_FACTOR_RANK)) {
            if (caseSupportRaw.includes(key)) {
                caseMaxRank = Math.max(caseMaxRank, rank);
            }
        }
        if (caseMaxRank === 0) {
            if (/full tower|e-atx/i.test(pcCase.name)) caseMaxRank = 4;
            else if (/mid tower|atx/i.test(pcCase.name)) caseMaxRank = 3;
            else if (/mini tower|m-atx|matx/i.test(pcCase.name)) caseMaxRank = 2;
            else if (/mini itx|itx/i.test(pcCase.name)) caseMaxRank = 1;
            else caseMaxRank = 3; // Default phổ biến là Mid-Tower ATX
        }

        if (mbRank > 0 && caseMaxRank > 0 && mbRank > caseMaxRank) {
            appendIssue(issues, {
                code: 'motherboard_case_size_mismatch',
                message: `Lỗi kích thước: Bo mạch chủ kích cỡ lớn (${mbRank === 4 ? 'E-ATX' : 'ATX'}) không thể lắp vừa vỏ case kích thước nhỏ (${caseMaxRank === 1 ? 'Mini-ITX' : 'M-ATX'}).`,
                severity: 'error',
                related: ['mainboard', 'case'],
            });
        } else if (mbRank > 0 && caseMaxRank >= mbRank) {
            verified.push('Kích thước Bo mạch chủ vừa vặn với chuẩn khoang gắn của Vỏ Case.');
        }
    }

    // 5. Ước tính Công suất & Kiểm tra Nguồn (PSU)
    let estimatedCpuTdp = 65;
    if (cpu) {
        const tdp = parseWatt(pickValue(cpu, ['tdp', 'power', 'max_tdp']));
        if (tdp) {
            estimatedCpuTdp = tdp;
        } else {
            const n = cpu.name.toLowerCase();
            if (/i9|ryzen 9|7950|7900|9950|9900|14900|13900/i.test(n)) estimatedCpuTdp = 230;
            else if (/i7|ryzen 7|7800|7700|9700|14700|13700/i.test(n)) estimatedCpuTdp = 160;
            else if (/i5|ryzen 5|7600|7500|9600|14400|13400/i.test(n)) estimatedCpuTdp = 100;
            else estimatedCpuTdp = 65;
        }
    }

    let estimatedGpuTdp = 0;
    if (gpu) {
        const gTdp = parseWatt(pickValue(gpu, ['tdp', 'board_power', 'power_draw']));
        if (gTdp) {
            estimatedGpuTdp = gTdp;
        } else {
            const n = gpu.name.toLowerCase();
            if (/4090|5090/i.test(n)) estimatedGpuTdp = 450;
            else if (/4080|5080/i.test(n)) estimatedGpuTdp = 320;
            else if (/4070 ti|5070 ti/i.test(n)) estimatedGpuTdp = 285;
            else if (/4070|5070/i.test(n)) estimatedGpuTdp = 200;
            else if (/4060 ti/i.test(n)) estimatedGpuTdp = 160;
            else if (/4060|3060/i.test(n)) estimatedGpuTdp = 120;
            else if (/7900 xt/i.test(n)) estimatedGpuTdp = 330;
            else if (/7800 xt/i.test(n)) estimatedGpuTdp = 260;
            else estimatedGpuTdp = 150;
        }
    }

    const peripheralBuffer = 85; // Mainboard, RAM, Fan, SSD, USB
    const totalPeakWattage = estimatedCpuTdp + estimatedGpuTdp + peripheralBuffer;
    const recommendedPsu = Math.ceil((totalPeakWattage * 1.25) / 50) * 50;

    if (psu) {
        const psuWatt = parseWatt(pickValue(psu, ['wattage', 'power', 'output_power'])) || parseNumber(psu.name) || 0;
        if (psuWatt > 0) {
            if (psuWatt < totalPeakWattage) {
                appendIssue(issues, {
                    code: 'psu_under_requirement',
                    message: `Lỗi thiếu nguồn: Nguồn ${psuWatt}W không đủ công suất cung cấp cho hệ thống khi tải nặng (ước tính cần tối thiểu ${totalPeakWattage}W). Nguy cơ sập nguồn hoặc hư hại linh kiện.`,
                    severity: 'error',
                    related: ['psu', 'gpu', 'cpu'],
                });
            } else if (psuWatt < recommendedPsu) {
                appendIssue(issues, {
                    code: 'psu_margin_low',
                    message: `Cảnh báo nguồn: Nguồn ${psuWatt}W đủ tải cơ bản nhưng mức dự phòng thấp (khuyến nghị ${recommendedPsu}W để nguồn chạy êm và đạt hiệu suất 80 Plus tốt nhất).`,
                    severity: 'warning',
                    related: ['psu', 'gpu', 'cpu'],
                });
            } else {
                verified.push(`Bộ nguồn ${psuWatt}W đáp ứng hoàn hảo mức công suất đỉnh ${totalPeakWattage}W.`);
            }
        }
    }

    // 6. Tản nhiệt CPU & Công suất làm mát
    if (cpu && !cooler && estimatedCpuTdp >= 95) {
        appendIssue(issues, {
            code: 'missing_cooler_high_tdp',
            message: `CPU ${cpu.name} có mức nhiệt lượng cao (~${estimatedCpuTdp}W), bạn nên trang bị thêm tản nhiệt khí tháp đôi hoặc tản nhiệt nước AIO.`,
            severity: 'warning',
            related: ['cpu_cooler', 'cpu'],
        });
    }

    if (cpu && cooler) {
        const coolerTdp = parseWatt(pickValue(cooler, ['tdp_rating', 'cooling_capacity', 'max_tdp']));
        if (coolerTdp && coolerTdp < estimatedCpuTdp) {
            appendIssue(issues, {
                code: 'cooler_capacity_low',
                message: `Hiệu năng tản nhiệt thấp: Tản nhiệt chỉ đáp ứng ~${coolerTdp}W, thấp hơn nhiệt lượng tỏa ra của CPU (~${estimatedCpuTdp}W). CPU có thể bị bóp xung (thermal throttling).`,
                severity: 'warning',
                related: ['cpu_cooler', 'cpu'],
            });
        }
    }

    // 7. Kích thước Card đồ họa (GPU) vs Vỏ Case
    if (pcCase && gpu) {
        const caseGpuLimit = parseNumber(pickValue(pcCase, ['gpu_max_length', 'max_gpu_length', 'gpu_length_limit']));
        const gpuLength = parseNumber(pickValue(gpu, ['length', 'gpu_length', 'card_length']));
        if (caseGpuLimit && gpuLength && gpuLength > caseGpuLimit) {
            appendIssue(issues, {
                code: 'gpu_case_fit',
                message: `Lỗi kích thước: Chiều dài card màn hình (${gpuLength}mm) vượt quá khoảng không cho phép của vỏ case (${caseGpuLimit}mm).`,
                severity: 'error',
                related: ['case', 'gpu'],
            });
        }
    }

    // Tính điểm tương thích cơ sở (0 - 10)
    let score = 10.0;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const missingCoreParts = issues.filter(i => i.code.startsWith('missing_')).length;

    score -= errorCount * 3.0;
    score -= warningCount * 0.8;
    score -= missingCoreParts * 0.5;

    score = Math.max(1.0, Math.min(10.0, Math.round(score * 10) / 10));

    issues.sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]);

    return {
        issues,
        verified,
        estimatedWattage: totalPeakWattage,
        recommendedPsu,
        compatibilityScore: score,
    };
};
