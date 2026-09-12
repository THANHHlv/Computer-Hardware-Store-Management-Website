import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
    Chip,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Zap,
    Cpu,
    ShieldCheck,
    Lightbulb,
    Activity,
} from 'lucide-react';
import type { CompatibilityIssue, SelectedParts } from '../types';
import type { AdvisorResponse } from '../../../services/aiAdvisor.service';

interface Props {
    selectedParts: SelectedParts;
    warnings: CompatibilityIssue[];
    advisorData: AdvisorResponse | null;
    onRequestAdvice?: () => void;
    advisorLoading?: boolean;
    advisorError?: string | null;
}

export const CompatibilityChecker: React.FC<Props> = ({
    warnings,
    advisorData,
    onRequestAdvice,
    advisorLoading,
    advisorError,
}) => {
    const errorIssues = warnings.filter(w => w.severity === 'error');
    const warningIssues = warnings.filter(w => w.severity === 'warning');

    const score = advisorData?.compatibility_score ?? (errorIssues.length > 0 ? 3.5 : warningIssues.length > 0 ? 7.5 : 9.8);
    const scoreColor = score >= 8.5 ? '#10B981' : score >= 6.0 ? '#F59E0B' : '#EF4444';
    const scoreLabel = score >= 8.5 ? 'Tương Thích Tối Ưu' : score >= 6.0 ? 'Cần Lưu Ý' : 'Xung Đột Phần Cứng';

    const bottleneckPct = advisorData?.bottleneck_percentage ?? 0;
    const bottleneckComponent = advisorData?.bottleneck_component ?? 'NONE';
    const bottleneckColor = bottleneckPct < 15 ? '#10B981' : bottleneckPct < 30 ? '#F59E0B' : '#EF4444';

    const estWatt = advisorData?.estimated_wattage ?? 0;
    const recPsu = advisorData?.recommended_psu_wattage ?? 0;

    return (
        <Card
            sx={{
                bgcolor: '#131B2E',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.36)',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Header with Cyber Accent */}
            <Box
                sx={{
                    p: 2.5,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: 'rgba(0, 240, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#00F0FF',
                            boxShadow: '0 0 12px rgba(0, 240, 255, 0.25)',
                        }}
                    >
                        <Sparkles size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F8FAFC', letterSpacing: -0.2 }}>
                            Kiểm Tra Tương Thích & Cố Vấn AI
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            Phân tích phần cứng chuyên sâu thời gian thực
                        </Typography>
                    </Box>
                </Stack>

                <Chip
                    size="small"
                    icon={<ShieldCheck size={14} color="#00F0FF" />}
                    label={advisorData?.source === 'gemini' ? 'Gemini AI Pro' : 'AI Expert Engine'}
                    sx={{
                        bgcolor: 'rgba(0, 240, 255, 0.1)',
                        color: '#00F0FF',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                    }}
                />
            </Box>

            <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2.5}>
                    {/* Score Overview Card */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${scoreColor}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Box>
                            <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                                Điểm tương thích cấu hình
                            </Typography>
                            <Stack direction="row" spacing={1.5} alignItems="baseline">
                                <Typography
                                    variant="h3"
                                    className="tabular-nums font-mono-numbers"
                                    sx={{ fontWeight: 800, color: scoreColor, lineHeight: 1 }}
                                >
                                    {score.toFixed(1)}
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#64748B', fontWeight: 600 }}>
                                    / 10
                                </Typography>
                                <Chip
                                    size="small"
                                    label={scoreLabel}
                                    sx={{
                                        bgcolor: `${scoreColor}22`,
                                        color: scoreColor,
                                        fontWeight: 700,
                                        border: `1px solid ${scoreColor}55`,
                                        ml: 1,
                                    }}
                                />
                            </Stack>
                        </Box>

                        <Box sx={{ width: { xs: '100%', sm: '180px' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Độ ổn định</Typography>
                                <Typography variant="caption" sx={{ color: scoreColor, fontWeight: 700 }}>
                                    {Math.round(score * 10)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={score * 10}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        bgcolor: scoreColor,
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Hardware Metrics: Bottleneck & Power Usage */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {/* Bottleneck Gauge */}
                        <Box
                            sx={{
                                p: 1.75,
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Cpu size={16} color={bottleneckColor} />
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                                    Cân Bằng CPU - GPU
                                </Typography>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                                    {bottleneckPct > 0 ? `Nghẽn ~${bottleneckPct}% (${bottleneckComponent})` : 'Cực kỳ cân đối'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: bottleneckColor, fontWeight: 700 }}>
                                    {bottleneckPct <= 10 ? 'Lý tưởng' : bottleneckPct <= 25 ? 'Chấp nhận' : 'Cần đổi'}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(100, bottleneckPct * 2.5)}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 3,
                                        bgcolor: bottleneckColor,
                                    },
                                }}
                            />
                        </Box>

                        {/* Power Consumption Gauge */}
                        <Box
                            sx={{
                                p: 1.75,
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Zap size={16} color="#00F0FF" />
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                                    Công Suất Tiêu Thụ Đỉnh
                                </Typography>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                                <Typography variant="body2" className="tabular-nums font-mono-numbers" sx={{ fontWeight: 700, color: '#00F0FF' }}>
                                    ~{estWatt} W
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                    Nguồn đề xuất: <strong style={{ color: '#F8FAFC' }}>{recPsu}W+</strong>
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={recPsu > 0 ? Math.min(100, (estWatt / recPsu) * 100) : 50}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 3,
                                        bgcolor: '#00F0FF',
                                    },
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Hardware Issues List */}
                    <Box>
                        {errorIssues.length > 0 && (
                            <Stack spacing={1.25} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700, letterSpacing: 0.5 }}>
                                    LỖI XUNG ĐỘT PHẦN CỨNG ({errorIssues.length}):
                                </Typography>
                                {errorIssues.map((issue, idx) => (
                                    <Box
                                        key={issue.code || idx}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(239, 68, 68, 0.08)',
                                            border: '1px solid rgba(239, 68, 68, 0.25)',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1.25,
                                        }}
                                    >
                                        <XCircle size={18} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Typography variant="body2" sx={{ color: '#FCA5A5', lineHeight: 1.5 }}>
                                            {issue.message}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        {warningIssues.length > 0 && (
                            <Stack spacing={1.25} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: 0.5 }}>
                                    CẢNH BÁO TỐI ƯU ({warningIssues.length}):
                                </Typography>
                                {warningIssues.map((issue, idx) => (
                                    <Box
                                        key={issue.code || idx}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'rgba(245, 158, 11, 0.08)',
                                            border: '1px solid rgba(245, 158, 11, 0.25)',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1.25,
                                        }}
                                    >
                                        <AlertTriangle size={18} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Typography variant="body2" sx={{ color: '#FDE68A', lineHeight: 1.5 }}>
                                            {issue.message}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        {errorIssues.length === 0 && warningIssues.length === 0 && (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <CheckCircle2 size={20} color="#10B981" />
                                <Typography variant="body2" sx={{ color: '#A7F3D0', fontWeight: 600 }}>
                                    Tuyệt vời! Toàn bộ linh kiện đã chọn hoàn toàn ăn khớp và tương thích với nhau.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* AI Advisor Insights & Actionable Advice */}
                    {advisorData && (
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor: 'rgba(0, 240, 255, 0.03)',
                                border: '1px solid rgba(0, 240, 255, 0.15)',
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Activity size={16} color="#00F0FF" />
                                <Typography variant="subtitle2" sx={{ color: '#00F0FF', fontWeight: 700 }}>
                                    Nhận Định Chuyên Gia AI:
                                </Typography>
                            </Stack>

                            {advisorData.summary && (
                                <Typography variant="body2" sx={{ color: '#E2E8F0', mb: 1.5, lineHeight: 1.6 }}>
                                    {advisorData.summary}
                                </Typography>
                            )}

                            {advisorData.bottleneck_analysis && (
                                <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'rgba(0, 0, 0, 0.3)', mb: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 0.5, fontWeight: 600 }}>
                                        PHÂN TÍCH NGHẼN HIỆU NĂNG:
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                                        {advisorData.bottleneck_analysis}
                                    </Typography>
                                </Box>
                            )}

                            {advisorData.advice && advisorData.advice.length > 0 && (
                                <Box sx={{ mt: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, display: 'block', mb: 1 }}>
                                        LỜI KHUYÊN HÀNH ĐỘNG:
                                    </Typography>
                                    <Stack spacing={1}>
                                        {advisorData.advice.map((tip, idx) => (
                                            <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                                                <Lightbulb size={16} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                                                <Typography variant="body2" sx={{ color: '#F1F5F9', fontSize: '0.85rem' }}>
                                                    {tip}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Trigger AI Button */}
                    <Box>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={onRequestAdvice}
                            disabled={advisorLoading}
                            startIcon={advisorLoading ? <CircularProgress size={18} color="inherit" /> : <Sparkles size={18} />}
                            sx={{
                                py: 1.2,
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)',
                                color: '#0A0E17',
                                boxShadow: '0 4px 16px rgba(0, 240, 255, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #38BDF8 0%, #00F0FF 100%)',
                                    boxShadow: '0 6px 20px rgba(0, 240, 255, 0.5)',
                                },
                            }}
                        >
                            {advisorLoading ? 'AI Đang Phân Tích Chuyên Sâu...' : 'Nhờ AI Phân Tích & Tối Ưu Cấu Hình'}
                        </Button>
                    </Box>

                    {advisorError && (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            {advisorError}
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default CompatibilityChecker;
