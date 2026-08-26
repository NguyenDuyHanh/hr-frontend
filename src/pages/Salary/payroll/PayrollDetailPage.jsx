import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    TextField
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import UndoIcon from '@mui/icons-material/Undo';
import { toast } from 'sonner';
import { Formik } from 'formik';

import Table from '../../../components/ui/Table';
import ListToolbar from '../../../components/ui/ListToolbar';
import FilterPanel from '../../../components/ui/FilterPanel';
import SelectInput from '../../../components/ui/SelectInput';
import Autocomplete from '../../../components/ui/Autocomplete';
import { useDepartmentsQuery } from '../../Department/api/queries';
import { usePositionsQuery } from '../../Position/api/queries';
import { getActiveFilterCount } from '../../../LocalFunction';
import usePayrollStore from '../../../store/usePayrollStore';
import { SalaryItemType } from '../../../constants';
import PayslipDetailDialog from './components/PayslipDetailDialog';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';

const PayrollDetailPage = () => {
    const { t } = useTranslation();
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
        unconfirmPayroll: storeUnconfirmPayroll,
        deletePayroll: storeDeletePayroll
    } = usePayrollStore();

    // Local states
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Confirm dialogs states
    const [openConfirmPayroll, setOpenConfirmPayroll] = useState(false);
    const [openUnconfirmPayroll, setOpenUnconfirmPayroll] = useState(false);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    // TanStack Queries
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: positions = [] } = usePositionsQuery();

    // Search, Filter & Pagination
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDraft, setSearchDraft] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [filterPaidStatus, setFilterPaidStatus] = useState('');
    const formikRef = useRef();

    useEffect(() => {
        loadAllPayrolls();
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
            toast.warning(t('salary.payroll.warning_confirmed_cannot_recalc', 'Bảng lương này đã được xác nhận. Không thể tính toán lại!'));
            return;
        }
        try {
            toast.info(t('salary.payroll.recalculating_info', 'Đang chạy lại tính toán lương...'));
            await recalculatePayroll(payrollId);
            toast.success(t('salary.payroll.recalculate_success', 'Tính toán lại lương thành công!'));
        } catch (error) {
            console.error('Failed to recalculate:', error);
            toast.error(t('salary.payroll.recalculate_error', 'Không thể tính toán lại lương'));
        }
    };

    const handleConfirmPayroll = () => {
        if (!payrollId) return;
        setOpenConfirmPayroll(true);
    };

    const handleConfirmPayrollSubmit = async () => {
        try {
            await storeConfirmPayroll(payrollId);
            toast.success(t('salary.payroll.confirm_success', 'Đã xác nhận bảng lương thành công!'));
        } catch (error) {
            console.error('Failed to confirm payroll:', error);
            toast.error(t('salary.payroll.confirm_error', 'Không thể xác nhận bảng lương'));
        }
    };

    const handleUnconfirmPayroll = () => {
        if (!payrollId) return;
        setOpenUnconfirmPayroll(true);
    };

    const handleUnconfirmPayrollSubmit = async () => {
        try {
            await storeUnconfirmPayroll(payrollId);
            toast.success(t('salary.payroll.unconfirm_success', 'Hủy xác nhận bảng lương thành công!'));
        } catch (error) {
            console.error('Failed to unconfirm payroll:', error);
            toast.error(t('salary.payroll.unconfirm_error', 'Không thể hủy xác nhận bảng lương'));
        }
    };

    const handleDeletePayroll = () => {
        if (!payrollId) return;
        if (activePayroll && activePayroll.status !== 'DRAFT') {
            toast.warning(t('salary.payroll.delete_warning_confirmed', 'Không thể xóa bảng lương đã xác nhận!'));
            return;
        }
        setOpenConfirmDelete(true);
    };

    const handleDeletePayrollSubmit = async () => {
        try {
            await storeDeletePayroll(payrollId);
            toast.success(t('salary.payroll.delete_success', 'Xóa bảng lương thành công!'));
            navigate('/salary/payrolls');
        } catch (error) {
            console.error('Failed to delete payroll:', error);
            toast.error(error.response?.data?.message || t('salary.payroll.delete_error', 'Không thể xóa bảng lương'));
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

            const posName = row.staff?.positionName || row.staff?.position?.name;
            const matchesPos = !filterPosition || posName === filterPosition;

            const matchesPaidStatus = !filterPaidStatus || row.paidStatus === filterPaidStatus;

            return matchesKeyword && matchesDept && matchesPos && matchesPaidStatus;
        });
    }, [payrollStaffs, searchKeyword, filterDepartment, filterPosition, filterPaidStatus]);

    const departmentOptions = useMemo(() => [
        { value: '', name: t('common.all', 'Tất cả') },
        ...departments.map(d => ({ value: d.name, name: d.name }))
    ], [departments, t]);

    const positionOptions = useMemo(() => [
        { value: '', name: t('common.all', 'Tất cả') },
        ...positions.map(p => ({ value: p.name, name: p.name }))
    ], [positions, t]);

    const paidStatusOptions = [
        { value: '', name: t('common.all', 'Tất cả') },
        { value: 'PAID', name: t('salary.payroll.paid_status.paid', 'Đã chi trả') },
        { value: 'UNPAID', name: t('salary.payroll.paid_status.unpaid', 'Chưa chi trả') }
    ];

    const activeFilterCount = useMemo(() =>
        getActiveFilterCount({ 
            department: filterDepartment,
            position: filterPosition,
            paidStatus: filterPaidStatus
        }),
        [filterDepartment, filterPosition, filterPaidStatus]
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
        formikRef.current?.resetForm({ 
            values: { 
                department: '',
                position: '',
                paidStatus: ''
            } 
        });
        setFilterDepartment('');
        setFilterPosition('');
        setFilterPaidStatus('');
    };

    // ── Columns ───────────────────────────────────────────────────────────────

    const detailColumns = [
        {
            title: t('common.actions', 'Thao tác'),
            align: 'center',
            width: '1%',
            render: (row) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Tooltip title={t('salary.payroll.view_employee_payslip_tooltip', 'Xem chi tiết phiếu lương nhân viên')} arrow>
                        <IconButton size="small" color="primary" onClick={() => handleOpenDetail(row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: t('staff.code_short', 'Mã NV'),
            align: 'center',
            render: (row) => <span>{row.staff?.staffCode || ''}</span>
        },
        {
            title: t('staff.full_name', 'Họ và tên'),
            align: 'center',
            render: (row) => <span className='whitespace-nowrap'>{row.staff?.displayName || ''}</span>
        },
        {
            title: t('department.name', 'Phòng ban'),
            align: 'center',
            render: (row) => <span className='whitespace-nowrap'>{row.staff?.departmentName || row.staff?.department?.name || '---'}</span>
        },
        {
            title: t('position.name', 'Vị trí'),
            align: 'center',
            render: (row) => <span className='whitespace-nowrap'>{row.staff?.positionName || row.staff?.position?.name || '---'}</span>
        },
        {
            title: t('salary.payroll.total_work_days', 'Số ngày công'),
            field: 'totalWorkDays',
            align: 'center',
            render: (row) => <span>{row.totalWorkDays}</span>
        },
        {
            title: t('salary.payroll.total_ot_hours', 'Giờ OT'),
            field: 'totalOtHours',
            align: 'center',
            render: (row) => <span>{row.totalOtHours}</span>
        },
        {
            title: t('salary.payroll.total_income', 'Tổng thu nhập'),
            field: 'totalIncome',
            align: 'center',
            render: (row) => <span>{formatMoney(row.totalIncome)}</span>
        },
        {
            title: t('salary.payroll.total_deduction', 'Tổng khấu trừ'),
            field: 'totalDeduction',
            align: 'center',
            render: (row) => <span>{formatMoney(row.totalDeduction)}</span>
        },
        {
            title: t('salary.payroll.net_salary', 'Thực nhận (Net)'),
            field: 'netSalary',
            align: 'center',
            render: (row) => <span>{formatMoney(row.netSalary)}</span>
        },
        {
            title: t('salary.payroll.paid_status_label', 'Trạng thái chi trả'),
            align: 'center',
            render: (row) => (
                row.paidStatus === 'PAID' ? (
                    <span className="text-emerald-600 font-semibold">{t('salary.payroll.paid_status.paid', 'Đã chi trả')}</span>
                ) : (
                    <span className="text-amber-600 font-semibold">{t('salary.payroll.paid_status.unpaid', 'Chưa chi trả')}</span>
                )
            )
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
                        {t('salary.payroll.recalculate_btn', 'Tính toán lại')}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={handleConfirmPayroll}
                        disabled={calculating || loading || confirming || deleting}
                        size="small"
                        className="normal-case font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {t('common.confirm', 'Xác nhận')}
                    </Button>
                </>
            )}
            {activePayroll?.status === 'CONFIRMED' && (
                <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<UndoIcon />}
                    onClick={handleUnconfirmPayroll}
                    disabled={calculating || loading || confirming || deleting}
                    size="small"
                    className="normal-case font-medium"
                >
                    {t('salary.payroll.unconfirm_btn', 'Hủy xác nhận')}
                </Button>
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
                            {t('salary.payroll.detail_title', 'Chi tiết Bảng lương: {{name}}', { name: activePayroll?.name })}
                        </Typography>
                    </Box>
                </Box>

                {/* Toolbar + Table */}
                <Formik
                    innerRef={formikRef}
                    initialValues={{ 
                        department: filterDepartment,
                        position: filterPosition,
                        paidStatus: filterPaidStatus
                    }}
                    enableReinitialize
                    onSubmit={(values) => {
                        setFilterDepartment(values.department);
                        setFilterPosition(values.position);
                        setFilterPaidStatus(values.paidStatus);
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <>
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                searchPlaceholder={t('salary.payroll.search_placeholder_detail', 'Tìm theo tên, mã nhân viên...')}
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
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            label={t('department.name', 'Phòng ban')}
                                            name="department"
                                            options={departments}
                                            getOptionLabel={(option) => option?.name || ''}
                                            onChange={(event, val) => {
                                                setFieldValue('department', val);
                                                setFieldValue('position', null);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            label={t('position.name', 'Vị trí')}
                                            name="position"
                                            options={
                                                values.department?.id
                                                    ? positions.filter(pos => pos.department?.id === values.department.id || pos.departmentId === values.department.id)
                                                    : positions
                                            }
                                            getOptionLabel={(option) => option?.name || ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <SelectInput
                                            label={t('salary.payroll.paid_status_label', 'Trạng thái chi trả')}
                                            name="paidStatus"
                                            options={paidStatusOptions}
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
                                page={1}
                                pageSize={100}
                                handleChangePage={() => {}}
                                setRowsPerPage={() => {}}
                                nonePagination={true}
                                loading={loading || calculating || confirming || deleting}
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

            {/* Confirm Actions */}
            <ConfirmationDialog
                open={openConfirmPayroll}
                onConfirmDialogClose={() => setOpenConfirmPayroll(false)}
                onYesClick={handleConfirmPayrollSubmit}
                title={t('salary.payroll.confirm_title', 'Xác nhận bảng lương')}
                text={t('salary.payroll.confirm_text', 'Bạn có chắc chắn muốn xác nhận bảng lương "{{name}}"? Sau khi xác nhận sẽ không thể tính toán lại.', { name: activePayroll?.name })}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />

            {/* Unconfirm Dialog */}
            <ConfirmationDialog
                open={openUnconfirmPayroll}
                onConfirmDialogClose={() => setOpenUnconfirmPayroll(false)}
                onYesClick={handleUnconfirmPayrollSubmit}
                title={t('salary.payroll.unconfirm_title', 'Hủy xác nhận bảng lương')}
                text={t('salary.payroll.unconfirm_text', 'Bạn có chắc chắn muốn hủy xác nhận bảng lương "{{name}}"? Trạng thái sẽ được chuyển lại thành Nháp.', { name: activePayroll?.name })}
                agree={t('common.unconfirm_confirm_btn', 'Xác nhận hủy')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />

            {/* Delete Dialog */}
            <ConfirmationDialog
                open={openConfirmDelete}
                onConfirmDialogClose={() => setOpenConfirmDelete(false)}
                onYesClick={handleDeletePayrollSubmit}
                title={t('salary.payroll.delete_confirm_title', 'Xóa bảng lương')}
                text={t('salary.payroll.delete_confirm_text', 'Bạn có chắc chắn muốn xóa bảng lương "{{name}}" và toàn bộ phiếu lương liên quan?', { name: activePayroll?.name })}
                agree={t('common.delete_confirm_btn', 'Xác nhận xóa')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </div>
    );
};

export default PayrollDetailPage;
