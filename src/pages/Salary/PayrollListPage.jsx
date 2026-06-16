import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import TextField from '../../components/ui/TextField';
import Popup from '../../components/ui/Popup';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import { toast } from 'sonner';
import { Formik } from 'formik';

import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import SelectInput from '../../components/ui/SelectInput';
import { PayrollStatus, PayrollStatusConfig } from '../../constants';
import usePayrollStore from '../../store/usePayrollStore';
import usePeriodStore from '../../store/usePeriodStore';

const PayrollListPage = () => {
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

    // Search
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchDraft, setSearchDraft] = useState('');

    const periods = useMemo(() => {
        if (!allPeriods) return [];
        return [...allPeriods].sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month));
    }, [allPeriods]);

    useEffect(() => {
        loadAllPeriods();
        loadAllPayrolls();
    }, []);

    // Listen to location state changes
    useEffect(() => {
        if (location.state?.periodId) setSelectedPeriodId(location.state.periodId);
    }, [location.state]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleConfirmPayroll = async (payrollId) => {
        if (!payrollId) return;
        if (!window.confirm('Bạn có chắc chắn muốn duyệt và khóa bảng lương này? Sau khi khóa sẽ không thể tính toán lại.')) return;
        try {
            await confirmPayroll(payrollId);
            toast.success('Đã duyệt và khóa bảng lương thành công!');
        } catch (error) {
            console.error('Failed to confirm payroll:', error);
            toast.error('Không thể khóa bảng lương');
        }
    };

    const handleDeletePayroll = async (payrollId) => {
        if (!payrollId) return;
        const payrollObj = allPayrolls.find(p => p.id === payrollId);
        if (payrollObj && payrollObj.status !== 'DRAFT') {
            toast.warning('Không thể xóa bảng lương đã khóa!');
            return;
        }
        if (!window.confirm('Bạn có chắc chắn muốn xóa bảng lương này và toàn bộ phiếu lương liên quan?')) return;
        try {
            await deletePayroll(payrollId);
            toast.success('Xóa bảng lương thành công!');
            await loadAllPayrolls();
        } catch (error) {
            console.error('Failed to delete payroll:', error);
            toast.error('Không thể xóa bảng lương');
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────────

    const filteredPayrolls = useMemo(() => {
        return allPayrolls.filter(p => {
            const matchesPeriod = !selectedPeriodId || p.payrollPeriod?.id === selectedPeriodId;
            const matchesKeyword = !searchKeyword ||
                p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                (p.code && p.code.toLowerCase().includes(searchKeyword.toLowerCase()));
            return matchesPeriod && matchesKeyword;
        });
    }, [allPayrolls, selectedPeriodId, searchKeyword]);

    const periodFilterOptions = useMemo(() => [
        { value: '', name: 'Tất cả kỳ lương' },
        ...periods.map(p => ({ value: p.id, name: p.name }))
    ], [periods]);

    const formatMoney = (val) => {
        if (val === undefined || val === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    // ── Columns ───────────────────────────────────────────────────────────────

    const masterColumns = [
        {
            title: 'Thao tác',
            align: 'center',
            width: '1%',
            render: (row) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Tooltip title="Xem chi tiết phiếu lương" arrow>
                        <IconButton size="small" color="primary" onClick={() => navigate(`/salary/payrolls/${row.id}`)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {row.status === 'DRAFT' && (
                        <>
                            <Tooltip title="Duyệt & Khóa bảng lương" arrow>
                                <IconButton size="small" color="success" onClick={() => handleConfirmPayroll(row.id)}>
                                    <LockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa bảng lương" arrow>
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
            title: 'Tên bảng lương',
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
            title: 'Mã bảng lương',
            field: 'code',
            align: 'center',
            render: (row) => <span>{row.code || '---'}</span>
        },
        {
            title: 'Mô tả',
            field: 'description',
            align: 'center',
            render: (row) => <span>{row.description || '---'}</span>
        },
        {
            title: 'Kỳ tính lương',
            align: 'center',
            render: (row) => <span>{row.payrollPeriod?.name || '---'}</span>
        },
        {
            title: 'Trạng thái',
            align: 'center',
            render: (row) => {
                const cfg = PayrollStatusConfig[row.status] ?? PayrollStatusConfig[PayrollStatus.DRAFT];
                return <span>{cfg.label}</span>;
            }
        }
    ];

    // ── Toolbar controls ──────────────────────────────────────────────────────

    const searchExtraControls = (
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
                <InputLabel id="select-period-filter-label">Chọn kỳ lương</InputLabel>
                <Select
                    labelId="select-period-filter-label"
                    value={selectedPeriodId}
                    onChange={(e) => setSelectedPeriodId(e.target.value)}
                    label="Chọn kỳ lương"
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
                    searchPlaceholder="Tìm theo tên hoặc mã bảng lương..."
                    searchExtraControls={searchExtraControls}
                    onAdd={() => setOpenNewPayrollDialog(true)}
                    addLabel="Tạo bảng lương mới"
                />

                <Table
                    columns={masterColumns}
                    data={filteredPayrolls}
                    totalElements={filteredPayrolls.length}
                    page={0}
                    pageSize={100}
                    handleChangePage={() => {}}
                    setRowsPerPage={() => {}}
                    hidePagination={true}
                    loading={loading || confirming || deleting}
                />
            </Paper>

            {/* Create New Payroll Popup */}
            <Popup
                open={openNewPayrollDialog}
                onClosePopup={() => setOpenNewPayrollDialog(false)}
                title="Tạo bảng lương mới"
                size="xs"
                action={
                    <>
                        <Button onClick={() => setOpenNewPayrollDialog(false)} color="inherit" disabled={savingPayroll}>
                            Hủy
                        </Button>
                        <Button
                            onClick={() => createFormikRef.current?.handleSubmit()}
                            color="primary"
                            variant="contained"
                            disabled={savingPayroll}
                        >
                            {savingPayroll ? 'Đang tạo...' : 'Tạo & Tính toán'}
                        </Button>
                    </>
                }
            >
                <Formik
                    innerRef={createFormikRef}
                    initialValues={{ periodId: '', name: '', code: '', description: '' }}
                    onSubmit={async (values) => {
                        if (!values.periodId) {
                            toast.warning('Vui lòng chọn kỳ tính lương');
                            return;
                        }
                        if (!values.name.trim()) {
                            toast.warning('Vui lòng nhập tên bảng lương');
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
                                toast.success('Tạo bảng lương mới thành công!');
                                const newPayroll = response.data.data || response.data;
                                navigate(`/salary/payrolls/${newPayroll.id}`);
                                setOpenNewPayrollDialog(false);
                            }
                        } catch (error) {
                            console.error('Failed to create payroll:', error);
                            toast.error('Không thể tạo bảng lương mới');
                        }
                    }}
                >
                    {() => (
                        <Box>
                            <Typography variant="body2" color="text.secondary" className="mb-3">
                                Tạo bảng lương mới và tự động tính toán phiếu lương cho toàn bộ nhân viên.
                            </Typography>

                            <SelectInput
                                name="periodId"
                                label="Chọn kỳ lương"
                                options={periods}
                                keyValue="id"
                                displayvalue="name"
                                hideNullOption={true}
                                required
                                handleChange={(e, value) => {
                                    const selectedPer = periods.find(p => p.id === value);
                                    if (selectedPer) {
                                        const formattedMonth = String(selectedPer.month).padStart(2, '0');
                                        createFormikRef.current?.setFieldValue('name', `Bảng lương Kỳ lương Tháng ${formattedMonth}/${selectedPer.year}`);
                                        createFormikRef.current?.setFieldValue('code', `BANG_LUONG_${formattedMonth}${selectedPer.year}`);
                                    }
                                }}
                            />

                            <TextField
                                name="name"
                                label="Tên bảng lương"
                                placeholder="Nhập tên bảng lương..."
                                required
                            />

                            <TextField
                                name="code"
                                label="Mã bảng lương"
                                placeholder="Ví dụ: BANG_LUONG_032026..."
                            />

                            <TextField
                                name="description"
                                label="Mô tả"
                                placeholder="Nhập mô tả bảng lương..."
                                multiline
                                rows={2}
                            />
                        </Box>
                    )}
                </Formik>
            </Popup>
        </div>
    );
};

export default PayrollListPage;
