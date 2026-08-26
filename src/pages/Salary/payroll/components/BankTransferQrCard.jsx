import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { generateBankTransferQr } from '../../../../services/payrollService';

// Format currency
const formatVND = (value) => {
    if (!value || isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const BankTransferQrCard = ({
    bankName,
    bankAccountNumber,
    bankAccountName,
    bankBin,
    amount,
    note,
    onClick,
    qrSize = 80
}) => {
    const [qrBase64, setQrBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQr = async () => {
            if (!bankBin || !bankAccountNumber) return;
            try {
                setLoading(true);
                setError(null);
                const payload = {
                    bankCode: bankBin,
                    accountNumber: bankAccountNumber,
                    accountHolderName: bankAccountName || '',
                    amount: amount && amount > 0 ? Math.round(amount) : null,
                    transferContent: note || ''
                };
                const response = await generateBankTransferQr(payload);
                if (response?.data?.data?.qrImageBase64 || response?.data?.qrImageBase64) {
                    setQrBase64(response.data.data?.qrImageBase64 || response.data.qrImageBase64);
                } else {
                    setError('Failed to generate QR');
                }
            } catch (err) {
                console.error('QR generation error:', err);
                setError('Error generating QR');
            } finally {
                setLoading(false);
            }
        };
        fetchQr();
    }, [bankBin, bankAccountNumber, bankAccountName, amount, note]);

    return (
        <Box 
            onClick={onClick}
            sx={{
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'light' ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                p: 2,
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? { 
                    boxShadow: (theme) => theme.palette.mode === 'light' 
                        ? '0 2px 8px rgba(0,0,0,0.1)' 
                        : '0 2px 8px rgba(0,0,0,0.4)' 
                } : {},
                backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fafafa' : 'rgba(255, 255, 255, 0.02)',
                width: '100%'
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: '20px' }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                        Thông tin chuyển khoản
                    </Typography>
                </Box>
                {onClick && (
                    <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 'bold' }}>
                        Nhấp xem chi tiết
                    </Typography>
                )}
            </Box>

            <Box display="flex" gap={2} alignItems="center">
                <Box flex={1} sx={{ fontSize: '13px', color: 'text.secondary' }}>
                    <Box display="flex" mb={0.5}>
                        <Typography variant="body2" sx={{ width: '80px', color: 'text.secondary', shrink: 0 }}>Ngân hàng:</Typography>
                        <Typography variant="body2" fontWeight="medium" color="text.primary">{bankName || '---'}</Typography>
                    </Box>
                    <Box display="flex" mb={0.5}>
                        <Typography variant="body2" sx={{ width: '80px', color: 'text.secondary', shrink: 0 }}>Số TK:</Typography>
                        <Typography variant="body2" fontWeight="medium" color="text.primary" sx={{ fontFamily: 'monospace' }}>{bankAccountNumber || '---'}</Typography>
                    </Box>
                    <Box display="flex" mb={0.5}>
                        <Typography variant="body2" sx={{ width: '80px', color: 'text.secondary', shrink: 0 }}>Số tiền:</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: 'primary.main' }}>{formatVND(amount)}</Typography>
                    </Box>
                </Box>

                <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center"
                    sx={{
                        width: qrSize,
                        height: qrSize,
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'light' ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        p: 0.5,
                        overflow: 'hidden'
                    }}
                >
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : qrBase64 ? (
                        <img src={qrBase64} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '9px', lineHeight: 1 }}>
                            {error ? 'Lỗi QR' : 'Không có QR'}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default BankTransferQrCard;
