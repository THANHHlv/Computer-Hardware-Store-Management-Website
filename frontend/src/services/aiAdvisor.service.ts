import type { CompatibilityIssue } from '../pages/BuildPC/types';
import type { Product } from '../types/product.types';
import { analyzeDetailedCompatibility } from '../pages/BuildPC/utils/compatibility';

export interface AdvisorPartPayload {
  key: string;
  product_id: number;
  name: string;
  category_name?: string;
  price: number;
  specifications: Record<string, unknown>;
  attributes?: Record<string, unknown>;
}

export interface AdvisorRequest {
  parts: AdvisorPartPayload[];
  issues: CompatibilityIssue[];
}

export interface AdvisorResponse {
  summary?: string;
  compatibility_score: number; // 0 - 10
  bottleneck_analysis?: string;
  bottleneck_percentage?: number; // 0 - 100%
  bottleneck_component?: 'CPU' | 'GPU' | 'RAM' | 'NONE';
  estimated_wattage?: number;
  recommended_psu_wattage?: number;
  advice: string[];
  strengths?: string[];
  source?: 'gemini' | 'expert_system';
}

const customEndpoint = import.meta.env.VITE_PC_ADVISOR_ENDPOINT as string | undefined;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const geminiModel = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash';
const geminiEndpoint = customEndpoint || `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;

// ===== HỆ THỐNG PHÂN TÍCH CHUYÊN GIA NỘI BỘ (LOCAL HARDWARE EXPERT ENGINE) =====

function getCpuTier(name: string): number {
  const n = name.toLowerCase();
  if (/14900|13900|7950x|9950x|7900x|9900x|7800x3d|9800x3d|core ultra 9|285k/i.test(n)) return 5;
  if (/14700|13700|7700x|9700x|5800x3d|core ultra 7|265k/i.test(n)) return 4;
  if (/14600|13600|14400|13400|12400|7600|7500f|9600x|5600|core ultra 5|245k/i.test(n)) return 3;
  if (/14100|13100|12100|4500|3600|3500|3100|core i3/i.test(n)) return 2;
  return 1;
}

function getGpuTier(name: string): number {
  const n = name.toLowerCase();
  if (/5090|4090|5080|4080|7900 xtx/i.test(n)) return 5;
  if (/4070 ti|5070 ti|4070|5070|7900 xt|7800 xt/i.test(n)) return 4;
  if (/4060 ti|4060|3060|7600 xt|7600|6700 xt/i.test(n)) return 3;
  if (/3050|1660|1650|6500 xt|6400|rx 580/i.test(n)) return 2;
  return 1;
}

export const generateLocalExpertAnalysis = (
  partsRecord: Record<string, Product | null>,
  _issues: CompatibilityIssue[]
): AdvisorResponse => {
  const detailed = analyzeDetailedCompatibility(partsRecord as any);
  const cpu = partsRecord.cpu;
  const gpu = partsRecord.gpu;
  const ram = partsRecord.ram1;
  const psu = partsRecord.psu;
  const cooler = partsRecord.cpu_cooler;
  const storage = partsRecord.drive1 || partsRecord.drive2 || partsRecord.drive3;

  const adviceList: string[] = [];
  const strengthsList: string[] = [...detailed.verified];

  let bottleneckText = 'Hệ thống chưa có đủ thông tin CPU hoặc GPU để đánh giá cân bằng.';
  let bottleneckPercentage = 0;
  let bottleneckComponent: 'CPU' | 'GPU' | 'RAM' | 'NONE' = 'NONE';

  if (cpu && gpu) {
    const cpuTier = getCpuTier(cpu.name);
    const gpuTier = getGpuTier(gpu.name);
    const diff = gpuTier - cpuTier;

    if (diff >= 2) {
      bottleneckPercentage = Math.min(45, 20 + diff * 10);
      bottleneckComponent = 'CPU';
      bottleneckText = `Nghẽn cổ chai CPU (~${bottleneckPercentage}%). Card đồ họa (${gpu.name}) quá mạnh so với CPU (${cpu.name}), card có thể không phát huy hết 100% công suất trong game độ phân giải 1080p/2K.`;
      adviceList.push(`Nâng cấp CPU lên phân khúc cao hơn tương xứng để giải phóng toàn bộ sức mạnh của ${gpu.name}.`);
    } else if (diff <= -2) {
      bottleneckPercentage = Math.min(50, 20 + Math.abs(diff) * 12);
      bottleneckComponent = 'GPU';
      bottleneckText = `Nghẽn cổ chai GPU (~${bottleneckPercentage}%). CPU (${cpu.name}) thuộc phân khúc cao cấp nhưng Card màn hình (${gpu.name}) ở mức khiêm tốn. Hiệu năng gaming sẽ bị giới hạn chủ yếu bởi GPU.`;
      adviceList.push(`Nếu phục vụ chơi game đồ họa cao, hãy cân nhắc giảm bớt chi phí CPU để nâng cấp dòng Card đồ họa (VGA) mạnh hơn.`);
    } else {
      bottleneckPercentage = Math.max(3, 5 + Math.abs(diff) * 2);
      bottleneckComponent = 'NONE';
      bottleneckText = `Cân bằng hiệu năng lý tưởng (Tỷ lệ nghẽn dưới ${bottleneckPercentage}%). Sự phối hợp giữa CPU và GPU đạt mức đồng bộ cao, tối ưu tuyệt vời cho gaming và tác vụ đồ họa.`;
      strengthsList.push('Bộ đôi CPU & GPU có độ tương xứng hiệu năng cực kỳ lý tưởng.');
    }
  } else if (cpu && !gpu) {
    bottleneckText = 'Chưa chọn Card đồ họa rời (VGA). Hệ thống sẽ sử dụng đồ họa tích hợp của CPU (iGPU), chỉ phù hợp cho tác vụ văn phòng và game cơ bản.';
    adviceList.push('Bổ sung thêm Card màn hình rời (VGA) nếu bạn có nhu cầu chơi game 3D, dựng video hoặc render thiết kế.');
  }

  // Khuyến nghị về RAM
  if (ram) {
    const isSingleStick = !(ram.name.toLowerCase().includes('2x') || ram.name.toLowerCase().includes('kit'));
    if (isSingleStick && !partsRecord.ram2) {
      adviceList.push('Lắp đặt RAM kênh đôi (Dual Channel - 2 thanh) để tăng băng thông dữ liệu bộ nhớ lên gấp đôi, giúp cải thiện từ 15-25% khung hình (FPS) khi chơi game.');
    }
  }

  // Khuyến nghị về Nguồn
  if (psu) {
    if (detailed.recommendedPsu > 0) {
      adviceList.push(`Công suất tiêu thụ ước tính tối đa của cấu hình là ~${detailed.estimatedWattage}W. Nguồn khuyến nghị đạt chuẩn là từ ${detailed.recommendedPsu}W.`);
    }
  }

  // Khuyến nghị về Ổ cứng
  if (storage) {
    const isNvme = storage.name.toLowerCase().includes('nvme') || storage.name.toLowerCase().includes('m.2');
    if (isNvme) {
      strengthsList.push('Đã trang bị ổ cứng SSD M.2 NVMe tốc độ cao giúp thời gian khởi động máy và load game siêu nhanh.');
    } else {
      adviceList.push('Khuyến khích ưu tiên chọn ổ cứng chuẩn SSD M.2 PCIe NVMe thay vì SATA 2.5" để đạt tốc độ truyền tải nhanh gấp 5 - 10 lần.');
    }
  }

  // Khuyến nghị về Tản nhiệt
  if (cpu) {
    const cpuTier = getCpuTier(cpu.name);
    if (cpuTier >= 4 && (!cooler || cooler.name.toLowerCase().includes('stock'))) {
      adviceList.push('CPU hiệu năng cao sinh nhiệt lớn, nên đầu tư tản nhiệt nước AIO 240mm/360mm hoặc tản tháp đôi để giữ máy luôn mát mẻ và vận hành ổn định.');
    }
  }

  // Tóm tắt tổng quan
  let summaryText = 'Cấu hình hoàn thiện, các linh kiện cơ bản đã sẵn sàng.';
  if (detailed.compatibilityScore >= 9.0) {
    summaryText = 'Dàn máy được xây dựng rất bài bản, tương thích hoàn hảo và cân bằng hiệu năng tối ưu.';
  } else if (detailed.compatibilityScore >= 7.5) {
    summaryText = 'Cấu hình khá tốt và tương thích, chỉ cần tối ưu nhẹ thêm một vài linh kiện để đạt hiệu suất cao nhất.';
  } else if (detailed.compatibilityScore >= 5.0) {
    summaryText = 'Cấu hình cần lưu ý điều chỉnh một số chi tiết về nguồn điện hoặc thông số tản nhiệt để đảm bảo độ bền.';
  } else {
    summaryText = 'Phát hiện linh kiện xung đột phần cứng (Socket/Kích thước/RAM). Vui lòng khắc phục các mục báo đỏ trước khi đặt hàng.';
  }

  return {
    summary: summaryText,
    compatibility_score: detailed.compatibilityScore,
    bottleneck_analysis: bottleneckText,
    bottleneck_percentage: bottleneckPercentage,
    bottleneck_component: bottleneckComponent,
    estimated_wattage: detailed.estimatedWattage,
    recommended_psu_wattage: detailed.recommendedPsu,
    advice: adviceList.slice(0, 4),
    strengths: strengthsList.slice(0, 4),
    source: 'expert_system',
  };
};

// ===== GEMINI API INTEGRATION =====

const GEMINI_SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn xây dựng cấu hình PC phần cứng chuyên nghiệp tại Việt Nam.
Nhiệm vụ của bạn là phân tích danh sách linh kiện PC và các vấn đề tương thích được cung cấp, sau đó trả về định dạng JSON thuần túy (không dùng markdown fences):
Cấu trúc JSON:
{
  "summary": string (dưới 200 ký tự tiếng Việt, tóm tắt khách quan chất lượng cấu hình),
  "compatibility_score": number (từ 0 đến 10 với 1 chữ số thập phân),
  "bottleneck_analysis": string (tiếng Việt, phân tích chi tiết mức độ nghẽn giữa CPU và GPU),
  "bottleneck_percentage": number (ước tính từ 0 đến 100),
  "bottleneck_component": "CPU" | "GPU" | "RAM" | "NONE",
  "estimated_wattage": number (công suất đỉnh ước tính W),
  "recommended_psu_wattage": number (công suất nguồn khuyến nghị W),
  "advice": string[] (3 đến 5 lời khuyên cụ thể, bắt đầu bằng động từ hành động),
  "strengths": string[] (2 đến 3 điểm sáng của cấu hình)
}`;

