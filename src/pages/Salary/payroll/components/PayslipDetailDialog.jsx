import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Button,
    Grid,
    Divider,
    Tooltip,
    CircularProgress
} from '@mui/material';
import Popup from '../../../../components/ui/Popup';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SaveIcon from '@mui/icons-material/Save';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'sonner';
import { Formik, FormikProvider } from 'formik';
import CustomTextField from '../../../../components/ui/TextField';
import SelectInput from '../../../../components/ui/SelectInput';
import { SalaryCalculationType } from '../../../../constants';
import usePayrollStore from '../../../../store/usePayrollStore';
import BankTransferQrCard from './BankTransferQrCard';
import { generateBankTransferQr } from '../../../../services/payrollService';
import useAuthStore from '../../../../store/useAuthStore';
import { ROLES } from '../../../../constants/roles';

const PayslipDetailDialog = ({
    open,
    onClose,
    detail,
    activePayroll,
    isAdmin = false,
    onUpdateSuccess
}) => {
    const { t } = useTranslation();
    // Store states and actions
    const { updatePayslipStatus, updating } = usePayrollStore();
    const hasRole = useAuthStore((state) => state.hasRole);

    // Dynamic role check for editing and QR
    const hasEditPermission = hasRole([
        ROLES.ADMIN,
        ROLES.HR_MANAGER,
        ROLES.HR_COMPENSATION_BENEFIT
    ]);
    const canEdit = isAdmin || hasEditPermission;

    // Local states
    const [localPaidStatus, setLocalPaidStatus] = useState('UNPAID');
    const [localNote, setLocalNote] = useState('');
    const [openQrModal, setOpenQrModal] = useState(false);
    const [qrModalImage, setQrModalImage] = useState(null);
    const [qrModalLoading, setQrModalLoading] = useState(false);

    const defaultBankAcc = detail?.staff?.bankAccounts?.find(b => b.isDefault) || detail?.staff?.bankAccounts?.[0] || detail?.staff?.bankAccount;

    // Sync local state when detail changes
    useEffect(() => {
        if (detail) {
            setLocalPaidStatus(detail.paidStatus || 'UNPAID');
            setLocalNote(detail.note || '');
        }
    }, [detail]);

    // Helpers
    const removeAccents = (str) => {
        if (!str) return '';
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toUpperCase()
            .trim();
    };

    const formatMoney = (val) => {
        if (val === undefined || val === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const getTransferContent = (payslipDetail) => {
        if (!payslipDetail) return '';
        const month = activePayroll?.period?.month || 6;
        const year = activePayroll?.period?.year || 2026;
        const displayName = removeAccents(payslipDetail.staff?.displayName || '');
        const position = (payslipDetail.staff?.positionName || '').toLowerCase();
        const isIntern = position.includes('thực tập') || position.includes('thuc tap') || position.includes('intern');
        
        return isIntern
            ? `CHUYEN TRO CAP THUC TAP THANG ${month}/${year} CHO THUC TAP SINH ${displayName}`
            : `THANH TOAN LUONG THANG ${month}/${year} CHO NHAN VIEN ${displayName}`;
    };

    // Actions
    const handleUpdatePayslip = async () => {
        if (!detail) return;
        try {
            const response = await updatePayslipStatus(detail.id, localPaidStatus, localNote);
            if (response?.data) {
                toast.success(t('salary.payslip.update_success', 'Cập nhật phiếu lương thành công!'));
                if (onUpdateSuccess) {
                    onUpdateSuccess(detail.id, localPaidStatus, localNote);
                }
            }
        } catch (err) {
            console.error('Failed to update payslip:', err);
            toast.error(t('salary.payslip.update_error', 'Không thể cập nhật phiếu lương'));
        }
    };

    const handleOpenQrModal = async (payslipDetail) => {
        if (!payslipDetail) return;
        
        const defaultBankAcc = payslipDetail.staff?.bankAccounts?.find(b => b.isDefault) || payslipDetail.staff?.bankAccounts?.[0] || payslipDetail.staff?.bankAccount;
        
        const bankBin = defaultBankAcc?.bankBin || payslipDetail.staff?.bankBin;
        const bankAccountNumber = defaultBankAcc?.accountNumber || payslipDetail.staff?.bankAccountNumber;
        const bankAccountName = defaultBankAcc?.accountName || payslipDetail.staff?.bankAccountName || payslipDetail.staff?.displayName;
        
        if (!bankBin || !bankAccountNumber) {
            toast.error(t('salary.payslip.bank_account_missing_error', 'Nhân viên chưa cấu hình thông tin tài khoản ngân hàng hoặc mã BIN!'));
            return;
        }

        try {
            setQrModalLoading(true);
            setOpenQrModal(true);
            
            const netSalary = payslipDetail.netSalary || 0;
            const content = getTransferContent(payslipDetail);
            
            const payload = {
                bankCode: bankBin,
                accountNumber: bankAccountNumber,
                accountHolderName: removeAccents(bankAccountName || ''),
                amount: Math.round(netSalary),
                transferContent: content
            };
            
            const response = await generateBankTransferQr(payload);
            if (response?.data?.data?.qrImageBase64 || response?.data?.qrImageBase64) {
                setQrModalImage(response.data.data?.qrImageBase64 || response.data.qrImageBase64);
            } else {
                setQrModalImage(null);
            }
        } catch (err) {
            console.error('Failed to generate big QR:', err);
            toast.error(t('salary.payslip.qr_generate_error', 'Không thể tạo mã QR chi tiết'));
        } finally {
            setQrModalLoading(false);
        }
    };

    if (!detail) return null;

    return (
        <>
            <Popup
                open={open}
                onClosePopup={onClose}
                title={t('salary.payslip.popup_title', 'Phiếu lương nhân viên')}
                size="lg"
                action={
                    <Box display="flex" width="100%" justifyContent="end" gap={1}>
                        <Button 
                            onClick={onClose} 
                            color="inherit" 
                            variant="outlined" 
                            sx={{ textTransform: 'none' }}
                        >
                            {t('common.close', 'Đóng')}
                        </Button>
                        {canEdit && (
                            <>
                                <Button
                                    onClick={handleUpdatePayslip}
                                    color="primary"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={updating}
                                    sx={{ textTransform: 'none' }}
                                >
                                    {t('common.save', 'Lưu')}
                                </Button>
                            </>
                        )}
                    </Box>
                }
            >
                <Grid container spacing={3} sx={{ minHeight: '400px', mt: 0 }}>
                    {/* Left Panel: Detailed Salary Items */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ borderRight: { md: '1px solid #e0e0e0' }, pr: { md: 3 }, pb: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
                                {t('salary.payslip.salary_components_detail', 'CHI TIẾT CÁC THÀNH PHẦN LƯƠNG')}
                            </Typography>

                            {/* Standard Fields */}
                            <Tooltip title={t('salary.payslip.std_hours_tooltip', 'Số ngày công chuẩn * 8 giờ')} arrow placement="top">
                                <Box 
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid',
                                        borderColor: (theme) => theme.palette.mode === 'light' ? '#e8e8e8' : 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        p: 1.5,
                                        mb: 1.5,
                                        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fafafa' : 'rgba(255, 255, 255, 0.03)',
                                        '&:hover': { backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.06)' }
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                        {t('salary.payslip.standard_work_hours', 'Số giờ công tiêu chuẩn')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                        {(activePayroll?.period?.standardWorkDays || 30) * 8}
                                    </Typography>
                                </Box>
                            </Tooltip>

                            <Tooltip title={t('salary.payslip.actual_hours_tooltip', 'Số ngày thực tế đi làm * 8 giờ')} arrow placement="top">
                                <Box 
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid',
                                        borderColor: (theme) => theme.palette.mode === 'light' ? '#e8e8e8' : 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        p: 1.5,
                                        mb: 1.5,
                                        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fafafa' : 'rgba(255, 255, 255, 0.03)',
                                        '&:hover': { backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.06)' }
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                        {t('salary.payslip.actual_work_hours', 'Số giờ công thực tế')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                        {detail.totalWorkDays ? (detail.totalWorkDays * 8) : 0}
                                    </Typography>
                                </Box>
                            </Tooltip>

                            <Tooltip title={t('salary.payslip.timesheet_source_tooltip', 'Lấy từ bảng chấm công được duyệt')} arrow placement="top">
                                <Box 
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: '1px solid',
                                        borderColor: (theme) => theme.palette.mode === 'light' ? '#e8e8e8' : 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        p: 1.5,
                                        mb: 1.5,
                                        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fafafa' : 'rgba(255, 255, 255, 0.03)',
                                        '&:hover': { backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.06)' }
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                        {t('salary.payslip.actual_work_days', 'Ngày công thực tế đi làm')}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                        {detail.totalWorkDays || 0}
                                    </Typography>
                                </Box>
                            </Tooltip>

                            {/* Salary Items List */}
                            {detail.items?.map((item, idx) => {
                                const formula = (() => {
                                    const base = item.amount || 0;
                                    const std = activePayroll?.period?.standardWorkDays || 26;
                                    const wd = Number((detail.totalWorkDays || 0).toFixed(2));
                                    const ot = Number((detail.totalOtHours || 0).toFixed(2));
                                    if (item.salaryItem?.code === 'OT' || item.salaryItem?.code === 'LUONG_OT' || item.salaryItem?.code === 'OVERTIME' || item.salaryItem?.code?.toUpperCase()?.includes('TANG_CA')) {
                                        const parts = [];
                                        const ot1 = detail.totalOtHours || 0;
                                        const ot2 = detail.totalWeekendOtHours || 0;
                                        const ot3 = detail.totalHolidayOtHours || 0;
                                        
                                        if (ot1 > 0) parts.push(`(${formatMoney(base)} / ${std} ${t('salary.payslip.standard_days_unit', 'ngày')} / 8 ${t('salary.payslip.ot_hours_unit', 'giờ')}) * 1.5 * ${ot1.toFixed(2)} ${t('salary.payslip.ot_regular_hours', 'giờ OT thường')}`);
                                        if (ot2 > 0) parts.push(`(${formatMoney(base)} / ${std} ${t('salary.payslip.standard_days_unit', 'ngày')} / 8 ${t('salary.payslip.ot_hours_unit', 'giờ')}) * 2.0 * ${ot2.toFixed(2)} ${t('salary.payslip.ot_weekend_hours', 'giờ OT cuối tuần')}`);
                                        if (ot3 > 0) parts.push(`(${formatMoney(base)} / ${std} ${t('salary.payslip.standard_days_unit', 'ngày')} / 8 ${t('salary.payslip.ot_hours_unit', 'giờ')}) * 3.0 * ${ot3.toFixed(2)} ${t('salary.payslip.ot_holiday_hours', 'giờ OT ngày lễ')}`);
                                        
                                        if (parts.length === 0) {
                                            return `${t('salary.payslip.calculation_method', 'Cách tính:')} ${t('salary.payslip.no_ot_hours', 'Không có giờ OT')} (${t('salary.payslip.ot_regular', 'Thường:')} ${ot1.toFixed(2)}h, ${t('salary.payslip.ot_weekend', 'Cuối tuần:')} ${ot2.toFixed(2)}h, ${t('salary.payslip.ot_holiday', 'Lễ:')} ${ot3.toFixed(2)}h)`;
                                        }
                                        return `${t('salary.payslip.calculation_method', 'Cách tính:')} ${parts.join(' + ')}`;
                                    }
                                    switch (item.salaryItem?.calculationType) {
                                        case SalaryCalculationType.FIXED:
                                            return `${t('salary.payslip.calculation_method', 'Cách tính:')} ${t('salary.payslip.fixed', 'Cố định')} (${formatMoney(base)})`;
                                        case SalaryCalculationType.BY_STANDARD_DAYS:
                                            return `${t('salary.payslip.calculation_method', 'Cách tính:')} (${formatMoney(base)} / ${std} ${t('salary.payslip.standard_days_unit', 'ngày công chuẩn')}) * ${wd} ${t('salary.payslip.actual_days_unit', 'ngày thực tế')}`;
                                        case SalaryCalculationType.DAILY_MULTIPLIED:
                                            return `${t('salary.payslip.calculation_method', 'Cách tính:')} ${formatMoney(base)} * ${wd} ${t('salary.payslip.actual_days_unit', 'ngày thực tế')}`;
                                        default:
                                            return `${t('salary.payslip.calculation_method', 'Cách tính:')} ${item.salaryItem?.calculationType === SalaryCalculationType.BY_STANDARD_DAYS ? t('salary.payslip.by_standard_workdays', 'Tính theo công') : t('salary.payslip.by_actual_workdays', 'Theo ngày thực tế')}`;
                                    }
                                })();

                                return (
                                    <Tooltip key={idx} title={formula} arrow placement="top">
                                        <Box 
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                border: '1px solid',
                                                borderColor: (theme) => theme.palette.mode === 'light' ? '#e8e8e8' : 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '4px',
                                                p: 1.5,
                                                mb: 1.5,
                                                backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fff' : 'rgba(255, 255, 255, 0.01)',
                                                '&:hover': { backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fcfcfc' : 'rgba(255, 255, 255, 0.04)' }
                                            }}
                                        >
                                            <Typography variant="body2" color="text.primary" fontWeight="medium">
                                                {item.name}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                {formatMoney(item.calculatedValue)}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                );
                            })}

                            {/* Net Salary Row */}
                            <Box 
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    borderRadius: '4px',
                                    p: 1.5,
                                    backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fff' : 'rgba(255, 255, 255, 0.02)',
                                    boxShadow: (theme) => theme.palette.mode === 'light' 
                                        ? '0 1px 4px rgba(25, 118, 210, 0.1)' 
                                        : '0 1px 4px rgba(0, 0, 0, 0.3)'
                                }}
                            >
                                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                    {t('salary.payslip.net_salary', 'Lương thực lĩnh')}
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: 'primary.main' }}>
                                    {formatMoney(detail.netSalary)}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Panel: Metadata Information Form */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
                            {t('salary.payslip.payslip_info', 'THÔNG TIN PHIẾU')}
                        </Typography>
                        
                        <Formik
                            initialValues={{
                                displayName: `${detail.staff?.displayName || ''} - ${detail.staff?.staffCode || ''}`,
                                payrollPeriodName: activePayroll?.period?.name || '',
                                payrollName: activePayroll?.name || '',
                                paidStatus: localPaidStatus,
                                note: localNote
                            }}
                            enableReinitialize
                            onSubmit={() => {}}
                        >
                            {(formikProps) => (
                                <FormikProvider value={formikProps}>
                                    <CustomTextField
                                        label={t('staff.name', 'Nhân viên')}
                                        name="displayName"
                                        readOnly
                                    />

                                    <CustomTextField
                                        label={t('salary.period.name', 'Kỳ lương')}
                                        name="payrollPeriodName"
                                        readOnly
                                    />

                                    <CustomTextField
                                        label={t('salary.payroll.name', 'Thuộc bảng lương')}
                                        name="payrollName"
                                        readOnly
                                    />

                                    <SelectInput
                                        label={t('salary.payroll.paid_status_label', 'Trạng thái chi trả')}
                                        name="paidStatus"
                                        options={[
                                            { value: 'UNPAID', name: t('salary.payroll.paid_status.unpaid', 'Chưa chi trả') },
                                            { value: 'PAID', name: t('salary.payroll.paid_status.paid', 'Đã chi trả') }
                                        ]}
                                        keyValue="value"
                                        displayvalue="name"
                                        hideNullOption={true}
                                        disabled={!canEdit}
                                        handleChange={(e) => setLocalPaidStatus(e.target.value)}
                                    />

                                    <CustomTextField
                                        label={t('common.notes', 'Ghi chú')}
                                        name="note"
                                        multiline
                                        rows={3}
                                        placeholder={t('common.notes_placeholder', 'Nhập ghi chú (nếu có)...')}
                                        notDelay={true}
                                        readOnly={!canEdit}
                                        onChange={(e) => setLocalNote(e.target.value)}
                                    />
                                </FormikProvider>
                            )}
                        </Formik>

                        {/* Admin QR Features */}
                        {canEdit && (
                            <>
                                <Box mb={2} mt={3}>
                                    <BankTransferQrCard
                                        bankName={defaultBankAcc?.bankName || detail.staff?.bankName || ''}
                                        bankAccountNumber={defaultBankAcc?.accountNumber || detail.staff?.bankAccountNumber || ''}
                                        bankAccountName={removeAccents(defaultBankAcc?.accountName || detail.staff?.bankAccountName || detail.staff?.displayName || '')}
                                        bankBin={defaultBankAcc?.bankBin || detail.staff?.bankBin || ''}
                                        amount={detail.netSalary}
                                        note={getTransferContent(detail)}
                                        onClick={() => handleOpenQrModal(detail)}
                                    />
                                </Box>

                                <Button 
                                    fullWidth
                                    variant="contained"
                                    startIcon={<QrCodeIcon />}
                                    onClick={() => handleOpenQrModal(detail)}
                                    sx={{
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText',
                                        mb: 1.5,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark'
                                        }
                                    }}
                                >
                                    {t('salary.payslip.qr_btn', 'QR Chuyển khoản')}
                                </Button>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Popup>

            {/* VietQR Detailed Modal */}
            <Popup
                open={openQrModal}
                onClosePopup={() => setOpenQrModal(false)}
                title={t('salary.payslip.qr_modal_title', 'QR Chuyển Khoản Lương')}
                size="md"
                action={
                    <Button 
                        onClick={() => setOpenQrModal(false)} 
                        variant="outlined" 
                        color="inherit" 
                        sx={{ textTransform: 'none' }}
                    >
                        {t('common.close', 'Đóng')}
                    </Button>
                }
            >
                {detail && (
                    <Box sx={{ p: 1 }}>
                        <Grid container spacing={3} alignItems="center">
                            {/* Left Side: Details */}
                            <Grid item xs={12} md={7}>
                                <Box display="flex" alignItems="center" gap={1} mb={3} mt={2}>
                                    <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: '20px' }} />
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                        {t('salary.payslip.transfer_info', 'Thông tin chuyển khoản')}
                                    </Typography>
                                </Box>

                                <Box sx={{ fontSize: '14px', '& > div': { display: 'flex', mb: 2 } }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary', flexShrink: 0 }}>{t('salary.payslip.bank_name', 'Ngân hàng:')}</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ flex: 1 }}>{detail.staff?.bankName || '---'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary', flexShrink: 0 }}>{t('salary.payslip.account_number', 'Số TK:')}</Typography>
                                        <Typography variant="body2" fontWeight="medium" color="text.primary" sx={{ flex: 1 }}>{detail.staff?.bankAccountNumber || '---'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary', flexShrink: 0 }}>{t('salary.payslip.account_name', 'Chủ TK:')}</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ flex: 1 }}>{removeAccents(detail.staff?.bankAccountName || detail.staff?.displayName || '---')}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary', flexShrink: 0 }}>{t('salary.payslip.amount', 'Số tiền:')}</Typography>
                                        <Typography variant="body2" fontWeight="bold" sx={{ color: 'primary.main', flex: 1 }}>{formatMoney(detail.netSalary)}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ width: '120px', color: 'text.secondary', flexShrink: 0 }}>{t('salary.payslip.transfer_content', 'Nội dung:')}</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1, wordBreak: 'break-word' }}>
                                            {getTransferContent(detail)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Right Side: QR Code image */}
                            <Grid item xs={12} md={5} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                <Box 
                                    sx={{
                                        border: '1px solid',
                                        borderColor: (theme) => theme.palette.mode === 'light' ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        mb: 2,
                                        mt: 2,
                                        backgroundColor: '#fff',
                                        width: '200px',
                                        height: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: (theme) => theme.palette.mode === 'light'
                                            ? '0 2px 10px rgba(0,0,0,0.05)'
                                            : '0 2px 10px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {qrModalLoading ? (
                                        <CircularProgress size={30} />
                                    ) : qrModalImage ? (
                                        <img src={qrModalImage} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">{t('salary.payslip.qr_load_error', 'Lỗi tải QR')}</Typography>
                                    )}
                                </Box>
                                {!qrModalLoading && qrModalImage && (
                                    <Box 
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            backgroundColor: (theme) => theme.palette.mode === 'light' ? '#e8f5e9' : 'rgba(46, 125, 50, 0.2)',
                                            color: (theme) => theme.palette.mode === 'light' ? '#2e7d32' : '#81c784',
                                            borderRadius: '16px',
                                            p: '4px 16px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                                        {t('salary.payslip.qr_ready', 'Sẵn sàng quét')}
                                    </Box>
                                )}
                            </Grid>
                        </Grid>

                        {/* Warning block */}
                        <Box 
                            sx={{
                                mt: 3,
                                p: 1.5,
                                borderRadius: '4px',
                                border: '1px solid #ffe0b2',
                                backgroundColor: '#fff8e1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <InfoIcon sx={{ color: '#f57c00', fontSize: '18px' }} />
                            <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                                {t('salary.payslip.transfer_warning', 'Vui lòng kiểm tra kỹ thông tin chuyển khoản trước khi giao dịch.')}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Popup>
        </>
    );
};

export default PayslipDetailDialog;
