import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
    Button, Grid, IconButton, Paper, Typography, Box, 
    Chip, Avatar, Tooltip
} from '@mui/material';
import { 
    CheckCircle, Cancel, Visibility, Search, CheckCircleOutline,
    Close, Image, VideocamOff, FilterList
} from '@mui/icons-material';
import { Formik } from 'formik';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import Autocomplete from '../../components/ui/Autocomplete';
import useTimesheetStore from '../../store/useTimesheetStore';
import { getDepartments, getStaffs } from '../../services/StaffService';
import { getLabelFromOptions } from '../../LocalFunction';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import TextField from '../../components/ui/TextField';
import DateTimePicker from '../../components/ui/DateTimePicker';
import Popup from '../../components/ui/Popup';

const TIMESHEET_STATUS_OPTIONS = [
    { id: 'DRAFT', name: 'Nháp' },
    { id: 'SUBMITTED', name: 'Chờ duyệt' },
    { id: 'APPROVED', name: 'Đã duyệt' },
    { id: 'REJECTED', name: 'Từ chối' }
];

// Helper to format shift time (removing seconds, e.g. "08:00:00" -> "08:00")
const formatShiftTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
};

const TimesheetApprovalList = () => {
    const {
        timesheets,
        loading,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalElements,
        filters,
        setFilters,
        resetFilters,
        loadTimesheets,
        updateTimesheetStatus,
        rawLogs,
        loadRawLogs
    } = useTimesheetStore();

    // Dialog state for Approval / Rejection
    const [approvalOpen, setApprovalOpen] = useState(false);
    const [selectedTimesheet, setSelectedTimesheet] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState('APPROVED');
    const [submitting, setSubmitting] = useState(false);

    // Dialog state for raw logs details
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailTimesheet, setDetailTimesheet] = useState(null);



    // Filter metadata
    const [departments, setDepartments] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');

    const formikRef = useRef();
    const formikRefPopup = useRef();

    // Fetch filters metadata
    useEffect(() => {
        const fetchRefs = async () => {
            try {
                const depRes = await getDepartments();
                setDepartments(depRes?.data || []);
                const staffRes = await getStaffs();
                setStaffList(staffRes?.data || []);
            } catch (err) {
                console.error("Failed to load filter metadata:", err);
            }
        };
        fetchRefs();
    }, []);

    // Load timesheets when parameters change
    useEffect(() => {
        loadTimesheets();
    }, [page, pageSize, filters]);

    // Handlers
    const handleOpenApproval = (timesheet, status) => {
        setSelectedTimesheet(timesheet);
        setApprovalStatus(status);
        setApprovalOpen(true);
    };

    const handleConfirmApproval = async (note) => {
        if (!selectedTimesheet) return;
        setSubmitting(true);
        try {
            await updateTimesheetStatus(selectedTimesheet.id, approvalStatus, note);
            toast.success(`Đã cập nhật trạng thái ngày công sang: ${approvalStatus === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}`);
            setApprovalOpen(false);
            setSelectedTimesheet(null);
        } catch (err) {
            console.error(err);
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái ngày công");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDetails = async (timesheet) => {
        setDetailTimesheet(timesheet);
        setDetailOpen(true);
        if (timesheet.staffId) {
            await loadRawLogs(timesheet.staffId, timesheet.workingDate);
        }
    };

    const handleApplyFilters = () => {
        formikRef.current?.handleSubmit();
    };

    const handleResetFilters = () => {
        formikRef.current?.resetForm();
        resetFilters();
        setSearchDraft('');
    };

    // Auto-calculating active filters count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.departmentId) count++;
        if (filters.staffId) count++;
        if (filters.status) count++;
        if (filters.fromDate) count++;
        if (filters.toDate) count++;
        return count;
    }, [filters]);

    // Initial values for Autocompletes
    const initialDepartment = useMemo(() => {
        return departments.find(d => d.id === filters.departmentId) || null;
    }, [departments, filters.departmentId]);

    const initialStaff = useMemo(() => {
        return staffList.find(s => s.id === filters.staffId) || null;
    }, [staffList, filters.staffId]);

    const initialStatus = useMemo(() => {
        return TIMESHEET_STATUS_OPTIONS.find(s => s.id === filters.status) || null;
    }, [filters.status]);

    // Table Columns
    const columns = [
        {
            title: 'Thao tác',
            field: 'actions',
            width: 150,
            render: (rowData) => (
                <div className="flex items-center space-x-1">
                    <Tooltip title="Xem ảnh & nhật ký chấm công" arrow>
                        <IconButton 
                            size="small" 
                            color="info" 
                            onClick={() => handleOpenDetails(rowData)}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {rowData.status !== 'APPROVED' && (
                        <Tooltip title="Duyệt công" arrow>
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
                        <Tooltip title="Từ chối công" arrow>
                            <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleOpenApproval(rowData, 'REJECTED')}
                            >
                                <Cancel fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            )
        },
        {
            title: 'Mã NV',
            field: 'staffCode',
            width: 100,
            render: (rowData) => <span>{rowData.staffCode || '---'}</span>
        },
        {
            title: 'Nhân viên',
            field: 'staffName',
            minWidth: 150,
            width: 150,
            align: 'center',
            render: (rowData) => (
                <Typography className="font-semibold text-sm">{rowData.staffName || '---'}</Typography>
            )
        },
        {
            title: 'Phòng ban',
            field: 'departmentName',
            width: 150,
            align: 'center',
            render: (rowData) => <span>{rowData.departmentName || '---'}</span>
        },
        {
            title: 'Vị trí',
            field: 'positionName',
            align: 'center',
            width: 130,
            render: (rowData) => <span>{rowData.positionName || '---'}</span>
        },
        {
            title: 'Ngày làm việc',
            field: 'workingDate',
            align: 'center',
            width: 120,
            render: (rowData) => <span>{dayjs(rowData.workingDate).format('DD/MM/YYYY')}</span>
        },
        {
            title: 'Ca áp dụng',
            width: 170,
            render: (rowData) => {
                const details = rowData.details || [];
                if (details.length === 0) return '---';
                return (
                    <div className="space-y-0.5 text-xs">
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
            title: 'Giờ vào/ra',
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
                    <div className="text-xs">
                        <div>Vào: <span className="font-bold text-gray-700">{minCheckIn ? minCheckIn.format('HH:mm') : '--:--'}</span></div>
                        <div>Ra: <span className="font-bold text-gray-700">{maxCheckOut ? maxCheckOut.format('HH:mm') : '--:--'}</span></div>
                    </div>
                );
            }
        },
        {
            title: 'Công',
            field: 'totalWorkRatio',
            align: 'center',
            width: 80,
            render: (rowData) => <span className="font-bold text-emerald-600">{rowData.totalWorkRatio || 0}</span>
        },
        {
            title: 'Số giờ làm',
            width: 130,
            align: 'center',
            render: (rowData) => {
                let totalHours = 0;
                const details = rowData.details || [];
                details.forEach(d => {
                    if (d.checkInTime && d.checkOutTime) {
                        const diffHours = dayjs(d.checkOutTime).diff(dayjs(d.checkInTime), 'hour', true);
                        if (diffHours > 0) {
                            totalHours += diffHours;
                        }
                    }
                });

                const displayHours = (rowData.standardHours !== undefined && rowData.standardHours !== null && rowData.overtimeHours !== undefined && rowData.overtimeHours !== null)
                    ? (rowData.standardHours + rowData.overtimeHours)
                    : totalHours;

                return (
                    <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                        {displayHours > 0 ? `${displayHours.toFixed(2)}` : '0'}
                    </span>
                );
            }
        },
        {
            title: 'Trạng thái',
            field: 'status',
            width: 120,
            render: (rowData) => {
                switch (rowData.status) {
                    case 'APPROVED':
                        return <Chip label="Đã duyệt" size="small" color="success" variant="outlined" />;
                    case 'SUBMITTED':
                        return <Chip label="Chờ duyệt" size="small" color="warning" variant="outlined" />;
                    case 'REJECTED':
                        return <Chip label="Từ chối" size="small" color="error" variant="outlined" />;
                    default:
                        return <Chip label="Nháp" size="small" color="default" variant="outlined" />;
                }
            }
        },
        {
            title: 'Ghi chú duyệt',
            field: 'note',
            align: 'center',
            width: 180,
            render: (rowData) => <span className="text-xs text-gray-500">{rowData.note || '---'}</span>
        }
    ];

    return (
        <Box className="space-y-6">
            <Paper elevation={0} className="p-4 border border-border shadow-sm">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        department: initialDepartment,
                        staff: initialStaff,
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
                    {({ values, setFieldValue }) => (
                        <>
                            {/* Toolbar and filter toggle */}
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={() => setFilters({ keyword: searchDraft })}
                                onReset={handleResetFilters}
                                showAdd={false}
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: activeFilterCount
                                }}
                            />

                            {/* Filters drawer panel */}
                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleResetFilters}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            name="department"
                                            label="Phòng ban"
                                            options={departments}
                                            getOptionLabel={(option) => option?.name || ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            name="staff"
                                            label="Nhân viên"
                                            options={staffList}
                                            getOptionLabel={(option) => option ? `${option.displayName} (${option.staffCode})` : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Autocomplete
                                            name="status"
                                            label="Trạng thái duyệt"
                                            options={TIMESHEET_STATUS_OPTIONS}
                                            getOptionLabel={(option) => option?.name || ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateTimePicker
                                            label="Từ ngày"
                                            name="fromDate"
                                            notValueMillisecond={true}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateTimePicker
                                            label="Đến ngày"
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
                    data={timesheets}
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    loading={loading}
                />
            </Paper>

            {/* Approval / Rejection Note Dialog using shared ConfirmationDialog component */}
            <ConfirmationDialog
                open={approvalOpen}
                onConfirmDialogClose={() => setApprovalOpen(false)}
                title={approvalStatus === 'APPROVED' ? 'Xác nhận duyệt chấm công' : 'Xác nhận từ chối chấm công'}
                agree="Xác nhận"
                cancel="Hủy bỏ"
                onYesClick={() => {
                    formikRefPopup.current?.handleSubmit();
                }}
                disabled={submitting}
                text={`Bạn đang ${approvalStatus === 'APPROVED' ? 'duyệt chấm công' : 'từ chối chấm công'} cho nhân viên ${selectedTimesheet?.staffName || ''} (${selectedTimesheet?.staffCode || ''}) ngày ${selectedTimesheet ? dayjs(selectedTimesheet.workingDate).format('DD/MM/YYYY') : ''}.`}
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
                                    label="Ghi chú / Lý do (không bắt buộc)"
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

            {/* Detailed logs view */}
            <Popup
                open={detailOpen}
                onClosePopup={() => setDetailOpen(false)}
                title={detailTimesheet ? `Chi tiết chấm công: ${detailTimesheet.staffName || ''} (Ngày ${dayjs(detailTimesheet.workingDate).format('DD/MM/YYYY')})` : ''}
                size="sm"
                action={
                    <Button 
                        onClick={() => setDetailOpen(false)} 
                        variant="contained" 
                        className="bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-bold px-5 py-1.5"
                    >
                        Đóng
                    </Button>
                }
            >
                {detailTimesheet && (() => {
                    let minCheckIn = null;
                    let maxCheckOut = null;
                    let totalHours = 0;
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
                        if (d.checkInTime && d.checkOutTime) {
                            const diff = dayjs(d.checkOutTime).diff(dayjs(d.checkInTime), 'hour', true);
                            if (diff > 0) {
                                totalHours += diff;
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
                        ? detailTimesheet.overtimeHours
                        : localOtHours;

                    const displayTotalHours = displayStandardHours + displayOvertimeHours;

                    return (
                        <Box className="space-y-4 pt-1 pb-1">
                            {/* Stats */}
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                    <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                        <Typography variant="caption" className="text-muted-foreground">Vào</Typography>
                                        <Typography variant="body2" className="font-bold text-foreground">
                                            {minCheckIn ? minCheckIn.format('HH:mm') : '--:--'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                        <Typography variant="caption" className="text-muted-foreground">Ra</Typography>
                                        <Typography variant="body2" className="font-bold text-foreground">
                                            {maxCheckOut ? maxCheckOut.format('HH:mm') : '--:--'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                        <Typography variant="caption" className="text-muted-foreground">Công quy đổi</Typography>
                                        <Typography variant="body2" className="font-bold text-emerald-600 dark:text-emerald-500">
                                            {detailTimesheet.totalWorkRatio || 0} công
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                        <Typography variant="caption" className="text-muted-foreground">Tổng số giờ làm</Typography>
                                        <Typography variant="body2" className="font-bold text-primary dark:text-primary-foreground">
                                            {displayTotalHours.toFixed(2)} giờ
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                        <Typography variant="caption" className="text-muted-foreground">Giờ làm thường</Typography>
                                        <Typography variant="body2" className="font-bold text-indigo-600 dark:text-indigo-400">
                                            {displayStandardHours.toFixed(2)} giờ
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box className="bg-muted p-2.5 rounded-xl text-center border border-border">
                                        <Typography variant="caption" className="text-muted-foreground">Giờ tăng ca (OT)</Typography>
                                        <Typography variant="body2" className="font-bold text-amber-600 dark:text-amber-400">
                                            {displayOvertimeHours.toFixed(2)} giờ
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Shift detail details */}
                            {details.map((d, index) => d.shift && (
                                <Box key={index} className="bg-blue-50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/50 text-xs">
                                    <Typography className="font-bold text-blue-800 dark:text-blue-300">
                                        Ca áp dụng: {d.shift.name} ({formatShiftTime(d.shift.startTime)} - {formatShiftTime(d.shift.endTime)})
                                    </Typography>
                                    {d.shift.description && (
                                        <Typography className="text-blue-600 dark:text-blue-400 mt-1">{d.shift.description}</Typography>
                                    )}
                                    <Typography className="text-muted-foreground mt-1 block">
                                        Công ca: <strong className="text-foreground">{d.workRatio || 0}</strong> | Vào: <strong>{d.checkInTime ? dayjs(d.checkInTime).format('HH:mm') : '--:--'}</strong> | Ra: <strong>{d.checkOutTime ? dayjs(d.checkOutTime).format('HH:mm') : '--:--'}</strong> | Số giờ: <strong>{d.checkInTime && d.checkOutTime ? dayjs(d.checkOutTime).diff(dayjs(d.checkInTime), 'hour', true).toFixed(2) + ' giờ' : '0 giờ'}</strong>
                                    </Typography>
                                </Box>
                            ))}

                            {/* Raw Logs with Snapshot Photos */}
                            <Box className="space-y-2 mt-4">
                                <Typography variant="subtitle2" className="font-bold text-foreground">
                                    Lịch sử quét vân tay/nhận diện (Webcam & IP logs)
                                </Typography>

                                {rawLogs.length === 0 ? (
                                    <Typography variant="body2" className="text-muted-foreground italic text-center py-4 bg-muted border border-border rounded-xl">
                                        Chưa có nhật ký quẹt thẻ.
                                    </Typography>
                                ) : (
                                    <Box className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                                        {rawLogs.map((log) => (
                                            <Box key={log.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                <Box className="flex items-center gap-3">
                                                    {log.photoUrl ? (
                                                        <Tooltip title="Nhấp để xem ảnh lớn" arrow>
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
                                                            Lượt quét: {dayjs(log.recordTime).format('HH:mm')}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-muted-foreground block">
                                                            IP: <span className="font-mono text-foreground font-semibold">{log.ipAddress || 'Unknown'}</span> | {log.deviceType || 'Web Browser'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Chip 
                                                    label={log.recordType === 'CHECK_IN' ? 'VÀO' : 'RA'} 
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
                                    <span className="font-bold text-foreground">Ghi chú duyệt công:</span> {detailTimesheet.note}
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