const callGemini = async (payload: AdvisorRequest): Promise<AdvisorResponse> => {
  if (!geminiApiKey || geminiApiKey.startsWith('AIzaSyChD5c0vg')) {
    throw new Error('NO_VALID_GEMINI_KEY');
  }

  const response = await fetch(`${geminiEndpoint}?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
      contents: [{
        role: 'user',
        parts: [{
          text: `### Build Parts:\n${JSON.stringify(payload.parts, null, 2)}\n\n### Detected Issues:\n${JSON.stringify(payload.issues, null, 2)}`
        }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  const parsed = JSON.parse(text);
  return {
    summary: parsed.summary,
    compatibility_score: typeof parsed.compatibility_score === 'number' ? Math.max(0, Math.min(10, parsed.compatibility_score)) : 8.5,
    bottleneck_analysis: parsed.bottleneck_analysis,
    bottleneck_percentage: parsed.bottleneck_percentage,
    bottleneck_component: parsed.bottleneck_component || 'NONE',
    estimated_wattage: parsed.estimated_wattage,
    recommended_psu_wattage: parsed.recommended_psu_wattage,
    advice: Array.isArray(parsed.advice) ? parsed.advice : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    source: 'gemini',
  };
};

export const aiAdvisorService = {
  async analyzeBuild(partsRecord: Record<string, Product | null>, issues: CompatibilityIssue[]): Promise<AdvisorResponse> {
    const payload = buildAdvisorPayload(partsRecord, issues);

    // Ưu tiên gọi Gemini nếu có cấu hình key
    if (geminiApiKey && !geminiApiKey.startsWith('AIzaSyChD5c0vg')) {
      try {
        return await callGemini(payload);
      } catch (err) {
        console.warn('Gemini API call failed, seamlessly falling back to Local Expert Engine:', err);
      }
    }

    // Tự động sử dụng Local Hardware Expert Engine chuyên nghiệp
    return generateLocalExpertAnalysis(partsRecord, issues);
  },

  isConfigured(): boolean {
    return true; // Luôn luôn sẵn sàng phục vụ với Local Expert Engine + Gemini Fallback
  },
};

export const buildAdvisorPayload = (parts: Record<string, Product | null>, issues: CompatibilityIssue[]): AdvisorRequest => {
  const entries = Object.entries(parts)
    .filter(([, product]) => Boolean(product))
    .map(([key, product]) => ({
      key,
      product_id: (product as Product).id,
      name: (product as Product).name,
      category_name: (product as Product).category?.name,
      price: (product as Product).price,
      specifications: (product as Product).specifications || {},
      attributes: (product as Product).attributes,
    }));

  return {
    parts: entries,
    issues,
  };
};
