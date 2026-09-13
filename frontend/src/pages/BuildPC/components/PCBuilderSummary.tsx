import React from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography, Button, TextField, InputAdornment, useTheme } from '@mui/material';
import type { PriceTotals, SelectedParts, SelectedQuantities } from '../types';
import { exportQuotationExcel } from '../utils/excel';

interface Props {
    selectedParts: SelectedParts;
    quantities?: SelectedQuantities;
    totals: PriceTotals;
    onRemove: (key: keyof SelectedParts) => void;
    onUpdateQuantity?: (key: keyof SelectedParts, qty: number) => void;
    onReset: () => void;
    canExport?: boolean;
    onCheckout?: () => void | Promise<void>;
}

export const PCBuilderSummary: React.FC<Props> = ({ selectedParts, quantities = {} as SelectedQuantities, totals, onRemove, onUpdateQuantity, onReset, canExport, onCheckout }) => {
    const theme = useTheme();

    return (
        <Card
            variant="outlined"
            sx={{
                bgcolor: 'background.paper',
                borderColor: 'divider',
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.36)' : '0 8px 24px rgba(15, 23, 42, 0.06)',
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>Tóm tắt cấu hình</Typography>
                <Stack spacing={1.5}>
                    {Object.entries(selectedParts).map(([key, p]) => (
                        <Box
                            key={key}
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                gap: { xs: 1.5, sm: 1 },
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                            }}
                        >
                            <Box sx={{ minWidth: 120 }}>
                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 0.5 }}>{key.toUpperCase()}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{p ? p.name : '-'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                                {p ? (
                                    <>
                                        <TextField
                                            size="small"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            value={quantities?.[key as keyof SelectedParts] ?? 1}
                                            onChange={(e) => onUpdateQuantity && onUpdateQuantity(key as keyof SelectedParts, Number(e.target.value))}
                                            sx={{ width: 90 }}
                                            InputProps={{ endAdornment: <InputAdornment position="end">cái</InputAdornment> }}
                                        />
                                        <Typography variant="body2" className="tabular-nums font-mono-numbers" sx={{ minWidth: 120, textAlign: 'right', fontWeight: 600, color: 'text.primary' }}>
                                            {((p.price * (quantities?.[key as keyof SelectedParts] ?? 1))).toLocaleString('vi-VN')} ₫
                                        </Typography>
                                        <Button size="small" color="error" onClick={() => onRemove(key as keyof SelectedParts)}>Xóa</Button>
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">-</Typography>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 1 }}>
                    <Typography color="text.secondary" variant="body2">Tạm tính</Typography>
                    <Typography className="tabular-nums font-mono-numbers" variant="body2">{totals.subtotal.toLocaleString('vi-VN')} ₫</Typography>
                    <Typography color="text.secondary" variant="body2">Thuế (VAT)</Typography>
                    <Typography className="tabular-nums font-mono-numbers" variant="body2">{totals.tax.toLocaleString('vi-VN')} ₫</Typography>
                    <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>Tổng thanh toán</Typography>
                    <Typography className="tabular-nums font-mono-numbers" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.2rem' }}>
                        {totals.total.toLocaleString('vi-VN')} ₫
                    </Typography>
                </Box>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ mt: 2.5 }}
                >
                    <Button variant="outlined" color="inherit" onClick={onReset} sx={{ width: { xs: '100%', sm: 'auto' } }}>Làm mới</Button>
                    <Button
                        variant="outlined"
                        disabled={!canExport}
                        onClick={() => exportQuotationExcel(selectedParts, quantities, totals)}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        In đơn / Xuất Excel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!canExport}
                        onClick={() => { if (onCheckout) onCheckout(); }}
                        sx={{
                            width: { xs: '100%', sm: 'auto' },
                            fontWeight: 700,
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                        }}
                    >
                        Mua ngay
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};
