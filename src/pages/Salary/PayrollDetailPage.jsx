import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Paper,
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    Select,
    MenuItem,
    TextField,
    CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import { toast } from 'sonner';
import { Formik } from 'formik';

import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import { getActiveFilterCount } from '../../LocalFunction';
import { getDepartments } from '../../services/StaffService';
import usePayrollStore from '../../store/usePayrollStore';
import { SalaryItemType } from '../../constants';
import PayslipDetailDialog from './components/PayslipDetailDialog';

const PayrollDetailPage = () => {
    const { id: payrollId } = useParams();
    const navigate = useNavigate();

    // Store states and actions
    const {
        allPayrolls,
        payrollStaffs,
        loading,
        calculating,
        confirming,
        deleting,
        loadAllPayrolls,
        loadPayrollDetails,
        recalculatePayroll,
        confirmPayroll: storeConfirmPayroll,
        deletePayroll: storeDeletePayroll
    } = usePayrollStore();

    // Local states
    const [departments, setDepartments] = useState([]);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Search, Filter & Pagination
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDraft, setSearchDraft] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterDepartment, setFilterDepartment] = useState('');
    const formikRef = useRef();

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await getDepartments();
                setDepartments(response?.data || []);
            } catch (error) {
                console.error('Failed to load departments:', error);
            }
        };
        loadAllPayrolls();
        loadDepartments();
    }, []);

    useEffect(() => {
        loadPayrollDetails(payrollId);
    }, [payrollId]);

    const activePayroll = useMemo(
        () => allPayrolls.find(p => p.id === payrollId),
        [allPayrolls, payrollId]
    );

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleRecalculate = async () => {
        if (!payrollId) return;
        if (activePayroll && activePayroll.status !== 'DRAFT') {
            toast.warning('Bảng lương này đã được khóa. Không thể tính toán lại!');
            return;
        }
        try {
            toast.info('Đang chạy lại tính toán lương...');
            await recalculatePayroll(payrollId);
            toast.success('Tính toán lại lương thành công!');
        } catch (error) {
            console.error('Failed to recalculate:', error);
            toast.error('Không thể tính toán lại lương');
        }
    };

    const handleConfirmPayroll = async () => {
        if (!payrollId) return;
        if (!window.confirm('Bạn có chắc chắn muốn duyệt và khóa bảng lương này? Sau khi khóa sẽ không thể tính toán lại.')) return;
        try {
            await storeConfirmPayroll(payrollId);
            toast.success('Đã duyệt và khóa bảng lương thành công!');
        } catch (error) {
            console.error('Failed to confirm payroll:', error);
            toast.error('Không thể khóa bảng lương');
        }
    };

    const handleDeletePayroll = async () => {
        if (!payrollId) return;
        if (activePayroll && activePayroll.status !== 'DRAFT') {
            toast.warning('Không thể xóa bảng lương đã khóa!');
            return;
        }
        if (!window.confirm('Bạn có chắc chắn muốn xóa bảng lương này và toàn bộ phiếu lương liên quan?')) return;
        try {
            await storeDeletePayroll(payrollId);
            toast.success('Xóa bảng lương thành công!');
            navigate('/salary/payrolls');
        } catch (error) {
            console.error('Failed to delete payroll:', error);
            toast.error('Không thể xóa bảng lương');
        }
    };

    const handleOpenDetail = (row) => {
        console.log('Selected Payslip Detail:', row);
        setSelectedDetail(row);
        setOpenDetailDialog(true);
    };

    const handlePayslipUpdateSuccess = (payslipId, paidStatus, note) => {
        setSelectedDetail(prev => prev && prev.id === payslipId ? { ...prev, paidStatus, note } : prev);
    };

    const formatMoney = (val) => {
        if (val === undefined || val === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    // ── Filtering ─────────────────────────────────────────────────────────────

    const filteredStaffs = useMemo(() => {
        return payrollStaffs.filter(row => {
            const matchesKeyword = !searchKeyword ||
                row.staff?.displayName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                row.staff?.staffCode?.toLowerCase().includes(searchKeyword.toLowerCase());
            const deptName = row.staff?.departmentName || row.staff?.department?.name;
            const matchesDept = !filterDepartment || deptName === filterDepartment;
            return matchesKeyword && matchesDept;
        });
    }, [payrollStaffs, searchKeyword, filterDepartment]);

    const departmentOptions = useMemo(() => [
        { value: '', name: 'Tất cả' },
        ...departments.map(d => ({ value: d.name, name: d.name }))
    ], [departments]);

    const activeFilterCount = useMemo(() =>
        getActiveFilterCount({ department: filterDepartment }),
        [filterDepartment]
    );

    const handleSearch = () => {
        setSearchKeyword(searchDraft);
        if (filterOpen) formikRef.current?.handleSubmit();
    };

    const handleApplyFilters = () => {
        setSearchKeyword(searchDraft);
        formikRef.current?.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        setSearchKeyword('');
        formikRef.current?.resetForm({ values: { department: '' } });
        setFilterDepartment('');
    };

    // ── Columns ───────────────────────────────────────────────────────────────

    const detailColumns = [
        {
            title: 'Thao tác',
            align: 'center',
            width: '1%',
            render: (row) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Tooltip title="Xem chi tiết phiếu lương nhân viên" arrow>
                        <IconButton size="small" color="primary" onClick={() => handleOpenDetail(row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
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
            field: 'totalWorkDays',
            align: 'center',
            render: (row) => <span>{row.totalWorkDays}</span>
        },
        {
            title: 'Giờ OT',
            field: 'totalOtHours',
            align: 'center',
            render: (row) => <span>{row.totalOtHours}</span>
        },
        {
            title: 'Tổng thu nhập',
            field: 'totalIncome',
            align: 'center',
            render: (row) => <span>{formatMoney(row.totalIncome)}</span>
        },
        {
            title: 'Tổng khấu trừ',
            field: 'totalDeduction',
            align: 'center',
            render: (row) => <span>{formatMoney(row.totalDeduction)}</span>
        },
        {
            title: 'Thực nhận (Net)',
            field: 'netSalary',
            align: 'center',
            render: (row) => <span>{formatMoney(row.netSalary)}</span>
        }
    ];

    // ── Toolbar buttons ───────────────────────────────────────────────────────

    const extraButtons = (
        <Box display="flex" gap={1} alignItems="center">
            {activePayroll?.status === 'DRAFT' && (
                <>
                    <Button
                        variant="outlined"
                        color="success"
                        startIcon={<RefreshIcon />}
                        onClick={handleRecalculate}
                        disabled={calculating || loading || confirming || deleting}
                        size="small"
                        className="normal-case font-medium border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                    >
                        Tính toán lại
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<LockIcon />}
                        onClick={handleConfirmPayroll}
                        disabled={calculating || loading || confirming || deleting}
                        size="small"
                        className="normal-case font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        Duyệt & Khóa
                    </Button>
                </>
            )}
        </Box>
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4 mt-2">
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                {/* Header */}
                <Box mb={2} display="flex" alignItems="center" gap={1}>
                    <IconButton color="primary" onClick={() => navigate('/salary/payrolls')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" className="text-text-primary">
                            Chi tiết Bảng lương: {activePayroll?.name}
                        </Typography>
                    </Box>
                </Box>

                {/* Toolbar + Table */}
                <Formik
                    innerRef={formikRef}
                    initialValues={{ department: filterDepartment }}
                    enableReinitialize
                    onSubmit={(values) => setFilterDepartment(values.department)}
                >
                    {() => (
                        <>
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                searchPlaceholder="Tìm theo tên, mã nhân viên..."
                                extraButtons={extraButtons}
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: activeFilterCount
                                }}
                            />

                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <SelectInput
                                            label="Phòng ban"
                                            name="department"
                                            options={departmentOptions}
                                            keyValue="value"
                                            displayvalue="name"
                                            hideNullOption={true}
                                        />
                                    </Grid>
                                </Grid>
                            </FilterPanel>

                            <Table
                                columns={detailColumns}
                                data={filteredStaffs}
                                totalElements={filteredStaffs.length}
                                page={0}
                                pageSize={100}
                                handleChangePage={() => {}}
                                setRowsPerPage={() => {}}
                                hidePagination={true}
                            />
                        </>
                    )}
                </Formik>
            </Paper>

            {/* Payslip Detail Popup */}
            <PayslipDetailDialog
                open={openDetailDialog}
                onClose={() => setOpenDetailDialog(false)}
                detail={selectedDetail}
                activePayroll={activePayroll}
                isAdmin={true}
                onUpdateSuccess={handlePayslipUpdateSuccess}
            />
        </div>
    );
};

export default PayrollDetailPage;
