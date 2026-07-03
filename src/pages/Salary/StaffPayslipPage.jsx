import React, { useEffect, useState, useMemo } from 'react';
import { 
    Paper, 
    Box, 
    Typography,
    Grid,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'sonner';
import { Formik, FormikProvider } from 'formik';

import usePayrollStore from '../../store/usePayrollStore';
import usePeriodStore from '../../store/usePeriodStore';
import SelectInput from '../../components/ui/SelectInput';
import Loading from '../../components/ui/Loading';
import Table from '../../components/ui/Table';
import PayslipDetailDialog from './components/PayslipDetailDialog';

const StaffPayslipPage = () => {
    const {
        allPeriods,
        loading: fetchingPeriods,
        loadAllPeriods
    } = usePeriodStore();

    const {
        myPayslip: payslip,
        loading,
        loadMyPayslip
    } = usePayrollStore();

    const [selectedPeriodId, setSelectedPeriodId] = useState('');
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const periods = useMemo(() => {
        if (!allPeriods) return [];
        return [...allPeriods].sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
    }, [allPeriods]);

    // Fetch periods for the dropdown
    useEffect(() => {
        loadAllPeriods();
    }, []);

    // Set default selectedPeriodId when periods are loaded
    useEffect(() => {
        if (periods.length > 0 && !selectedPeriodId) {
            setSelectedPeriodId(periods[0].id);
        }
    }, [periods, selectedPeriodId]);

    // Fetch payslip when period changes
    useEffect(() => {
        const loadPayslip = async () => {
            if (!selectedPeriodId) return;
            try {
                await loadMyPayslip(selectedPeriodId);
            } catch (error) {
                console.error('Failed to load payslip:', error);
                toast.info('Chưa có dữ liệu phiếu lương cho kỳ này');
            }
        };
        loadPayslip();
    }, [selectedPeriodId]);

    const handleOpenDetail = (row) => {
        setSelectedDetail(row);
        setOpenDetailDialog(true);
    };

    const formatMoney = (val) => {
        if (val === undefined || val === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const activePeriod = periods.find(p => p.id === selectedPeriodId);

    const columns = [
        {
            title: 'Thao tác',
            align: 'center',
            width: '1%',
            render: (row) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Tooltip title="Xem chi tiết phiếu lương" arrow>
                        <IconButton size="small" color="primary" onClick={() => handleOpenDetail(row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: 'Kỳ lương',
            align: 'center',
            render: (row) => <span>{row.payroll?.period?.name || activePeriod?.name || ''}</span>
        },
        {
            title: 'Mã NV',
            align: 'center',
            render: (row) => <span>{row.staff?.staffCode || ''}</span>
        },
        {
            title: 'Họ và tên',
            align: 'center',
            render: (row) => <span className='whitespace-nowrap'>{row.staff?.displayName || ''}</span>
        },
        {
            title: 'Phòng ban',
            align: 'center',
            render: (row) => <span className='whitespace-nowrap'>{row.staff?.departmentName || row.staff?.department?.name || '---'}</span>
        },
        {
            title: 'Vị trí',
            align: 'center',
            render: (row) => <span className='whitespace-nowrap'>{row.staff?.positionName || row.staff?.position?.name || '---'}</span>
        },
        {
            title: 'Số ngày công',
            align: 'center',
            render: (row) => <span>{row.totalWorkDays}</span>
        },
        {
            title: 'Giờ OT',
            align: 'center',
            render: (row) => <span>{row.totalOtHours}</span>
        },
        {
            title: 'Tổng thu nhập',
            align: 'center',
            render: (row) => <span>{formatMoney(row.totalIncome)}</span>
        },
        {
            title: 'Tổng khấu trừ',
            align: 'center',
            render: (row) => <span>{formatMoney(row.totalDeduction)}</span>
        },
        {
            title: 'Thực nhận (Net)',
            align: 'center',
            render: (row) => <span className="font-semibold text-emerald-600">{formatMoney(row.netSalary)}</span>
        },
        {
            title: 'Trạng thái',
            align: 'center',
            render: (row) => (
                <span>
                    {row.paidStatus === 'PAID' ? (
                        <span className="text-emerald-600 font-semibold">Đã chi trả</span>
                    ) : (
                        <span className="text-amber-600 font-semibold">Chưa chi trả</span>
                    )}
                </span>
            )
        }
    ];

    return (
        <Paper elevation={0} className="p-6 border border-border space-y-6">
            {/* Header selection section */}
            <Box className="max-w-xs">
                <Formik
                    initialValues={{ periodId: selectedPeriodId }}
                    enableReinitialize
                    onSubmit={() => {}}
                >
                    {(formikProps) => (
                        <FormikProvider value={formikProps}>
                            <SelectInput
                                label="Chọn kỳ lương"
                                name="periodId"
                                options={periods}
                                keyValue="id"
                                displayvalue="name"
                                hideNullOption={true}
                                disabled={fetchingPeriods}
                                handleChange={(e, val) => {
                                    setSelectedPeriodId(val);
                                }}
                            />
                        </FormikProvider>
                    )}
                </Formik>
            </Box>

            <Divider />

            {loading ? (
                <Loading size={50} overlay={false} />
            ) : payslip ? (
                <>
                    <Table
                        columns={columns}
                        data={[payslip]}
                        totalElements={1}
                        page={1}
                        pageSize={10}
                        handleChangePage={() => {}}
                        setRowsPerPage={() => {}}
                        nonePagination={true}
                    />

                    {/* Payslip Detail Popup */}
                    <PayslipDetailDialog
                        open={openDetailDialog}
                        onClose={() => setOpenDetailDialog(false)}
                        detail={selectedDetail}
                        activePayroll={payslip?.payroll}
                        isAdmin={false}
                    />
                </>
            ) : (
                <Box className="text-center py-8 text-text-secondary">
                    <Typography variant="body1" className="italic">
                        Chưa có dữ liệu phiếu lương của bạn cho kỳ lương "{activePeriod?.name || 'được chọn'}".
                    </Typography>
                    <Typography variant="caption" color="text.secondary" className="block mt-2">
                        Có thể bảng lương chưa được tính toán hoặc bạn chưa có thông tin làm việc được ghi nhận trong kỳ này.
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default StaffPayslipPage;
