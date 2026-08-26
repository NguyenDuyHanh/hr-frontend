import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Paper,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import TextField from '../../../components/ui/TextField';
import Popup from '../../../components/ui/Popup';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { toast } from 'sonner';
import { Formik } from 'formik';

import Table from '../../../components/ui/Table';
import ListToolbar from '../../../components/ui/ListToolbar';
import SelectInput from '../../../components/ui/SelectInput';
import { PayrollStatus, PayrollStatusConfig } from '../../../constants';
import usePayrollStore from '../../../store/usePayrollStore';
import usePeriodStore from '../../../store/usePeriodStore';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';

const PayrollListPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // Store states and actions
    const {
        allPeriods,
        loadAllPeriods
    } = usePeriodStore();

    const {
        allPayrolls,
        loading,
        confirming,
        deleting,
        creating: savingPayroll,
        loadAllPayrolls,
        createPayrollAction,
        confirmPayroll,
        deletePayroll
    } = usePayrollStore();

    // Local states
    const [selectedPeriodId, setSelectedPeriodId] = useState('');
    const [openNewPayrollDialog, setOpenNewPayrollDialog] = useState(false);
    const createFormikRef = useRef();

    // Confirm dialogs states
    const [openConfirmPayroll, setOpenConfirmPayroll] = useState(false);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    // Search
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDraft, setSearchDraft] = useState('');

    const periods = useMemo(() => {
        if (!allPeriods) return [];
        return [...allPeriods].sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
    }, [allPeriods]);

    useEffect(() => {
        loadAllPeriods();
    }, []);

    // Listen to location state changes
    useEffect(() => {
        if (location.state?.periodId) setSelectedPeriodId(location.state.periodId);
    }, [location.state]);

    // Load payrolls when selectedPeriodId changes
    useEffect(() => {
        loadAllPayrolls(selectedPeriodId);
    }, [selectedPeriodId]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleConfirmPayroll = (payrollId) => {
        if (!payrollId) return;
        const payrollObj = allPayrolls.find(p => p.id === payrollId);
        setSelectedPayroll(payrollObj);
        setOpenConfirmPayroll(true);
    };

    const handleConfirmPayrollSubmit = async () => {
        if (!selectedPayroll) return;
        try {
            await confirmPayroll(selectedPayroll.id);
            toast.success(t('salary.payroll.confirm_success', 'Đã xác nhận bảng lương thành công!'));
        } catch (error) {
            console.error('Failed to confirm payroll:', error);
            toast.error(t('salary.payroll.confirm_error', 'Không thể xác nhận bảng lương'));
        }
    };

    const handleDeletePayroll = (payrollId) => {
        if (!payrollId) return;
        const payrollObj = allPayrolls.find(p => p.id === payrollId);
        if (payrollObj && payrollObj.status !== 'DRAFT') {
            toast.warning(t('salary.payroll.delete_warning_confirmed', 'Không thể xóa bảng lương đã xác nhận!'));
            return;
        }
        setSelectedPayroll(payrollObj);
        setOpenConfirmDelete(true);
    };

    const handleDeletePayrollSubmit = async () => {
        if (!selectedPayroll) return;
        try {
            await deletePayroll(selectedPayroll.id);
            toast.success(t('salary.payroll.delete_success', 'Xóa bảng lương thành công!'));
            await loadAllPayrolls(selectedPeriodId);
        } catch (error) {
            console.error('Failed to delete payroll:', error);
            toast.error(error.response?.data?.message || t('salary.payroll.delete_error', 'Không thể xóa bảng lương'));
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────

    const filteredPayrolls = useMemo(() => {
        return allPayrolls.filter(p => {
            const matchesPeriod = !selectedPeriodId || p.period?.id === selectedPeriodId;
            const matchesKeyword = !searchKeyword ||
                p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                (p.code && p.code.toLowerCase().includes(searchKeyword.toLowerCase()));
            return matchesPeriod && matchesKeyword;
        });
    }, [allPayrolls, selectedPeriodId, searchKeyword]);

    const periodFilterOptions = useMemo(() => [
        { value: '', name: t('salary.payroll.all_periods', 'Tất cả kỳ lương') },
        ...periods.map(p => ({ value: p.id, name: p.name }))
    ], [periods, t]);

    const formatMoney = (val) => {
        if (val === undefined || val === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    // ── Columns ───────────────────────────────────────────────────────────────

    const masterColumns = [
        {
            title: t('common.actions', 'Thao tác'),
            align: 'center',
            width: '1%',
            render: (row) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Tooltip title={t('salary.payroll.view_details_tooltip', 'Xem chi tiết phiếu lương')} arrow>
                        <IconButton size="small" color="primary" onClick={() => navigate(`/salary/payrolls/${row.id}`)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {row.status === 'DRAFT' && (
                        <>
                            <Tooltip title={t('salary.payroll.confirm_tooltip', 'Xác nhận bảng lương')} arrow>
                                <IconButton size="small" color="success" onClick={() => handleConfirmPayroll(row.id)}>
                                    <CheckIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('salary.payroll.delete_tooltip', 'Xóa bảng lương')} arrow>
                                <IconButton size="small" color="error" onClick={() => handleDeletePayroll(row.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </div>
            ),
        },
        {
            title: t('salary.payroll.name', 'Tên bảng lương'),
            field: 'name',
            align: 'center',
            render: (row) => (
                <span
                    onClick={() => navigate(`/salary/payrolls/${row.id}`)}
                    className="cursor-pointer text-primary font-semibold hover:underline"
                >
                    {row.name}
                </span>
            )
        },
        {
            title: t('salary.payroll.code', 'Mã bảng lương'),
            field: 'code',
            align: 'center',
            render: (row) => <span>{row.code || '---'}</span>
        },
        {
            title: t('common.description', 'Mô tả'),
            field: 'description',
            align: 'center',
            render: (row) => <span>{row.description || '---'}</span>
        },
        {
            title: t('salary.period.name', 'Kỳ tính lương'),
            align: 'center',
            render: (row) => <span>{row.period?.name || '---'}</span>
        },
        {
            title: t('common.status', 'Trạng thái'),
            align: 'center',
            render: (row) => {
                const cfg = PayrollStatusConfig[row.status] ?? PayrollStatusConfig[PayrollStatus.DRAFT];
                return <span>{t('salary.payroll.status.' + row.status.toLowerCase(), cfg.label)}</span>;
            }
        }
    ];

    // ── Toolbar controls ──────────────────────────────────────────────────────

    const searchExtraControls = (
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
                <InputLabel id="select-period-filter-label">{t('salary.payroll.select_period', 'Chọn kỳ lương')}</InputLabel>
                <Select
                    labelId="select-period-filter-label"
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    label={t('salary.payroll.select_period', 'Chọn kỳ lương')}
                >
                    {periodFilterOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );

    return (
        <div className="space-y-4">
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <ListToolbar
                    searchDraft={searchDraft}
                    onSearchDraftChange={setSearchDraft}
                    onSearch={() => setSearchKeyword(searchDraft)}
                    onReset={() => {
                        setSearchDraft('');
                        setSearchKeyword('');
                        setSelectedPeriodId('');
                    }}
                    searchPlaceholder={t('salary.payroll.search_placeholder', 'Tìm theo tên hoặc mã bảng lương...')}
                    searchExtraControls={searchExtraControls}
                    onAdd={() => setOpenNewPayrollDialog(true)}
                    addLabel={t('salary.payroll.add_btn', 'Tạo bảng lương mới')}
                />

                <Table
                    columns={masterColumns}
                    data={filteredPayrolls}
                    totalElements={filteredPayrolls.length}
                    page={1}
                    pageSize={100}
                    handleChangePage={() => {}}
                    setRowsPerPage={() => {}}
                    nonePagination={true}
                    loading={loading || confirming || deleting}
                />
            </Paper>

            {/* Create New Payroll Popup */}
            <Popup
                open={openNewPayrollDialog}
                onClosePopup={() => setOpenNewPayrollDialog(false)}
                title={t('salary.payroll.create_title', 'Tạo bảng lương mới')}
                size="xs"
                action={
                    <>
                        <Button onClick={() => setOpenNewPayrollDialog(false)} color="inherit" disabled={savingPayroll}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button
                            onClick={() => createFormikRef.current?.handleSubmit()}
                            color="primary"
                            variant="contained"
                            disabled={savingPayroll}
                        >
                            {savingPayroll ? t('common.creating', 'Đang tạo...') : t('salary.payroll.create_and_calc_btn', 'Tạo & Tính toán')}
                        </Button>
                    </>
                }
            >
                <Formik
                    innerRef={createFormikRef}
                    initialValues={{ periodId: '', name: '', code: '', description: '' }}
                    onSubmit={async (values) => {
                        if (!values.periodId) {
                            toast.warning(t('salary.payroll.validation_period_required', 'Vui lòng chọn kỳ tính lương'));
                            return;
                        }
                        if (!values.name.trim()) {
                            toast.warning(t('salary.payroll.validation_name_required', 'Vui lòng nhập tên bảng lương'));
                            return;
                        }
                        try {
                            const response = await createPayrollAction(
                                values.periodId,
                                values.name.trim(),
                                values.code.trim(),
                                values.description.trim()
                            );
                            if (response?.data) {
                                toast.success(t('salary.payroll.create_success', 'Tạo bảng lương mới thành công!'));
                                const newPayroll = response.data.data || response.data;
                                navigate(`/salary/payrolls/${newPayroll.id}`);
                                setOpenNewPayrollDialog(false);
                            }
                        } catch (error) {
                            console.error('Failed to create payroll:', error);
                            toast.error(error.response?.data?.message || t('salary.payroll.create_error', 'Không thể tạo bảng lương mới'));
                        }
                    }}
                >
                    {() => (
                        <Box>
                            <Typography variant="body2" color="text.secondary" className="mb-3">
                                {t('salary.payroll.create_description', 'Tạo bảng lương mới và tự động tính toán phiếu lương cho toàn bộ nhân viên.')}
                            </Typography>

                            <SelectInput
                                name="periodId"
                                label={t('salary.payroll.select_period', 'Chọn kỳ lương')}
                                options={periods}
                                keyValue="id"
                                displayvalue="name"
                                hideNullOption={true}
                                required
                                handleChange={(e, value) => {
                                    const selectedPer = periods.find(p => p.id === value);
                                    if (selectedPer) {
                                        const formattedMonth = String(selectedPer.month).padStart(2, '0');
                                        createFormikRef.current?.setFieldValue('name', t('salary.payroll.new_payroll_name_format', 'Bảng lương Kỳ lương Tháng {{month}}/{{year}}', { month: formattedMonth, year: selectedPer.year }));
                                        createFormikRef.current?.setFieldValue('code', `BANG_LUONG_${formattedMonth}${selectedPer.year}`);
                                    }
                                }}
                            />

                            <TextField
                                name="name"
                                label={t('salary.payroll.name', 'Tên bảng lương')}
                                placeholder={t('salary.payroll.name_placeholder', 'Nhập tên bảng lương...')}
                                required
                            />

                            <TextField
                                name="code"
                                label={t('salary.payroll.code', 'Mã bảng lương')}
                                placeholder={t('salary.payroll.code_placeholder', 'Ví dụ: BANG_LUONG_032026...')}
                            />

                            <TextField
                                name="description"
                                label={t('common.description', 'Mô tả')}
                                placeholder={t('salary.payroll.description_placeholder', 'Nhập mô tả bảng lương...')}
                                multiline
                                rows={2}
                            />
                        </Box>
                    )}
                </Formik>
            </Popup>

            {/* Confirm Actions */}
            <ConfirmationDialog
                open={openConfirmPayroll}
                onConfirmDialogClose={() => {
                    setOpenConfirmPayroll(false);
                    setSelectedPayroll(null);
                }}
                onYesClick={handleConfirmPayrollSubmit}
                title={t('salary.payroll.confirm_title', 'Xác nhận bảng lương')}
                text={t('salary.payroll.confirm_text', 'Bạn có chắc chắn muốn xác nhận bảng lương "{{name}}"? Sau khi xác nhận sẽ không thể tính toán lại.', { name: selectedPayroll?.name })}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />

            <ConfirmationDialog
                open={openConfirmDelete}
                onConfirmDialogClose={() => {
                    setOpenConfirmDelete(false);
                    setSelectedPayroll(null);
                }}
                onYesClick={handleDeletePayrollSubmit}
                title={t('salary.payroll.delete_confirm_title', 'Xóa bảng lương')}
                text={t('salary.payroll.delete_confirm_text', 'Bạn có chắc chắn muốn xóa bảng lương "{{name}}" và toàn bộ phiếu lương liên quan?', { name: selectedPayroll?.name })}
                agree={t('common.delete_confirm_btn', 'Xác nhận xóa')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </div>
    );
};

export default PayrollListPage;
