import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    IconButton, 
    Paper, 
    Tooltip, 
    Box, 
    Typography,
    Button,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import TextField from '../../components/ui/TextField';
import DateTimePicker from '../../components/ui/DateTimePicker';
import Popup from '../../components/ui/Popup';
import { getActiveFilterCount } from '../../LocalFunction';
import usePeriodStore from '../../store/usePeriodStore';
import { format } from 'date-fns';

const SalaryPeriodPage = () => {
    const navigate = useNavigate();
    const {
        periods,
        loading,
        totalElements,
        page,
        setPage,
        pageSize,
        setPageSize,
        keyword,
        setKeyword,
        filterMonth,
        setFilterMonth,
        filterYear,
        setFilterYear,
        loadPeriods,
        addPeriod,
        modifyPeriod,
        removePeriod
    } = usePeriodStore();

    const [saving, setSaving] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    // Filter Options
    const monthOptions = useMemo(() => [
        { value: '', name: 'Tất cả' },
        ...Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            name: `Tháng ${(i + 1).toString().padStart(2, '0')}`
        }))
    ], []);

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [
            { value: '', name: 'Tất cả' },
            ...Array.from({ length: 5 }, (_, i) => ({
                value: currentYear - 2 + i,
                name: `Năm ${currentYear - 2 + i}`
            }))
        ];
    }, []);

    const monthFormOptions = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            name: `Tháng ${(i + 1).toString().padStart(2, '0')}`
        })), []);

    const yearFormOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => ({
            value: currentYear - 2 + i,
            name: `Năm ${currentYear - 2 + i}`
        }));
    }, []);

    const activeFilterCount = useMemo(() => {
        return getActiveFilterCount({ month: filterMonth, year: filterYear });
    }, [filterMonth, filterYear]);

    useEffect(() => {
        loadPeriods();
    }, [keyword, filterMonth, filterYear, page, pageSize]);

    // Filter formik
    const filterFormik = useFormik({
        initialValues: { month: filterMonth, year: filterYear },
        enableReinitialize: true,
        onSubmit: (values) => {
            setFilterMonth(values.month);
            setFilterYear(values.year);
        },
    });

    const handleSearch = () => {
        setKeyword(searchDraft);
        if (filterOpen) filterFormik.handleSubmit();
    };

    const handleApplyFilters = () => {
        setKeyword(searchDraft);
        filterFormik.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        setKeyword('');
        filterFormik.resetForm({ values: { month: '', year: '' } });
        setFilterMonth('');
        setFilterYear('');
    };

    // Create period form
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const getWeekdayCount = (month, year) => {
        let count = 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) and not Saturday (6)
                count++;
            }
        }
        return count || 26; // fallback to 26 if calculation returns 0
    };

    const buildPeriodName = (month, year) =>
        `Kỳ lương Tháng ${String(month).padStart(2, '0')}/${year}`;

    const buildPeriodCode = (month, year) =>
        `KY_LUONG_T${month}_${year}`;

    const periodFormik = useFormik({
        initialValues: {
            month: currentMonth,
            year: currentYear,
            code: buildPeriodCode(currentMonth, currentYear),
            name: buildPeriodName(currentMonth, currentYear),
            fromDate: null,
            toDate: null,
            standardWorkDays: getWeekdayCount(currentMonth, currentYear),
            description: '',
        },
        enableReinitialize: false,
        onSubmit: async (values) => {
            if (!values.name || !values.month || !values.year) {
                toast.warning('Vui lòng nhập đầy đủ thông tin kỳ tính lương');
                return;
            }
            try {
                setSaving(true);
                const fromDateStr = values.fromDate ? format(new Date(values.fromDate), 'yyyy-MM-dd') : '';
                const toDateStr = values.toDate ? format(new Date(values.toDate), 'yyyy-MM-dd') : '';
                if (isEdit) {
                    await modifyPeriod(selectedPeriod.id, values.name, values.code, values.description, values.month, values.year, fromDateStr, toDateStr, values.standardWorkDays);
                    toast.success('Cập nhật kỳ tính lương thành công');
                } else {
                    await addPeriod(values.name, values.code, values.description, values.month, values.year, fromDateStr, toDateStr, values.standardWorkDays);
                    toast.success('Tạo kỳ tính lương mới thành công');
                }
                setOpenDialog(false);
            } catch (error) {
                console.error(isEdit ? 'Failed to update period:' : 'Failed to create period:', error);
                const msg = error?.response?.data?.message || (isEdit ? 'Lỗi khi cập nhật kỳ tính lương' : 'Lỗi khi tạo kỳ tính lương mới');
                toast.error(msg);
            } finally {
                setSaving(false);
            }
        },
    });

    const handleOpenAdd = () => {
        setIsEdit(false);
        const m = currentMonth;
        const y = currentYear;
        periodFormik.resetForm({
            values: {
                month: m,
                year: y,
                code: buildPeriodCode(m, y),
                name: buildPeriodName(m, y),
                fromDate: null,
                toDate: null,
                standardWorkDays: getWeekdayCount(m, y),
                description: '',
            }
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (period) => {
        setIsEdit(true);
        setSelectedPeriod(period);
        periodFormik.resetForm({
            values: {
                month: period.month,
                year: period.year,
                code: period.code || '',
                name: period.name || '',
                fromDate: period.fromDate ? new Date(period.fromDate) : null,
                toDate: period.toDate ? new Date(period.toDate) : null,
                standardWorkDays: period.standardWorkDays || 26,
                description: period.description || '',
            }
        });
        setOpenDialog(true);
    };

    // Auto-update name, code, and standardWorkDays when month/year changes (only during creation)
    useEffect(() => {
        if (openDialog && !isEdit) {
            const m = periodFormik.values.month;
            const y = periodFormik.values.year;
            periodFormik.setFieldValue('name', buildPeriodName(m, y));
            periodFormik.setFieldValue('code', buildPeriodCode(m, y));
            periodFormik.setFieldValue('standardWorkDays', getWeekdayCount(m, y));
        }
    }, [periodFormik.values.month, periodFormik.values.year, openDialog, isEdit]);

    const handleOpenDelete = (period) => {
        setSelectedPeriod(period);
        setOpenConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedPeriod && selectedPeriod.id) {
            try {
                await removePeriod(selectedPeriod.id);
                toast.success('Xóa kỳ lương thành công');
                setOpenConfirmDelete(false);
            } catch (error) {
                console.error('Failed to delete period:', error);
                const msg = error?.response?.data?.message || 'Lỗi khi xóa kỳ lương';
                toast.error(msg);
            }
        }
    };

    const handleViewDetails = (period) => {
        navigate('/salary/payrolls', { state: { periodId: period.id } });
    };

    const columns = [
        {
            title: 'Thao tác',
            align: 'center',
            width: '1%',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Tooltip title="Xem danh sách bảng lương" arrow>
                        <IconButton size="small" color="info" onClick={() => handleViewDetails(rowData)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa kỳ lương" arrow>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(rowData)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa kỳ lương" arrow>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(rowData)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        { title: 'Mã kỳ lương', field: 'code', align: 'center' },
        { title: 'Kỳ tính lương', field: 'name', align: 'center' },
        { 
            title: 'Thời gian', 
            align: 'center',
            render: (row) => `Tháng ${row.month.toString().padStart(2, '0')}/${row.year}` 
        },
        { 
            title: 'Từ ngày', 
            align: 'center',
            render: (row) => row.fromDate ? format(new Date(row.fromDate), 'dd/MM/yyyy') : '-' 
        },
        { 
            title: 'Đến ngày', 
            align: 'center',
            render: (row) => row.toDate ? format(new Date(row.toDate), 'dd/MM/yyyy') : '-' 
        },
        { title: 'Công chuẩn', field: 'standardWorkDays', align: 'center' },
        { title: 'Mô tả', field: 'description', align: 'center' }
    ];

    const paginatedPeriods = periods;

    return (
        <div className="space-y-4">
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <Box mb={2}>
                    <Typography variant="h6" fontWeight="bold" className="text-text-primary">
                        Kỳ tính lương
                    </Typography>
                </Box>

                <FormikProvider value={filterFormik}>
                    <ListToolbar
                        searchDraft={searchDraft}
                        onSearchDraftChange={setSearchDraft}
                        onSearch={handleSearch}
                        onReset={handleReset}
                        onAdd={handleOpenAdd}
                        addLabel="Tạo kỳ lương mới"
                        searchPlaceholder="Tìm kiếm kỳ lương theo tên..."
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
                                    label="Tháng"
                                    name="month"
                                    options={monthOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <SelectInput
                                    label="Năm"
                                    name="year"
                                    options={yearOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                />
                            </Grid>
                        </Grid>
                    </FilterPanel>
                </FormikProvider>

                <Table 
                    columns={columns} 
                    data={paginatedPeriods} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>

            {/* Create/Edit Period Popup */}
            <Popup
                open={openDialog}
                onClosePopup={() => setOpenDialog(false)}
                title={isEdit ? 'Chỉnh sửa kỳ tính lương' : 'Tạo kỳ tính lương mới'}
                size="xs"
                action={
                    <>
                        <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={saving}>
                            Hủy
                        </Button>
                        <Button
                            onClick={periodFormik.handleSubmit}
                            color="primary"
                            variant="contained"
                            disabled={saving}
                        >
                            {saving ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo kỳ lương')}
                        </Button>
                    </>
                }
            >
                <FormikProvider value={periodFormik}>
                    <Box>
                        {/* Hàng 1: Tháng & Năm */}
                        <Box className="flex gap-4">
                            <Box className="flex-1">
                                <SelectInput
                                    label="Tháng"
                                    name="month"
                                    options={monthFormOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                    disabled={isEdit}
                                />
                            </Box>
                            <Box className="flex-1">
                                <SelectInput
                                    label="Năm"
                                    name="year"
                                    options={yearFormOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                    disabled={isEdit}
                                />
                            </Box>
                        </Box>

                        {/* Hàng 2: Từ ngày & Đến ngày */}
                        <Box className="flex gap-4">
                            <Box className="flex-1">
                                <DateTimePicker
                                    label="Từ ngày"
                                    name="fromDate"
                                    notValueMillisecond={true}
                                />
                            </Box>
                            <Box className="flex-1">
                                <DateTimePicker
                                    label="Đến ngày"
                                    name="toDate"
                                    notValueMillisecond={true}
                                />
                            </Box>
                        </Box>

                        {/* Hàng 3: Công chuẩn & Mã kỳ lương */}
                        <Box className="flex gap-4">
                            <Box className="flex-1">
                                <TextField
                                    label="Số ngày công chuẩn"
                                    name="standardWorkDays"
                                    type="number"
                                    required
                                />
                            </Box>
                            <Box className="flex-1">
                                <TextField
                                    label="Mã kỳ lương"
                                    name="code"
                                    placeholder="Hệ thống tự sinh nếu để trống"
                                />
                            </Box>
                        </Box>

                        {/* Hàng 4: Tên kỳ tính lương */}
                        <TextField
                            label="Tên kỳ tính lương"
                            name="name"
                            required
                        />

                        {/* Hàng 5: Mô tả */}
                        <TextField
                            label="Mô tả"
                            name="description"
                            multiline
                            rows={3}
                        />
                    </Box>
                </FormikProvider>
            </Popup>

            {/* Confirm Delete */}
            <ConfirmationDialog
                open={openConfirmDelete}
                onConfirmDialogClose={() => setOpenConfirmDelete(false)}
                onYesClick={handleConfirmDelete}
                title="Xác nhận xóa kỳ tính lương"
                text={`Bạn có chắc chắn muốn xóa "${selectedPeriod?.name}"? Mọi dữ liệu lương đã tính của kỳ này cũng sẽ bị xóa bỏ hoàn toàn.`}
                agree="Xác nhận xóa"
                cancel="Hủy bỏ"
            />
        </div>
    );
};

export default SalaryPeriodPage;
