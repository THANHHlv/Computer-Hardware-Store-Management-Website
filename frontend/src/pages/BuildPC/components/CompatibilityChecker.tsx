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
import { useTheme, alpha } from '@mui/material/styles';
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
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

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
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.36)' : '0 8px 24px rgba(15, 23, 42, 0.06)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            {/* Header with Adaptive Accent */}
            <Box
                sx={{
                    p: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    background: isDark
                        ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                        : 'linear-gradient(90deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.04) 100%)',
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
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.palette.primary.main,
                            boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        <Sparkles size={20} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: -0.2 }}>
                            Kiểm Tra Tương Thích & Cố Vấn AI
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Phân tích phần cứng chuyên sâu thời gian thực
                        </Typography>
                    </Box>
                </Stack>

                <Chip
                    size="small"
                    icon={<ShieldCheck size={14} color={theme.palette.primary.main} />}
                    label={advisorData?.source === 'gemini' ? 'Gemini AI Pro' : 'AI Expert Engine'}
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
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
                            bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                            border: `1px solid ${scoreColor}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
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
                                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    / 10
                                </Typography>
                                <Chip
                                    size="small"
                                    label={scoreLabel}
                                    sx={{
                                        bgcolor: `${scoreColor}18`,
                                        color: scoreColor,
                                        fontWeight: 700,
                                        border: `1px solid ${scoreColor}44`,
                                        ml: 1,
                                    }}
                                />
                            </Stack>
                        </Box>

                        <Box sx={{ width: { xs: '100%', sm: '180px' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Độ ổn định</Typography>
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
                                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
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
                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Cpu size={16} color={bottleneckColor} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Cân Bằng CPU - GPU
                                </Typography>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
                                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
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
                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Zap size={16} color={theme.palette.primary.main} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Công Suất Tiêu Thụ Đỉnh
                                </Typography>
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                                <Typography variant="body2" className="tabular-nums font-mono-numbers" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                    ~{estWatt} W
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Nguồn đề xuất: <strong style={{ color: theme.palette.text.primary }}>{recPsu}W+</strong>
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={recPsu > 0 ? Math.min(100, (estWatt / recPsu) * 100) : 50}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 3,
                                        bgcolor: theme.palette.primary.main,
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
                                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FECACA',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1.25,
                                        }}
                                    >
                                        <XCircle size={18} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Typography variant="body2" sx={{ color: isDark ? '#FCA5A5' : '#B91C1C', lineHeight: 1.5, fontWeight: 500 }}>
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
                                            bgcolor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#FFFBEB',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1.25,
                                        }}
                                    >
                                        <AlertTriangle size={18} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                                        <Typography variant="body2" sx={{ color: isDark ? '#FDE68A' : '#B45309', lineHeight: 1.5, fontWeight: 500 }}>
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
                                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <CheckCircle2 size={20} color="#10B981" />
                                <Typography variant="body2" sx={{ color: isDark ? '#A7F3D0' : '#047857', fontWeight: 600 }}>
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
                                bgcolor: isDark ? 'rgba(56, 189, 248, 0.04)' : alpha(theme.palette.primary.main, 0.03),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Activity size={16} color={theme.palette.primary.main} />
                                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                                    Nhận Định Chuyên Gia AI:
                                </Typography>
                            </Stack>

                            {advisorData.summary && (
                                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5, lineHeight: 1.6 }}>
                                    {advisorData.summary}
                                </Typography>
                            )}

                            {advisorData.bottleneck_analysis && (
                                <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)', mb: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 600 }}>
                                        PHÂN TÍCH NGHẼN HIỆU NĂNG:
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
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
                                                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
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
                                py: 1.3,
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                borderRadius: 2.5,
                                background: isDark
                                    ? 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)'
                                    : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                color: '#FFFFFF',
                                boxShadow: isDark
                                    ? '0 4px 16px rgba(56, 189, 248, 0.3)'
                                    : '0 4px 16px rgba(37, 99, 235, 0.3)',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    background: isDark
                                        ? 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)'
                                        : 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                                    boxShadow: isDark
                                        ? '0 6px 22px rgba(56, 189, 248, 0.45)'
                                        : '0 6px 22px rgba(37, 99, 235, 0.45)',
                                    transform: 'translateY(-1px)',
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
