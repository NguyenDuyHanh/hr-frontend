import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    IconButton,
    Paper,
    Tooltip,
    Box,
    Typography,
    Button,
    Grid,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import TextField from '../../components/ui/TextField';
import DateTimePicker from '../../components/ui/DateTimePicker';
import Popup from '../../components/ui/Popup';
import { getActiveFilterCount } from '../../LocalFunction';
import useHolidayStore from '../../store/useHolidayStore';
import { format, differenceInCalendarDays } from 'date-fns';

const HolidayPage = () => {
    const { t } = useTranslation();
    const {
        holidays,
        loading,
        totalElements,
        page,
        setPage,
        pageSize,
        setPageSize,
        keyword,
        setKeyword,
        filterYear,
        setFilterYear,
        filterFromDate,
        setFilterFromDate,
        filterToDate,
        setFilterToDate,
        loadHolidays,
        addHoliday,
        modifyHoliday,
        removeHoliday
    } = useHolidayStore();

    const [saving, setSaving] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);

    const currentYear = new Date().getFullYear();

    // Filter Options
    const yearOptions = useMemo(() => {
        return [
            { value: '', name: t('common.all', 'Tất cả') },
            ...Array.from({ length: 5 }, (_, i) => ({
                value: currentYear - 2 + i,
                name: `${t('holiday.year', 'Năm')} ${currentYear - 2 + i}`
            }))
        ];
    }, [currentYear, t]);

    const yearFormOptions = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            value: currentYear - 2 + i,
            name: `${t('holiday.year', 'Năm')} ${currentYear - 2 + i}`
        }));
    }, [currentYear, t]);

    const activeFilterCount = useMemo(() => {
        return getActiveFilterCount({ 
            year: filterYear,
            fromDate: filterFromDate,
            toDate: filterToDate
        });
    }, [filterYear, filterFromDate, filterToDate]);

    useEffect(() => {
        loadHolidays();
    }, [keyword, filterYear, filterFromDate, filterToDate, page, pageSize]);

    // Filter formik
    const filterFormik = useFormik({
        initialValues: { 
            year: filterYear,
            fromDate: filterFromDate ? new Date(filterFromDate) : null,
            toDate: filterToDate ? new Date(filterToDate) : null
        },
        enableReinitialize: true,
        onSubmit: (values) => {
            setFilterYear(values.year);
            setFilterFromDate(values.fromDate ? format(new Date(values.fromDate), 'yyyy-MM-dd') : null);
            setFilterToDate(values.toDate ? format(new Date(values.toDate), 'yyyy-MM-dd') : null);
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
        filterFormik.resetForm({ values: { year: '', fromDate: null, toDate: null } });
        setFilterYear('');
        setFilterFromDate(null);
        setFilterToDate(null);
    };

    // Holiday validation schema
    const validationSchema = Yup.object({
        code: Yup.string().trim().required(t('holiday.validation.code_required', 'Mã ngày lễ là bắt buộc')),
        name: Yup.string().trim().required(t('holiday.validation.name_required', 'Tên ngày lễ là bắt buộc')),
        year: Yup.number().required(t('holiday.validation.year_required', 'Năm là bắt buộc')),
        startDate: Yup.date().nullable().required(t('holiday.validation.start_date_required', 'Ngày bắt đầu là bắt buộc')),
        endDate: Yup.date()
            .nullable()
            .required(t('holiday.validation.end_date_required', 'Ngày kết thúc là bắt buộc'))
            .min(Yup.ref('startDate'), t('holiday.validation.end_date_min', 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu')),
    });

    // Holiday form
    const holidayFormik = useFormik({
        initialValues: {
            code: '',
            name: '',
            startDate: null,
            endDate: null,
            year: currentYear,
            description: '',
        },
        validationSchema: validationSchema,
        enableReinitialize: false,
        onSubmit: async (values) => {
            const startDate = new Date(values.startDate);
            const endDate = new Date(values.endDate);

            try {
                setSaving(true);
                const payload = {
                    code: values.code,
                    name: values.name,
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    endDate: format(endDate, 'yyyy-MM-dd'),
                    year: values.year,
                    description: values.description,
                };

                if (isEdit) {
                    await modifyHoliday(selectedHoliday.id, payload);
                    toast.success(t('holiday.update_success', 'Cập nhật ngày lễ thành công'));
                } else {
                    await addHoliday(payload);
                    toast.success(t('holiday.create_success', 'Tạo ngày lễ mới thành công'));
                }
                setOpenDialog(false);
            } catch (error) {
                console.error(isEdit ? 'Failed to update holiday:' : 'Failed to create holiday:', error);
                const msg = error?.response?.data?.message || (isEdit ? t('holiday.update_error', 'Lỗi khi cập nhật ngày lễ') : t('holiday.create_error', 'Lỗi khi tạo ngày lễ mới'));
                toast.error(msg);
            } finally {
                setSaving(false);
            }
        },
    });

    // Auto calculate totalDays display
    const calculatedTotalDays = useMemo(() => {
        const start = holidayFormik.values.startDate;
        const end = holidayFormik.values.endDate;
        if (start && end) {
            const days = differenceInCalendarDays(new Date(end), new Date(start)) + 1;
            return days > 0 ? days : 0;
        }
        return 0;
    }, [holidayFormik.values.startDate, holidayFormik.values.endDate]);

    const handleOpenAdd = () => {
        setIsEdit(false);
        holidayFormik.resetForm({
            values: {
                code: '',
                name: '',
                startDate: null,
                endDate: null,
                year: currentYear,
                description: '',
            }
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (holiday) => {
        setIsEdit(true);
        setSelectedHoliday(holiday);
        holidayFormik.resetForm({
            values: {
                code: holiday.code || '',
                name: holiday.name || '',
                startDate: holiday.startDate ? new Date(holiday.startDate) : null,
                endDate: holiday.endDate ? new Date(holiday.endDate) : null,
                year: holiday.year || currentYear,
                description: holiday.description || '',
            }
        });
        setOpenDialog(true);
    };

    const handleOpenDelete = (holiday) => {
        setSelectedHoliday(holiday);
        setOpenConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedHoliday && selectedHoliday.id) {
            try {
                await removeHoliday(selectedHoliday.id);
                toast.success(t('holiday.delete_success', 'Xóa ngày lễ thành công'));
                setOpenConfirmDelete(false);
            } catch (error) {
                console.error('Failed to delete holiday:', error);
                const msg = error?.response?.data?.message || t('holiday.delete_error', 'Lỗi khi xóa ngày lễ');
                toast.error(msg);
            }
        }
    };

    const columns = [
        {
            title: t('common.actions', 'Thao tác'),
            align: 'center',
            width: '1%',
            render: (rowData) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Tooltip title={t('holiday.edit_tooltip', 'Chỉnh sửa ngày lễ')} arrow>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(rowData)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('holiday.delete_tooltip', 'Xóa ngày lễ')} arrow>
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(rowData)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
        { title: t('holiday.code', 'Mã'), field: 'code' },
        { title: t('holiday.name', 'Tên ngày lễ'), field: 'name', align: 'left' },
        {
            title: t('holiday.start_date', 'Từ ngày'),
            align: 'center',
            render: (row) => row.startDate ? format(new Date(row.startDate), 'dd/MM/yyyy') : '-'
        },
        {
            title: t('holiday.end_date', 'Đến ngày'),
            align: 'center',
            render: (row) => row.endDate ? format(new Date(row.endDate), 'dd/MM/yyyy') : '-'
        },
        {
            title: t('holiday.total_days', 'Số ngày'),
            align: 'center',
            render: (row) => <span>{`${row.totalDays}`}</span>
        },
        { title: t('holiday.year', 'Năm'), field: 'year', align: 'center' },
        { title: t('holiday.description', 'Mô tả'), field: 'description', align: 'left' },
    ];

    return (
        <div className="space-y-4">
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <FormikProvider value={filterFormik}>
                    <ListToolbar
                        searchDraft={searchDraft}
                        onSearchDraftChange={setSearchDraft}
                        onSearch={handleSearch}
                        onReset={handleReset}
                        onAdd={handleOpenAdd}
                        addLabel={t('holiday.add', 'Thêm ngày lễ')}
                        searchPlaceholder={t('holiday.search_placeholder', 'Tìm kiếm theo tên hoặc mã ngày lễ...')}
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
                                <SelectInput
                                    label={t('holiday.year', 'Năm')}
                                    name="year"
                                    options={yearOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <DateTimePicker
                                    label={t('holiday.start_date', 'Từ ngày')}
                                    name="fromDate"
                                    notValueMillisecond={true}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <DateTimePicker
                                    label={t('holiday.end_date', 'Đến ngày')}
                                    name="toDate"
                                    notValueMillisecond={true}
                                />
                            </Grid>
                        </Grid>
                    </FilterPanel>
                </FormikProvider>

                <Table
                    columns={columns}
                    data={holidays}
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>

            {/* Create/Edit Holiday Popup */}
            <Popup
                open={openDialog}
                onClosePopup={() => setOpenDialog(false)}
                title={isEdit ? t('holiday.edit_title', 'Chỉnh sửa ngày lễ') : t('holiday.create_title', 'Thêm ngày lễ mới')}
                size="sm"
                action={
                    <>
                        <Button onClick={() => setOpenDialog(false)} color="inherit" disabled={saving}>
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button
                            onClick={holidayFormik.handleSubmit}
                            color="primary"
                            variant="contained"
                            disabled={saving}
                        >
                            {saving ? t('common.saving', 'Đang lưu...') : (isEdit ? t('common.save_changes', 'Lưu thay đổi') : t('holiday.add_btn', 'Thêm ngày lễ'))}
                        </Button>
                    </>
                }
            >
                <FormikProvider value={holidayFormik}>
                    <Box>
                        {/* Hàng 1: Mã & Năm */}
                        <Box className="flex gap-4">
                            <Box className="flex-1">
                                <TextField
                                    label={t('holiday.code_label', 'Mã ngày lễ')}
                                    name="code"
                                    required
                                    placeholder="VD: TET_DUONG_LICH_2026"
                                />
                            </Box>
                            <Box className="flex-1">
                                <SelectInput
                                    label={t('holiday.year', 'Năm')}
                                    name="year"
                                    options={yearFormOptions}
                                    keyValue="value"
                                    displayvalue="name"
                                    hideNullOption={true}
                                    required={true}
                                />
                            </Box>
                        </Box>

                        {/* Hàng 2: Tên ngày lễ */}
                        <TextField
                            label={t('holiday.name_label', 'Tên ngày lễ')}
                            name="name"
                            required
                            placeholder="VD: Tết Dương Lịch"
                        />

                        {/* Hàng 3: Từ ngày & Đến ngày */}
                        <Box className="flex gap-4">
                            <Box className="flex-1">
                                <DateTimePicker
                                    label={t('holiday.start_date', 'Từ ngày')}
                                    name="startDate"
                                    notValueMillisecond={true}
                                    required={true}
                                />
                            </Box>
                            <Box className="flex-1">
                                <DateTimePicker
                                    label={t('holiday.end_date', 'Đến ngày')}
                                    name="endDate"
                                    notValueMillisecond={true}
                                    required={true}
                                />
                            </Box>
                        </Box>

                        {/* Hiển thị tổng số ngày */}
                        {calculatedTotalDays > 0 && (
                            <Box className="my-2 p-2 rounded-lg" sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                                <Typography variant="body2" color="primary.main" fontWeight="600">
                                    {t('holiday.total_days_text', 'Tổng số ngày nghỉ: {{days}} ngày', { days: calculatedTotalDays })}
                                </Typography>
                            </Box>
                        )}

                        {/* Hàng 4: Mô tả */}
                        <TextField
                            label={t('holiday.description', 'Mô tả')}
                            name="description"
                            multiline
                            rows={3}
                            placeholder="Ghi chú thêm về ngày lễ..."
                        />
                    </Box>
                </FormikProvider>
            </Popup>

            {/* Confirm Delete */}
            <ConfirmationDialog
                open={openConfirmDelete}
                onConfirmDialogClose={() => setOpenConfirmDelete(false)}
                onYesClick={handleConfirmDelete}
                title={t('holiday.delete_confirm_title', 'Xác nhận xóa ngày lễ')}
                text={t('holiday.delete_confirm_text', 'Bạn có chắc chắn muốn xóa ngày lễ "{{name}}"?', { name: selectedHoliday?.name })}
                agree={t('common.confirm', 'Xác nhận xóa')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </div>
    );
};

export default HolidayPage;
