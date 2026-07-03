import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, IconButton, Tooltip, Link, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, useTheme, Zoom, Skeleton } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useDashboardStore from '../../../store/useDashboardStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';

const PendingLeaves = ({ pendingLeaves, loading }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const isLight = theme.palette.mode === 'light';

    const { quickApproveLeave, quickRejectLeave } = useDashboardStore();

    // Dialog state for reject reason (Moved to top to prevent conditional hook execution)
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [openRejectDialog, setOpenRejectDialog] = useState(false);

    if (loading) {
        return (
            <Card
                sx={{
                    borderRadius: '16px',
                    boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${isLight ? '#e5eaf2' : 'rgba(255, 255, 255, 0.08)'}`,
                    height: '100%'
                }}
            >
                <CardContent sx={{ p: '24px !important' }}>
                    <Skeleton variant="text" width="40%" height={24} className="mb-6" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center justify-between">
                                <div className="flex gap-3 items-center flex-1">
                                    <Skeleton variant="circular" width={32} height={32} className="shrink-0" />
                                    <Skeleton variant="text" width="50%" />
                                </div>
                                <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '8px' }} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleApprove = async (id) => {
        await quickApproveLeave(id);
    };

    const handleOpenReject = (id) => {
        setRejectId(id);
        setRejectReason('');
        setOpenRejectDialog(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            return;
        }
        const success = await quickRejectLeave(rejectId, rejectReason);
        if (success) {
            setRejectReason('');
        } else {
            throw new Error('Quick reject failed');
        }
    };

    const getLeaveTypeLabel = (type) => {
        switch (type) {
            case 'ANNUAL':
                return t('leave.type.annual', 'Phép năm');
            case 'UNPAID':
                return t('leave.type.unpaid', 'Không lương');
            default:
                return type;
        }
    };

    return (
        <Zoom in={true}>
            <Card
                sx={{
                    borderRadius: '16px',
                    boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${isLight ? '#e5eaf2' : 'rgba(255, 255, 255, 0.08)'}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <CardContent sx={{ p: '24px !important', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {t('dashboard.leaves.title', 'Phê duyệt nghỉ phép nhanh')}
                        </Typography>
                        <Button 
                            endIcon={<ChevronRightIcon />} 
                            onClick={() => navigate('/leave-requests')}
                            size="small"
                            sx={{ color: 'primary.main', fontSize: '0.8rem', p: '2px 8px' }}
                        >
                            {t('dashboard.leaves.view_all', 'Xem tất cả')}
                        </Button>
                    </Box>

                    {pendingLeaves && pendingLeaves.length > 0 ? (
                        <TableContainer sx={{ flexGrow: 1, overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { borderBottom: `1px solid ${isLight ? '#f1f5f9' : '#334155'}`, color: 'text.secondary', fontWeight: 600, py: 1.5 } }}>
                                        <TableCell>{t('dashboard.leaves.col_staff', 'Nhân viên')}</TableCell>
                                        <TableCell>{t('dashboard.leaves.col_type', 'Loại phép')}</TableCell>
                                        <TableCell align="center">{t('dashboard.leaves.col_days', 'Số ngày')}</TableCell>
                                        <TableCell align="center">{t('dashboard.leaves.col_date', 'Thời gian nghỉ')}</TableCell>
                                        <TableCell align="right">{t('dashboard.leaves.col_actions', 'Thao tác')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingLeaves.map((row) => (
                                        <TableRow 
                                            key={row.leaveId}
                                            sx={{ 
                                                '&:last-child td': { border: 0 },
                                                '& td': { borderBottom: `1px solid ${isLight ? '#f1f5f9' : '#334155'}`, py: 1.2 }
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar 
                                                        src={row.staffAvatar} 
                                                        alt={row.staffName}
                                                        sx={{ 
                                                            width: 32, 
                                                            height: 32, 
                                                            fontSize: '0.8rem', 
                                                            fontWeight: 600,
                                                            bgcolor: 'primary.main',
                                                            color: 'primary.contrastText'
                                                        }}
                                                    >
                                                        {row.staffName?.substring(0, 1).toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                                        {row.staffName}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {getLeaveTypeLabel(row.leaveType)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                    {row.totalDays}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                    {dayjs(row.fromDate).format('DD/MM')} - {dayjs(row.toDate).format('DD/MM')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                                                    <Tooltip title={t('dashboard.leaves.approve', 'Phê duyệt')}>
                                                        <IconButton 
                                                            size="small" 
                                                            color="success" 
                                                            onClick={() => handleApprove(row.leaveId)}
                                                            sx={{ 
                                                                '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } 
                                                            }}
                                                        >
                                                            <CheckCircleOutlineIcon sx={{ fontSize: '20px' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={t('dashboard.leaves.reject', 'Từ chối')}>
                                                        <IconButton 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={() => handleOpenReject(row.leaveId)}
                                                            sx={{ 
                                                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' } 
                                                            }}
                                                        >
                                                            <HighlightOffIcon sx={{ fontSize: '20px' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ display: 'flex', height: '100%', flexGrow: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200, flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 600 }}>
                                🎉 {t('dashboard.leaves.all_done', 'Đã duyệt hết!')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('dashboard.leaves.no_requests', 'Không có yêu cầu nghỉ phép nào cần xử lý.')}
                            </Typography>
                        </Box>
                    )}
                </CardContent>

                {/* Reject Confirmation Dialog */}
                <ConfirmationDialog
                    open={openRejectDialog}
                    onConfirmDialogClose={() => {
                        setOpenRejectDialog(false);
                        setRejectId(null);
                        setRejectReason('');
                    }}
                    onYesClick={handleRejectSubmit}
                    title={t('dashboard.leaves.reject_title', 'Lý do từ chối')}
                    agree={t('common.reject', 'Từ chối')}
                    cancel={t('common.cancel', 'Hủy')}
                    disabled={!rejectReason.trim()}
                >
                    <div className="pt-2">
                        <TextField
                            autoFocus
                            label={t('dashboard.leaves.reject_reason_label', 'Lý do từ chối')}
                            fullWidth
                            variant="outlined"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            required
                        />
                    </div>
                </ConfirmationDialog>
            </Card>
        </Zoom>
    );
};

export default PendingLeaves;
