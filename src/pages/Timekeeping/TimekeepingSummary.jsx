import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
    Button, Grid, Paper, Typography, Box
} from '@mui/material';
import { 
    Refresh
} from '@mui/icons-material';
import { Formik } from 'formik';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import Autocomplete from '../../components/ui/Autocomplete';
import DateTimePicker from '../../components/ui/DateTimePicker';
import { getDepartments, getStaffs } from '../../services/StaffService';
import { searchTimesheets, exportTimesheetsExcel } from '../../services/timesheetService';
import useAuthStore from '../../store/useAuthStore';

// Helper to format shift time (removing seconds, e.g. "08:00:00" -> "08:00")
const formatShiftTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
};

const TimekeepingSummary = () => {
    const user = useAuthStore(state => state.user);
    
    // UI states
    const [departments, setDepartments] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [timesheets, setTimesheets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');
    const [keywordFilter, setKeywordFilter] = useState('');

    // Table pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Active filters state
    const [filters, setFilters] = useState({
        departmentId: null,
        staffId: null,
        fromDate: dayjs().startOf('month').toDate(),
        toDate: dayjs().endOf('month').toDate()
    });

    const formikRef = useRef();

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

    // Load timesheet records
    const loadData = async () => {
        setLoading(true);
        try {
            const req = {
                pageIndex: 1,
                pageSize: 100000, // Fetch all for monthly/range aggregation
                fromDate: filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD') : null,
                toDate: filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD') : null,
                departmentId: filters.departmentId,
                staffId: filters.staffId
            };

            const response = await searchTimesheets(req);
            setTimesheets(response?.data?.content || []);
        } catch (error) {
            console.error('Error loading timesheets:', error);
            toast.error("Không thể tải dữ liệu chấm công");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    // Handle form submit
    const handleFormSubmit = (values) => {
        setFilters({
            departmentId: values.department?.id || null,
            staffId: values.staff?.id || null,
            fromDate: values.fromDate || null,
            toDate: values.toDate || null
        });
        setPage(1);
        setFilterOpen(false);
    };

    const handleApplyFilters = () => {
        formikRef.current?.handleSubmit();
    };

    const handleResetFilters = () => {
        formikRef.current?.resetForm();
        setFilters({
            departmentId: null,
            staffId: null,
            fromDate: dayjs().startOf('month').toDate(),
            toDate: dayjs().endOf('month').toDate()
        });
        setKeywordFilter('');
        setSearchDraft('');
        setPage(1);
    };

    // Auto-calculating active filters count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.departmentId) count++;
        if (filters.staffId) count++;
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

    // Filter staff members based on department filter
    const displayStaffList = useMemo(() => {
        if (!filters.departmentId) return staffList;
        return staffList.filter(s => s.department?.id === filters.departmentId);
    }, [staffList, filters.departmentId]);

    // 1. Multiple Employees Mode - Aggregated Totals
    const aggregatedData = useMemo(() => {
        if (filters.staffId) return []; // Skip in single employee mode

        // Filter staff based on active department & keyword filter
        const targetStaffs = staffList.filter(s => {
            if (filters.departmentId && s.department?.id !== filters.departmentId) return false;
            if (keywordFilter) {
                const kw = keywordFilter.toLowerCase();
                const codeMatch = s.staffCode?.toLowerCase().includes(kw);
                const nameMatch = s.displayName?.toLowerCase().includes(kw);
                if (!codeMatch && !nameMatch) return false;
            }
            return true;
        });

        return targetStaffs.map(staff => {
            // Find timesheets for this staff
            const staffTimesheets = timesheets.filter(t => t.staffId === staff.id);

            let totalWorkRatio = 0;
            let standardHours = 0;
            let overtimeHours = 0;
            let lateMinutes = 0;
            let earlyMinutes = 0;

            staffTimesheets.forEach(ts => {
                totalWorkRatio += ts.totalWorkRatio || 0;
                standardHours += ts.standardHours || 0;
                overtimeHours += (ts.overtimeHours || 0) + (ts.weekendOvertimeHours || 0) + (ts.holidayOvertimeHours || 0);

                const details = ts.details || [];
                details.forEach(d => {
                    lateMinutes += d.lateMinutes || 0;
                    earlyMinutes += d.earlyMinutes || 0;
                });
            });

            return {
                id: staff.id,
                staffCode: staff.staffCode || '---',
                displayName: staff.displayName || '---',
                departmentName: staff.departmentName || '---',
                positionName: staff.positionName || '---',
                totalWorkRatio,
                standardHours,
                overtimeHours,
                lateMinutes,
                earlyMinutes
            };
        });
    }, [timesheets, staffList, filters.departmentId, filters.staffId, keywordFilter]);

    // 2. Single Employee Mode - Day-by-Day List
    const singleEmployeeData = useMemo(() => {
        if (!filters.staffId) return [];

        const start = dayjs(filters.fromDate);
        const end = dayjs(filters.toDate);
        const daysDiff = end.diff(start, 'day');
        
        if (daysDiff < 0 || daysDiff > 92) return []; // Safeguard range

        const rows = [];
        const staff = staffList.find(s => s.id === filters.staffId);

        for (let i = 0; i <= daysDiff; i++) {
            const date = start.add(i, 'day');
            const dateStr = date.format('YYYY-MM-DD');
            const record = timesheets.find(ts => ts.workingDate === dateStr);

            rows.push({
                dateStr,
                dateObj: date,
                staffName: staff?.displayName || '---',
                staffCode: staff?.staffCode || '---',
                departmentName: staff?.departmentName || '---',
                record
            });
        }
        return rows;
    }, [timesheets, staffList, filters.staffId, filters.fromDate, filters.toDate]);

    // Single Employee Totals
    const singleEmployeeSummary = useMemo(() => {
        let totalWorkRatio = 0;
        let totalStandardHours = 0;
        let totalOvertimeHours = 0;
        let totalLateMinutes = 0;
        let totalEarlyMinutes = 0;

        singleEmployeeData.forEach(row => {
            if (row.record) {
                totalWorkRatio += row.record.totalWorkRatio || 0;
                totalStandardHours += row.record.standardHours || 0;
                totalOvertimeHours += (row.record.overtimeHours || 0) + (row.record.weekendOvertimeHours || 0) + (row.record.holidayOvertimeHours || 0);

                const details = row.record.details || [];
                details.forEach(d => {
                    totalLateMinutes += d.lateMinutes || 0;
                    totalEarlyMinutes += d.earlyMinutes || 0;
                });
            }
        });

        return {
            totalWorkRatio,
            totalStandardHours,
            totalOvertimeHours,
            totalLateMinutes,
            totalEarlyMinutes
        };
    }, [singleEmployeeData]);

    // Overall multiple employee summary of the current displayed list
    const overallAggregatedSummary = useMemo(() => {
        let totalWorkRatio = 0;
        let totalStandardHours = 0;
        let totalOvertimeHours = 0;
        let totalLateMinutes = 0;
        let totalEarlyMinutes = 0;

        aggregatedData.forEach(row => {
            totalWorkRatio += row.totalWorkRatio || 0;
            totalStandardHours += row.standardHours || 0;
            totalOvertimeHours += (row.overtimeHours || 0) + (row.weekendOvertimeHours || 0) + (row.holidayOvertimeHours || 0);
            totalLateMinutes += row.lateMinutes || 0;
            totalEarlyMinutes += row.earlyMinutes || 0;
        });

        return {
            totalWorkRatio,
            totalStandardHours,
            totalOvertimeHours,
            totalLateMinutes,
            totalEarlyMinutes
        };
    }, [aggregatedData]);

    // Excel Export Generator
    const handleExport = async () => {
        try {
            const req = {
                fromDate: filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD') : null,
                toDate: filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD') : null,
                departmentId: filters.departmentId,
                staffId: filters.staffId,
                keyword: keywordFilter || null
            };

            const blob = await exportTimesheetsExcel(req);
            return blob;
        } catch (error) {
            console.error("Failed to export Excel:", error);
            toast.error("Không thể xuất file báo cáo");
            return null;
        }
    };

    // Table view definitions based on mode
    const columns = useMemo(() => {
        if (filters.staffId) {
            // Day-by-day Columns (1 Employee)
            return [
                {
                    title: 'Ngày',
                    field: 'dateStr',
                    width: 120,
                    align: 'center',
                    render: (row) => <span className="font-semibold">{row.dateObj.format('DD/MM/YYYY')}</span>
                },
                {
                    title: 'Thứ',
                    field: 'dayOfWeek',
                    width: 100,
                    align: 'center',
                    render: (row) => {
                        const day = row.dateObj.format('dddd');
                        return (
                            <span className={day === 'Sunday' || day === 'Saturday' ? 'text-red-500 font-medium' : 'text-gray-500'}>
                                {day === 'Sunday' ? 'Chủ Nhật' : 
                                 day === 'Saturday' ? 'Thứ Bảy' : 
                                 day === 'Monday' ? 'Thứ Hai' : 
                                 day === 'Tuesday' ? 'Thứ Ba' : 
                                 day === 'Wednesday' ? 'Thứ Tư' : 
                                 day === 'Thursday' ? 'Thứ Năm' : 'Thứ Sáu'}
                            </span>
                        );
                    }
                },
                {
                    title: 'Giờ vào/ra',
                    width: 140,
                    align: 'center',
                    render: (row) => {
                        if (!row.record) return <span className="text-gray-300 dark:text-gray-600">--:--</span>;
                        let minCi = null;
                        let maxCo = null;
                        const details = row.record.details || [];
                        
                        details.forEach(d => {
                            if (d.checkInTime) {
                                const ci = dayjs(d.checkInTime);
                                if (!minCi || ci.isBefore(minCi)) minCi = ci;
                            }
                            if (d.checkOutTime) {
                                const co = dayjs(d.checkOutTime);
                                if (!maxCo || co.isAfter(maxCo)) maxCo = co;
                            }
                        });

                        return (
                            <Box className="text-xs space-y-0.5">
                                <div>Vào: <span className="font-semibold text-emerald-600">{minCi ? minCi.format('HH:mm') : '--:--'}</span></div>
                                <div>Ra: <span className="font-semibold text-indigo-600">{maxCo ? maxCo.format('HH:mm') : '--:--'}</span></div>
                            </Box>
                        );
                    }
                },
                {
                    title: 'Ca áp dụng',
                    width: 180,
                    render: (row) => {
                        if (!row.record || !row.record.details || row.record.details.length === 0) {
                            return <span className="text-gray-400 italic text-xs">Vắng / Nghỉ</span>;
                        }
                        return (
                            <div className="space-y-0.5 text-xs">
                                {row.record.details.map((d, idx) => d.shift && (
                                    <div key={idx} className="font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                        {d.shift.name} ({formatShiftTime(d.shift.startTime)} - {formatShiftTime(d.shift.endTime)})
                                    </div>
                                ))}
                            </div>
                        );
                    }
                },
                {
                    title: 'Công',
                    field: 'totalWorkRatio',
                    align: 'center',
                    width: 90,
                    render: (row) => <span className="font-bold text-emerald-600">{row.record ? row.record.totalWorkRatio || 0 : '0'}</span>
                },
                {
                    title: 'Giờ chuẩn',
                    field: 'standardHours',
                    align: 'center',
                    width: 90,
                    render: (row) => <span>{row.record ? (row.record.standardHours || 0).toFixed(2) : '0.00'}</span>
                },
                {
                    title: 'Giờ OT',
                    field: 'overtimeHours',
                    align: 'center',
                    width: 90,
                    render: (row) => {
                        const ot = row.record ? (row.record.overtimeHours || 0) + (row.record.weekendOvertimeHours || 0) + (row.record.holidayOvertimeHours || 0) : 0;
                        return <span className="font-semibold text-amber-600">{ot > 0 ? ot.toFixed(2) : '0.00'}</span>;
                    }
                },
                {
                    title: 'Đi muộn',
                    align: 'center',
                    width: 90,
                    render: (row) => {
                        let late = 0;
                        if (row.record && row.record.details) {
                            row.record.details.forEach(d => late += d.lateMinutes || 0);
                        }
                        return late > 0 ? <span className="font-bold text-rose-600">{late}p</span> : <span className="text-gray-300">-</span>;
                    }
                },
                {
                    title: 'Về sớm',
                    align: 'center',
                    width: 90,
                    render: (row) => {
                        let early = 0;
                        if (row.record && row.record.details) {
                            row.record.details.forEach(d => early += d.earlyMinutes || 0);
                        }
                        return early > 0 ? <span className="font-bold text-rose-600">{early}p</span> : <span className="text-gray-300">-</span>;
                    }
                },
                {
                    title: 'Trạng thái',
                    field: 'status',
                    align: 'center',
                    width: 120,
                    render: (row) => {
                        if (!row.record) return <span className="text-gray-300 dark:text-gray-600">-</span>;
                        switch (row.record.status) {
                            case 'APPROVED':
                                return <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200 dark:border-emerald-900 rounded font-medium">Đã duyệt</span>;
                            case 'SUBMITTED':
                                return <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-200 dark:border-amber-900 rounded font-medium">Chờ duyệt</span>;
                            case 'REJECTED':
                                return <span className="text-xs px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-900 rounded font-medium">Từ chối</span>;
                            default:
                                return <span className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-zinc-800/30 text-gray-500 border border-gray-200 rounded font-medium">Nháp</span>;
                        }
                    }
                }
            ];
        } else {
            // Aggregated Summary Columns (Multiple Employees)
            return [
                {
                    title: 'Mã NV',
                    field: 'staffCode',
                    width: 100,
                    align: 'center',
                    render: (row) => <span className="font-semibold text-gray-700 dark:text-gray-300">{row.staffCode}</span>
                },
                {
                    title: 'Nhân viên',
                    field: 'displayName',
                    align: 'center',    
                    minWidth: 150,
                    render: (row) => <span className="font-bold text-gray-800 dark:text-gray-200">{row.displayName}</span>
                },
                {
                    title: 'Phòng ban',
                    field: 'departmentName',
                    width: 180,
                    align: 'center'
                },
                {
                    title: 'Vị trí',
                    field: 'positionName',
                    width: 150,
                    align: 'center'
                },
                {
                    title: 'Tổng công',
                    field: 'totalWorkRatio',
                    align: 'center',
                    width: 110,
                    render: (row) => <span className="font-extrabold text-emerald-600">{row.totalWorkRatio.toFixed(2)}</span>
                },
                {
                    title: 'Giờ chuẩn',
                    field: 'standardHours',
                    align: 'center',
                    width: 110,
                    render: (row) => <span className="font-semibold">{row.standardHours.toFixed(2)}</span>
                },
                {
                    title: 'Giờ OT',
                    field: 'overtimeHours',
                    align: 'center',
                    width: 110,
                    render: (row) => <span className="font-semibold text-amber-600">{row.overtimeHours.toFixed(2)}</span>
                },
                {
                    title: 'Đi muộn (phút)',
                    field: 'lateMinutes',
                    align: 'center',
                    width: 120,
                    render: (row) => row.lateMinutes > 0 ? <span className="font-bold text-rose-600">{row.lateMinutes}p</span> : <span className="text-gray-300">-</span>
                },
                {
                    title: 'Về sớm (phút)',
                    field: 'earlyMinutes',
                    align: 'center',
                    width: 120,
                    render: (row) => row.earlyMinutes > 0 ? <span className="font-bold text-rose-600">{row.earlyMinutes}p</span> : <span className="text-gray-300">-</span>
                }
            ];
        }
    }, [filters.staffId]);

    // Paginated list
    const paginatedData = useMemo(() => {
        const sourceData = filters.staffId ? singleEmployeeData : aggregatedData;
        const startIndex = (page - 1) * pageSize;
        return sourceData.slice(startIndex, startIndex + pageSize);
    }, [singleEmployeeData, aggregatedData, page, pageSize, filters.staffId]);

    const totalElements = useMemo(() => {
        return filters.staffId ? singleEmployeeData.length : aggregatedData.length;
    }, [singleEmployeeData, aggregatedData, filters.staffId]);

    return (
        <Box className="space-y-6">
            <Paper elevation={0} className="p-4 border border-border rounded-xl shadow-sm">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        department: initialDepartment,
                        staff: initialStaff,
                        fromDate: filters.fromDate,
                        toDate: filters.toDate
                    }}
                    enableReinitialize={true}
                    onSubmit={handleFormSubmit}
                >
                    {({ setFieldValue, values }) => (
                        <>
                            {/* Toolbar for quick search & toggle */}
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={() => setKeywordFilter(searchDraft)}
                                onReset={handleResetFilters}
                                showAdd={false}
                                onExport={handleExport}
                                exportFileName={
                                    filters.staffId 
                                        ? `ThongKeCong_ChiTiet_${staffList.find(s => s.id === filters.staffId)?.staffCode || ''}.xlsx`
                                        : `ThongKeTongCong.xlsx`
                                }
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: activeFilterCount
                                }}
                            />

                            {/* Slide-out Filters Panel */}
                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleResetFilters}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            name="department"
                                            label="Phòng ban"
                                            options={departments}
                                            getOptionLabel={(option) => option?.name || ''}
                                            onChange={(event, val) => {
                                                setFieldValue('department', val);
                                                // Clear selected staff if it does not belong to the selected department
                                                if (val && values.staff && values.staff.department?.id !== val.id) {
                                                    setFieldValue('staff', null);
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            name="staff"
                                            label="Nhân viên"
                                            options={displayStaffList}
                                            getOptionLabel={(option) => option ? `${option.displayName} (${option.staffCode})` : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateTimePicker
                                            label="Từ ngày"
                                            name="fromDate"
                                            notValueMillisecond={true}
                                            format="dd/MM/yyyy"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <DateTimePicker
                                            label="Đến ngày"
                                            name="toDate"
                                            notValueMillisecond={true}
                                            format="dd/MM/yyyy"
                                        />
                                    </Grid>
                                </Grid>
                            </FilterPanel>
                        </>
                    )}
                </Formik>

                {/* Table View */}
                <Table 
                    columns={columns}
                    data={paginatedData}
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>
        </Box>
    );
};

export default TimekeepingSummary;
