import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Button, Grid, IconButton, Paper, Typography, Box, 
    Chip, Avatar, Tooltip
} from '@mui/material';
import { 
    CheckCircle, Cancel, Visibility,
    SettingsBackupRestore, VideocamOff
} from '@mui/icons-material';
import { Formik } from 'formik';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import Autocomplete from '../../components/ui/Autocomplete';
import AsyncAutocomplete from '../../components/ui/AsyncAutocomplete';
import useTimesheetStore from '../../store/useTimesheetStore';
import { getDepartments, pagingStaffs } from '../../services/StaffService';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import TextField from '../../components/ui/TextField';
import DateTimePicker from '../../components/ui/DateTimePicker';
import Popup from '../../components/ui/Popup';
import { useTimesheets, useApproveTimesheet, useRawLogs } from './api';

const TIMESHEET_STATUS_OPTIONS = [
    { id: 'SUBMITTED', name: 'Chờ duyệt' },
    { id: 'APPROVED', name: 'Đã duyệt' },
    { id: 'REJECTED', name: 'Từ chối' }
];

const formatShiftTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
};

const TimesheetApprovalList = () => {
    const { t } = useTranslation();
    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        filters,
        setFilters,
        resetFilters,
    } = useTimesheetStore();

    // Query & Mutation
    const { data: timesheetData, isFetching } = useTimesheets({
        pageIndex: page,
        pageSize,
        ...filters
    });
    const approveTimesheetMutation = useApproveTimesheet();

    // Dialog state for Approval / Rejection
    const [approvalOpen, setApprovalOpen] = useState(false);
    const [selectedTimesheet, setSelectedTimesheet] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState('APPROVED');

    // Dialog state for raw logs details
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailTimesheet, setDetailTimesheet] = useState(null);

    const { data: rawLogs = [] } = useRawLogs(
        detailTimesheet?.staffId,
        detailTimesheet?.workingDate
    );

    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');

    const formikRef = useRef();
    const formikRefPopup = useRef();

    // Handlers
    const handleOpenApproval = (timesheet, status) => {
        setSelectedTimesheet(timesheet);
        setApprovalStatus(status);
        setApprovalOpen(true);
    };

    const handleConfirmApproval = async (note) => {
        if (!selectedTimesheet) return;
        try {
            await approveTimesheetMutation.mutateAsync({
                id: selectedTimesheet.id,
                status: approvalStatus,
                note
            });
            setApprovalOpen(false);
            setSelectedTimesheet(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenDetails = (timesheet) => {
        setDetailTimesheet(timesheet);
        setDetailOpen(true);
    };

    const handleApplyFilters = () => {
        formikRef.current?.handleSubmit();
    };

    const handleResetFilters = () => {
        setSearchDraft('');
        resetFilters();
        formikRef.current?.resetForm();
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.departmentId) count++;
        if (filters.staffId) count++;
        if (filters.status) count++;
        if (filters.fromDate) count++;
        if (filters.toDate) count++;
        return count;
    }, [filters]);

    const initialStatus = useMemo(() => {
        return TIMESHEET_STATUS_OPTIONS.find(s => s.id === filters.status) || null;
    }, [filters.status]);

    const columns = [
        {
            title: t('common.actions', 'Thao tác'),
            field: 'actions',
            width: 150,
            render: (rowData) => (
                <div className="flex items-center space-x-1">
                    <Tooltip title={t('timekeeping.approval.view_logs_tooltip', 'Xem ảnh & nhật ký chấm công')} arrow>
                        <IconButton 
                            size="small" 
                            color="info" 
                            onClick={() => handleOpenDetails(rowData)}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {rowData.status !== 'APPROVED' && (
                        <Tooltip title={t('timekeeping.approval.approve_tooltip', 'Duyệt công')} arrow>
                            <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleOpenApproval(rowData, 'APPROVED')}
                            >
                                <CheckCircle fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {rowData.status !== 'REJECTED' && (
                        <Tooltip title={t('timekeeping.approval.reject_tooltip', 'Từ chối công')} arrow>
                            <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleOpenApproval(rowData, 'REJECTED')}
                            >
                                <Cancel fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {rowData.status !== 'SUBMITTED' && (
                        <Tooltip title={t('timekeeping.approval.reset_tooltip', 'Đặt lại chờ duyệt')} arrow>
                            <IconButton 
                                size="small" 
                                color="warning" 
                                onClick={() => handleOpenApproval(rowData, 'SUBMITTED')}
                            >
                                <SettingsBackupRestore fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            )
        },
        {
            title: t('staff.code', 'Mã NV'),
            field: 'staffCode',
            width: 100,
            render: (rowData) => <span>{rowData.staffCode || '---'}</span>
        },
        {
            title: t('staff.name', 'Nhân viên'),
            field: 'staffName',
            minWidth: 150,
            width: 150,
            align: 'center',
            render: (rowData) => (
                <span>{rowData.staffName || '---'}</span>
            )
        },
        {
            title: t('department.name', 'Phòng ban'),
            field: 'departmentName',
            width: 150,
            render: (rowData) => <span>{rowData.departmentName || '---'}</span>
        },
        {
            title: t('position.name', 'Vị trí'),
            field: 'positionName',
            width: 130,
            render: (rowData) => <span>{rowData.positionName || '---'}</span>
        },
        {
            title: t('timekeeping.date', 'Ngày làm việc'),
            field: 'workingDate',
            align: 'center',
            width: 120,
            render: (rowData) => <span>{dayjs(rowData.workingDate).format('DD/MM/YYYY')}</span>
        },
        {
            title: t('timekeeping.applied_shift', 'Ca áp dụng'),
            width: 170,
            render: (rowData) => {
                const details = rowData.details || [];
                if (details.length === 0) return '---';
                return (
                    <div className="space-y-0.5">
                        {details.map((d, idx) => d.shift && (
                            <div key={idx} className="whitespace-nowrap">
                                {d.shift.name} ({formatShiftTime(d.shift.startTime)} - {formatShiftTime(d.shift.endTime)})
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {
            title: t('timekeeping.time_in_out', 'Giờ vào/ra'),
            width: 140,
            align: 'center',
            render: (rowData) => {
                let minCheckIn = null;
                let maxCheckOut = null;
                const details = rowData.details || [];
                details.forEach(d => {
                    if (d.checkInTime) {
                        const ci = dayjs(d.checkInTime);
                        if (!minCheckIn || ci.isBefore(minCheckIn)) {
                            minCheckIn = ci;
                        }
                    }
                    if (d.checkOutTime) {
                        const co = dayjs(d.checkOutTime);
                        if (!maxCheckOut || co.isAfter(maxCheckOut)) {
                            maxCheckOut = co;
                        }
                    }
                });
                return (
                    <div>
                        <div>{t('timekeeping.check_in_short', 'Vào')}: <span className="font-bold text-gray-700">{minCheckIn ? minCheckIn.format('HH:mm') : '--:--'}</span></div>
                        <div>{t('timekeeping.check_out_short', 'Ra')}: <span className="font-bold text-gray-700">{maxCheckOut ? maxCheckOut.format('HH:mm') : '--:--'}</span></div>
                    </div>
                );
            }
        },
        {
            title: t('common.status', 'Trạng thái'),
            field: 'status',
            width: 120,
            render: (rowData) => {
                switch (rowData.status) {
                    case 'APPROVED':
                        return <Chip label={t('timekeeping.status.approved', 'Đã duyệt')} size="small" color="success" variant="outlined" />;
                    case 'SUBMITTED':
                        return <Chip label={t('timekeeping.status.submitted', 'Chờ duyệt')} size="small" color="warning" variant="outlined" />;
                    case 'REJECTED':
                        return <Chip label={t('timekeeping.status.rejected', 'Từ chối')} size="small" color="error" variant="outlined" />;
                    default:
                        return <Chip label={t('timekeeping.status.draft', 'Nháp')} size="small" color="default" variant="outlined" />;
                }
            }
        },
    ];

    return (
        <Box className="space-y-6">
            <Paper elevation={0} className="p-4 border border-border rounded-xl shadow-sm">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        department: filters.department || null,
                        staff: filters.staff || null,
                        status: initialStatus,
                        fromDate: filters.fromDate ? new Date(filters.fromDate) : null,
                        toDate: filters.toDate ? new Date(filters.toDate) : null
                    }}
                    enableReinitialize={true}
                    onSubmit={(values) => {
                        setFilters({
                            departmentId: values.department?.id || null,
                            staffId: values.staff?.id || null,
                            status: values.status?.id || null,
                            fromDate: values.fromDate ? dayjs(values.fromDate).format('YYYY-MM-DD') : null,
                            toDate: values.toDate ? dayjs(values.toDate).format('YYYY-MM-DD') : null
                        });
                    }}
                >
                    {() => (
                        <>
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={() => setFilters({ keyword: searchDraft })}
                                onReset={handleResetFilters}
                                showAdd={false}
                                searchPlaceholder={t('timekeeping.approval.search_placeholder', 'Tìm kiếm theo tên hoặc mã nhân viên...')}
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
                                onReset={handleResetFilters}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <AsyncAutocomplete
                                            name="department"
                                            label={t('department.name', 'Phòng ban')}
                                            api={getDepartments}
                                            getOptionLabel={(option) => option?.name || ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <AsyncAutocomplete
                                            name="staff"
                                            label={t('staff.name', 'Nhân viên')}
                                            api={pagingStaffs}
                                            searchObject={{ pageIndex: 1, pageSize: 50 }}
                                            getOptionLabel={(option) => option ? `${option.displayName || option.name} (${option.staffCode || ''})` : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            name="status"
                                            label={t('timekeeping.status_approval', 'Trạng thái duyệt')}
                                            options={TIMESHEET_STATUS_OPTIONS}
                                            getOptionLabel={(option) => option ? t('timekeeping.status.' + option.id.toLowerCase(), option.name) : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateTimePicker
                                            label={t('timekeeping.start_date', 'Từ ngày')}
                                            name="fromDate"
                                            notValueMillisecond={true}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateTimePicker
                                            label={t('timekeeping.end_date', 'Đến ngày')}
                                            name="toDate"
                                            notValueMillisecond={true}
                                        />
                                    </Grid>
                                </Grid>
                            </FilterPanel>
                        </>
                    )}
                </Formik>

                {/* Table */}
                <Table 
                    columns={columns}
                    data={timesheetData?.content || []}
                    totalElements={timesheetData?.totalElements || 0}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    loading={isFetching}
                />
            </Paper>

            <ConfirmationDialog
                open={approvalOpen}
                onConfirmDialogClose={() => setApprovalOpen(false)}
                title={
                    approvalStatus === 'APPROVED' 
                        ? t('timekeeping.approval.confirm_approve_title', 'Xác nhận duyệt chấm công') 
                        : approvalStatus === 'REJECTED' 
                            ? t('timekeeping.approval.confirm_reject_title', 'Xác nhận từ chối chấm công') 
                            : t('timekeeping.approval.confirm_reset_title', 'Xác nhận đặt lại trạng thái chờ duyệt')
                }
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
                onYesClick={() => {
                    formikRefPopup.current?.handleSubmit();
                }}
                disabled={approveTimesheetMutation.isPending}
                text={t('timekeeping.approval.confirm_text', 'Bạn đang {{action}} cho nhân viên {{name}} ({{code}}) ngày {{date}}.', { 
                    action: approvalStatus === 'APPROVED' 
                        ? t('timekeeping.approval.action_approve', 'duyệt chấm công') 
                        : approvalStatus === 'REJECTED' 
                            ? t('timekeeping.approval.action_reject', 'từ chối chấm công') 
                            : t('timekeeping.approval.action_reset', 'đặt lại trạng thái chờ duyệt'), 
                    name: selectedTimesheet?.staffName || '', 
                    code: selectedTimesheet?.staffCode || '', 
                    date: selectedTimesheet ? dayjs(selectedTimesheet.workingDate).format('DD/MM/YYYY') : '' 
                })}
            >
                {approvalOpen && (
                    <Formik
                        innerRef={formikRefPopup}
                        initialValues={{
                            note: ''
                        }}
                        onSubmit={(values) => {
                            handleConfirmApproval(values.note);
                        }}
                    >
                        {() => (
                            <Box>
                                <TextField
                                    label={t('timekeeping.approval.note_label', 'Ghi chú / Lý do (không bắt buộc)')}
                                    name="note"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    size="small"
                                />
                            </Box>
                        )}
                    </Formik>
                )}
            </ConfirmationDialog>

            <Popup
                open={detailOpen}
                onClosePopup={() => setDetailOpen(false)}
                title={detailTimesheet ? t('timekeeping.approval.detail_title', 'Chi tiết chấm công: {{name}} (Ngày {{date}})', { name: detailTimesheet.staffName || '', date: dayjs(detailTimesheet.workingDate).format('DD/MM/YYYY') }) : ''}
                size="sm"
                action={
                    <Button 
                        onClick={() => setDetailOpen(false)} 
                        variant="outlined" 
                        color="inherit"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-bold px-5 py-1.5 rounded-lg"
                    >
                        Đóng
                    </Button>
                }
            >
                {detailTimesheet && (() => {
                    let minCheckIn = null;
                    let maxCheckOut = null;
                    const details = detailTimesheet.details || [];
                    
                    details.forEach(d => {
                        if (d.checkInTime) {
                            const ci = dayjs(d.checkInTime);
                            if (!minCheckIn || ci.isBefore(minCheckIn)) {
                                minCheckIn = ci;
                            }
                        }
                        if (d.checkOutTime) {
                            const co = dayjs(d.checkOutTime);
                            if (!maxCheckOut || co.isAfter(maxCheckOut)) {
                                maxCheckOut = co;
                            }
                        }
                    });

                    let localStdHours = 0;
                    let localOtHours = 0;
                    details.forEach(d => {
                        if (d.checkInTime && d.checkOutTime) {
                            let inTime = dayjs(d.checkInTime);
                            let outTime = dayjs(d.checkOutTime);
                            if (d.shift && d.shift.startTime && d.shift.endTime) {
                                const [sh, sm] = d.shift.startTime.split(':');
                                const [eh, em] = d.shift.endTime.split(':');
                                let limitIn = inTime.hour(parseInt(sh, 10)).minute(parseInt(sm, 10)).second(0);
                                let limitOut = outTime.hour(parseInt(eh, 10)).minute(parseInt(em, 10)).second(0);
                                if (inTime.isBefore(limitIn)) inTime = limitIn;
                                if (outTime.isAfter(limitOut)) outTime = limitOut;
                            }
                            let diff = outTime.diff(inTime, 'hour', true);
                            if (diff > 0) {
                                if (d.shift && d.shift.code && (d.shift.code.toUpperCase().includes('OT') || d.shift.code.toUpperCase().includes('TANG_CA') || d.shift.code.toUpperCase().includes('OVERTIME'))) {
                                    localOtHours += diff;
                                } else {
                                    if (d.shift && d.shift.code === 'CA_CA_NGAY') {
                                        const ci = inTime.format('HH:mm');
                                        const co = outTime.format('HH:mm');
                                        if (ci < '13:30' && co > '12:00') {
                                            diff = Math.max(0, diff - 1.5);
                                        }
                                    }
                                    localStdHours += diff;
                                }
                            }
                        }
                    });

                    const displayStandardHours = (detailTimesheet.standardHours !== undefined && detailTimesheet.standardHours !== null)
                        ? detailTimesheet.standardHours
                        : localStdHours;

                    const displayOvertimeHours = (detailTimesheet.overtimeHours !== undefined && detailTimesheet.overtimeHours !== null)
                        ? ((detailTimesheet.overtimeHours || 0) + (detailTimesheet.weekendOvertimeHours || 0) + (detailTimesheet.holidayOvertimeHours || 0))
                        : localOtHours;

                    const displayTotalHours = displayStandardHours + displayOvertimeHours;

                    return (
                        <Box className="space-y-4 pt-1 pb-1">
                            <Box className="grid grid-cols-3 gap-3">
                                <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground">{t('timekeeping.detail.check_in', 'Giờ vào')}</Typography>
                                    <Typography variant="body2" className="font-bold text-foreground">
                                        {minCheckIn ? minCheckIn.format('HH:mm') : '--:--'}
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground">{t('timekeeping.detail.check_out', 'Giờ ra')}</Typography>
                                    <Typography variant="body2" className="font-bold text-foreground">
                                        {maxCheckOut ? maxCheckOut.format('HH:mm') : '--:--'}
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground">{t('timekeeping.detail.work_ratio', 'Số công quy đổi')}</Typography>
                                    <Typography variant="body2" className="font-bold text-emerald-600 dark:text-emerald-500">
                                        {detailTimesheet.totalWorkRatio || 0} {t('timekeeping.detail.work_ratio_unit', 'công')}
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground">{t('timekeeping.detail.total_hours', 'Tổng số giờ làm')}</Typography>
                                    <Typography variant="body2" className="font-bold text-primary dark:text-primary-foreground">
                                        {displayTotalHours.toFixed(2)} {t('timekeeping.detail.hours_unit', 'giờ')}
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground">{t('timekeeping.detail.standard_hours', 'Giờ làm thường')}</Typography>
                                    <Typography variant="body2" className="font-bold text-indigo-600 dark:text-indigo-400">
                                        {displayStandardHours.toFixed(2)} {t('timekeeping.detail.hours_unit', 'giờ')}
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground">{t('timekeeping.detail.ot_hours', 'Giờ tăng ca (OT)')}</Typography>
                                    <Typography variant="body2" className="font-bold text-amber-600 dark:text-amber-400">
                                        {displayOvertimeHours.toFixed(2)} {t('timekeeping.detail.hours_unit', 'giờ')}
                                    </Typography>
                                </Box>
                            </Box>

                            {details.map((d, index) => d.shift && (
                                <Box key={index} className="bg-blue-50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/50 text-xs">
                                    <Typography className="font-bold text-blue-800 dark:text-blue-300">
                                        {t('timekeeping.detail.applied_shift', 'Ca áp dụng')}: {d.shift.name} ({formatShiftTime(d.shift.startTime)} - {formatShiftTime(d.shift.endTime)})
                                    </Typography>
                                    {d.shift.description && (
                                        <Typography className="text-blue-600 dark:text-blue-400 mt-1">{d.shift.description}</Typography>
                                    )}
                                    <Typography className="text-muted-foreground mt-1 block">
                                        {t('timekeeping.detail.shift_work_ratio', 'Công ca')}: <strong className="text-foreground">{d.workRatio || 0}</strong> | {t('timekeeping.check_in_short', 'Vào')}: <strong>{d.checkInTime ? dayjs(d.checkInTime).format('HH:mm') : '--:--'}</strong> | {t('timekeeping.check_out_short', 'Ra')}: <strong>{d.checkOutTime ? dayjs(d.checkOutTime).format('HH:mm') : '--:--'}</strong> | {t('timekeeping.detail.total_hours', 'Số giờ')}: <strong>{d.checkInTime && d.checkOutTime ? dayjs(d.checkOutTime).diff(dayjs(d.checkInTime), 'hour', true).toFixed(2) + ' ' + t('timekeeping.detail.hours_unit', 'giờ') : '0 ' + t('timekeeping.detail.hours_unit', 'giờ')}</strong>
                                    </Typography>
                                </Box>
                            ))}

                            <Box className="space-y-2 mt-4">
                                <Typography variant="subtitle2" className="font-bold text-foreground">
                                    {t('timekeeping.detail.logs_title', 'Lịch sử chấm công')}
                                </Typography>

                                {rawLogs.length === 0 ? (
                                    <Typography variant="body2" className="text-muted-foreground italic text-center py-4 bg-muted border border-border rounded-xl">
                                        {t('timekeeping.approval.no_logs', 'Chưa có nhật ký quẹt thẻ.')}
                                    </Typography>
                                ) : (
                                    <Box className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                                        {rawLogs.map((log) => (
                                            <Box key={log.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                <Box className="flex items-center gap-3">
                                                    {log.photoUrl ? (
                                                        <Tooltip title={t('timekeeping.approval.view_photo_tooltip', 'Nhấp để xem ảnh lớn')} arrow>
                                                            <Avatar 
                                                                src={log.photoUrl} 
                                                                variant="rounded" 
                                                                className="cursor-pointer border border-border"
                                                                sx={{ width: 48, height: 48 }}
                                                                onClick={() => window.open(log.photoUrl, '_blank')}
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <Avatar variant="rounded" sx={{ width: 48, height: 48 }} className="bg-muted border border-border">
                                                            <VideocamOff className="text-muted-foreground" />
                                                        </Avatar>
                                                    )}

                                                    <Box>
                                                        <Typography variant="body2" className="font-semibold text-foreground">
                                                            {t('timekeeping.detail.scanned_at_label', 'Lượt quét')}: {dayjs(log.recordTime).format('HH:mm')}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-muted-foreground block">
                                                            IP: <span className="font-mono text-foreground font-semibold">{log.ipAddress || 'Unknown'}</span> | {t('timekeeping.detail.device', 'Thiết bị')}: {log.deviceType || 'Web Browser'}
                                                            {log.latitude && log.longitude && (
                                                                <> | GPS: <span className="font-mono text-foreground font-semibold">{log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}</span></>
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Chip 
                                                    label={log.recordType === 'CHECK_IN' ? t('timekeeping.record_type.check_in', 'VÀO') : t('timekeeping.record_type.check_out', 'RA')} 
                                                    size="small" 
                                                    className={log.recordType === 'CHECK_IN' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50'}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {detailTimesheet.note && (
                                <Box className="mt-2 text-xs text-muted-foreground bg-muted p-2.5 rounded-lg border border-border">
                                    <span className="font-bold text-foreground">{t('timekeeping.detail.notes_title', 'Ghi chú duyệt công:')}</span> {detailTimesheet.note}
                                </Box>
                            )}
                        </Box>
                    );
                })()}
            </Popup>
        </Box>
    );
};

export default TimesheetApprovalList;
