import React, { useState, useEffect, useMemo } from 'react';
import { 
    Grid, Box, Card, CardContent, Typography, Button, 
    Chip, IconButton, Avatar, Tooltip,
    Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { 
    ChevronLeft, ChevronRight, VideocamOff, CalendarToday, ListAlt
} from '@mui/icons-material';
import dayjs from 'dayjs';

import useAuthStore from '../../store/useAuthStore';
import useTimesheetStore from '../../store/useTimesheetStore';
import Popup from '../../components/ui/Popup';

const TimekeepingCalendar = () => {
    const user = useAuthStore(state => state.user);
    const staffId = user?.staffId;

    const { 
        myTimesheets, loading: tsLoading, loadMyTimesheets, 
        rawLogs, loadRawLogs 
    } = useTimesheetStore();

    // Local states
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDayRecord, setSelectedDayRecord] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'

    // Helper to format shift time (removing seconds, e.g. "08:00:00" -> "08:00")
    const formatShiftTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
    };

    // Load monthly timesheets when month or staffId changes
    useEffect(() => {
        if (staffId) {
            const startOfMonth = currentDate.startOf('month').format('YYYY-MM-DD');
            const endOfMonth = currentDate.endOf('month').format('YYYY-MM-DD');
            loadMyTimesheets(staffId, startOfMonth, endOfMonth);
        }
    }, [staffId, currentDate, loadMyTimesheets]);

    // Calculate monthly summary statistics from myTimesheets
    const monthlySummary = useMemo(() => {
        let totalWorkRatio = 0;
        let totalStandardHours = 0;
        let totalOvertimeHours = 0;
        let totalLateMinutes = 0;
        let totalEarlyMinutes = 0;
        let daysPresent = 0;

        myTimesheets.forEach(ts => {
            totalWorkRatio += ts.totalWorkRatio || 0;
            totalStandardHours += ts.standardHours || 0;
            totalOvertimeHours += (ts.overtimeHours || 0) + (ts.weekendOvertimeHours || 0) + (ts.holidayOvertimeHours || 0);
            
            if (ts.totalWorkRatio && ts.totalWorkRatio > 0) {
                daysPresent++;
            }

            const details = ts.details || [];
            details.forEach(d => {
                totalLateMinutes += d.lateMinutes || 0;
                totalEarlyMinutes += d.earlyMinutes || 0;
            });
        });

        return {
            totalWorkRatio,
            totalStandardHours,
            totalOvertimeHours,
            totalLateMinutes,
            totalEarlyMinutes,
            daysPresent
        };
    }, [myTimesheets]);

    // Generate rows for table view (every actual day of the month)
    const tableRows = useMemo(() => {
        const daysInMonth = currentDate.daysInMonth();
        const rows = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const date = currentDate.date(d);
            const dateStr = date.format('YYYY-MM-DD');
            const record = myTimesheets.find(ts => ts.workingDate === dateStr);
            rows.push({
                day: d,
                dateStr,
                dateObj: date,
                record
            });
        }
        return rows;
    }, [currentDate, myTimesheets]);

    // Calendar Generation Helper
    const generateCalendarDays = () => {
        const startOfMonth = currentDate.startOf('month');
        const startDayOfWeek = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1; // Align Mon-Sun (Mon = 0, Sun = 6)
        const daysInMonth = currentDate.daysInMonth();
        
        const calendarCells = [];
        
        // Blank spaces for previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarCells.push({ day: null, dateStr: null });
        }
        
        // Days of this month
        for (let d = 1; d <= daysInMonth; d++) {
            const date = currentDate.date(d);
            calendarCells.push({
                day: d,
                dateStr: date.format('YYYY-MM-DD'),
                dateObj: date
            });
        }
        
        return calendarCells;
    };

    // Find timesheet for a date
    const getTimesheetForDate = (dateStr) => {
        if (!dateStr) return null;
        return myTimesheets.find(ts => ts.workingDate === dateStr);
    };

    // Status Chip Colors
    const getStatusChip = (status) => {
        switch (status) {
            case 'APPROVED':
                return <Chip label="Đã duyệt" size="small" className="bg-emerald-50 text-emerald-700 border border-emerald-200" />;
            case 'SUBMITTED':
                return <Chip label="Chờ duyệt" size="small" className="bg-amber-50 text-amber-700 border border-amber-200" />;
            case 'REJECTED':
                return <Chip label="Từ chối" size="small" className="bg-rose-50 text-rose-700 border border-rose-200" />;
            default:
                return <Chip label="Nháp" size="small" className="bg-gray-100 text-gray-600 border border-gray-200" />;
        }
    };

    const handleDayClick = async (cell) => {
        if (!cell.dateStr) return;
        
        // Show current local cached record first so it opens instantly
        const initialRecord = getTimesheetForDate(cell.dateStr) || { 
            workingDate: cell.dateStr,
            isNew: true 
        };
        setSelectedDayRecord(initialRecord);
        setDetailDialogOpen(true);

        if (staffId) {
            // Fetch raw records for this day (needed for the logs view list)
            await loadRawLogs(staffId, cell.dateStr);
        }
    };

    const calendarCells = generateCalendarDays();
    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <Box className="space-y-6">
            {/* Timesheet Card View */}
            <Card className="shadow-xs rounded-xs border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {/* Month navigation header */}
                <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-zinc-800 gap-4">
                    <Box>
                        <Typography variant="h6" className="font-bold text-gray-800 dark:text-gray-100">
                            Chi tiết lịch sử chấm công
                        </Typography>
                        <Typography variant="caption" className="text-gray-400 dark:text-gray-500">
                            Theo dõi và đối chiếu chi tiết các lượt check-in/out trong tháng
                        </Typography>
                    </Box>
                    
                    <Box className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <Tabs 
                            value={viewMode} 
                            onChange={(e, val) => setViewMode(val)}
                            indicatorColor="primary"
                            textColor="primary"
                            className="border border-gray-200 dark:border-zinc-800 rounded-lg p-0.5 min-h-0 bg-gray-50 dark:bg-zinc-950/20"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: '100%',
                                    borderRadius: '6px',
                                    zIndex: 0,
                                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(25, 118, 210, 0.08)'
                                },
                                '& .MuiTab-root': {
                                    minHeight: '32px',
                                    padding: '6px 16px',
                                    zIndex: 1,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s',
                                    color: 'hsl(var(--foreground) / 0.6)',
                                    '&.Mui-selected': {
                                        color: 'primary.main',
                                    }
                                }
                            }}
                        >
                            <Tab 
                                value="calendar" 
                                icon={<CalendarToday className="text-sm mr-1" sx={{ fontSize: '16px' }} />} 
                                iconPosition="start" 
                                label="Dạng Lịch" 
                            />
                            <Tab 
                                value="table" 
                                icon={<ListAlt className="text-sm mr-1" sx={{ fontSize: '16px' }} />} 
                                iconPosition="start" 
                                label="Dạng Bảng" 
                            />
                        </Tabs>

                        <Box className="flex items-center gap-2">
                            <IconButton 
                                onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}
                                className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400"
                                size="small"
                            >
                                <ChevronLeft />
                            </IconButton>
                            <Typography variant="subtitle1" className="font-bold text-gray-700 dark:text-gray-200 px-2 min-w-[120px] text-center">
                                Tháng {currentDate.format('MM / YYYY')}
                            </Typography>
                            <IconButton 
                                onClick={() => setCurrentDate(currentDate.add(1, 'month'))}
                                className="border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400"
                                size="small"
                            >
                                <ChevronRight />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                <CardContent className="p-6">
                    {viewMode === 'calendar' ? (
                        <Box>
                            {/* Days of week header */}
                            <Box className="grid grid-cols-7 gap-2 mb-2 text-center">
                                {daysOfWeek.map((day, index) => (
                                    <Typography 
                                        key={index} 
                                        variant="subtitle2" 
                                        className={`font-semibold py-2 text-gray-500 dark:text-gray-400 ${day === 'CN' || day === 'T7' ? 'text-red-500 dark:text-red-400' : ''}`}
                                    >
                                        {day}
                                    </Typography>
                                ))}
                            </Box>

                            {/* Calendar Days grid */}
                            <Box className="grid grid-cols-7 gap-2">
                                {calendarCells.map((cell, index) => {
                                    const isToday = cell.dateStr === dayjs().format('YYYY-MM-DD');
                                    const record = getTimesheetForDate(cell.dateStr);
                                    const isWeekend = cell.dateObj && (cell.dateObj.day() === 0 || cell.dateObj.day() === 6);

                                    return (
                                        <Box
                                            key={index}
                                            onClick={() => cell.day && handleDayClick(cell)}
                                            className={`
                                                min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all duration-200
                                                ${cell.day ? 'cursor-pointer hover:border-primary hover:shadow-sm' : 'bg-gray-50/50 dark:bg-zinc-950/10 border-transparent'}
                                                ${isToday ? 'border-primary ring-1 ring-primary' : 'border-gray-100 dark:border-zinc-800'}
                                                ${isWeekend ? 'bg-gray-50/70 dark:bg-zinc-950/30' : 'bg-white dark:bg-zinc-900'}
                                            `}
                                        >
                                            {cell.day ? (
                                                <>
                                                    <Box className="flex justify-between items-start">
                                                        <Typography 
                                                            variant="body2" 
                                                            className={`font-bold ${isToday ? 'text-primary' : isWeekend ? 'text-red-400 dark:text-red-500' : 'text-gray-700 dark:text-gray-200'}`}
                                                        >
                                                            {cell.day}
                                                        </Typography>
                                                        {record && (
                                                            <Box className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        )}
                                                    </Box>
                                                    {record ? (() => {
                                                         let minCheckIn = null;
                                                         let maxCheckOut = null;
                                                         let cellHours = 0;
                                                         const details = record.details || [];
                                                         
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
                                                                 if (diff > 0) cellHours += diff;
                                                             }
                                                         });

                                                         const displayHours = (record.standardHours !== undefined && record.standardHours !== null)
                                                             ? (record.standardHours + (record.overtimeHours || 0) + (record.weekendOvertimeHours || 0) + (record.holidayOvertimeHours || 0))
                                                             : cellHours;

                                                         return (
                                                             <Box className="space-y-1">
                                                                 <Box className="flex flex-col text-[10px] text-gray-500 dark:text-gray-400">
                                                                     <span>{minCheckIn ? minCheckIn.format('HH:mm') : '--:--'}</span>
                                                                     <span>{maxCheckOut ? maxCheckOut.format('HH:mm') : '--:--'}</span>
                                                                 </Box>
                                                                 <Box className="flex justify-between items-center text-[9px]">
                                                                     <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                                                                         {record.totalWorkRatio || 0}
                                                                     </span>
                                                                     {displayHours > 0 ? (
                                                                         <span className="text-primary font-semibold">
                                                                             {displayHours.toFixed(1)}
                                                                         </span>
                                                                     ) : null}
                                                                 </Box>
                                                             </Box>
                                                         );
                                                     })() : cell.day && (
                                                        <Box className="text-[10px] text-gray-300 dark:text-gray-600 italic">Vắng / Nghỉ</Box>
                                                     )}
                                                </>
                                            ) : null}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    ) : (
                        <Box className="overflow-x-auto">
                            <TableContainer component={Paper} className="shadow-none border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                                <Table size="small" aria-label="timesheet table" className="min-w-[800px]">
                                    <TableHead>
                                        <TableRow className="bg-gray-50 dark:bg-zinc-800/50">
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Ngày</TableCell>
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Giờ Vào/Ra</TableCell>
                                            <TableCell className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Ca áp dụng</TableCell>
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Công</TableCell>
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Giờ chuẩn</TableCell>
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Giờ OT</TableCell>
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Đi muộn</TableCell>
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Về sớm</TableCell>
                                            <TableCell align="center" className="font-bold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-zinc-800">Trạng thái</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableRows.map((row) => {
                                            const { day, dateStr, dateObj, record } = row;
                                            const isWeekend = dateObj.day() === 0 || dateObj.day() === 6;
                                            const isToday = dateStr === dayjs().format('YYYY-MM-DD');
                                            
                                            let minCheckIn = null;
                                            let maxCheckOut = null;
                                            let displayStd = 0;
                                            let displayOt = 0;
                                            let lateMinutes = 0;
                                            let earlyMinutes = 0;
                                            
                                            if (record) {
                                                const details = record.details || [];
                                                details.forEach(d => {
                                                    if (d.checkInTime) {
                                                        const ci = dayjs(d.checkInTime);
                                                        if (!minCheckIn || ci.isBefore(minCheckIn)) minCheckIn = ci;
                                                    }
                                                    if (d.checkOutTime) {
                                                        const co = dayjs(d.checkOutTime);
                                                        if (!maxCheckOut || co.isAfter(maxCheckOut)) maxCheckOut = co;
                                                    }
                                                    lateMinutes += d.lateMinutes || 0;
                                                    earlyMinutes += d.earlyMinutes || 0;
                                                });
                                                displayStd = record.standardHours || 0;
                                                displayOt = (record.overtimeHours || 0) + (record.weekendOvertimeHours || 0) + (record.holidayOvertimeHours || 0);
                                            }

                                            return (
                                                <TableRow 
                                                    key={day}
                                                    onClick={() => handleDayClick({ day, dateStr, dateObj })}
                                                    className={`
                                                        hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors
                                                        ${isToday ? 'bg-primary/5 dark:bg-primary/5' : ''}
                                                        ${isWeekend ? 'bg-gray-50/20 dark:bg-zinc-950/10' : ''}
                                                    `}
                                                >
                                                    {/* Day */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800">
                                                        <Box className="flex flex-col items-center">
                                                            <span className={`font-bold ${isToday ? 'text-primary' : isWeekend ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {day}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {dateObj.format('dddd') === 'Sunday' ? 'Chủ Nhật' : 
                                                                 dateObj.format('dddd') === 'Saturday' ? 'Thứ Bảy' : 
                                                                 dateObj.format('dddd') === 'Monday' ? 'Thứ Hai' : 
                                                                 dateObj.format('dddd') === 'Tuesday' ? 'Thứ Ba' : 
                                                                 dateObj.format('dddd') === 'Wednesday' ? 'Thứ Tư' : 
                                                                 dateObj.format('dddd') === 'Thursday' ? 'Thứ Năm' : 'Thứ Sáu'}
                                                            </span>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Check In / Out */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800 whitespace-nowrap">
                                                        {minCheckIn || maxCheckOut ? (
                                                            <Box className="text-xs space-y-0.5">
                                                                <div className="whitespace-nowrap">Vào: <span className="font-semibold text-emerald-600">{minCheckIn ? minCheckIn.format('HH:mm') : '--:--'}</span></div>
                                                                <div className="whitespace-nowrap">Ra: <span className="font-semibold text-indigo-600">{maxCheckOut ? maxCheckOut.format('HH:mm') : '--:--'}</span></div>
                                                            </Box>
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-600 text-xs">--:--</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Applied Shifts */}
                                                    <TableCell className="py-2.5 border-b border-gray-100 dark:border-zinc-800">
                                                        {record && record.details && record.details.length > 0 ? (
                                                            <Box className="space-y-0.5 text-xs">
                                                                {record.details.map((d, idx) => d.shift && (
                                                                    <div key={idx} className="font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                                        {d.shift.name} ({formatShiftTime(d.shift.startTime)} - {formatShiftTime(d.shift.endTime)})
                                                                    </div>
                                                                ))}
                                                            </Box>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">Nghỉ / Vắng</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Total Work Ratio */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800 font-bold text-emerald-600 text-sm">
                                                        {record ? `${record.totalWorkRatio || 0}` : '0'}
                                                    </TableCell>

                                                    {/* Standard Hours */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800 font-semibold text-gray-700 dark:text-gray-300">
                                                        {record ? `${displayStd.toFixed(2)}` : '0'}
                                                    </TableCell>

                                                    {/* OT Hours */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800 font-bold text-amber-600">
                                                        {record && displayOt > 0 ? `${displayOt.toFixed(2)}` : '0'}
                                                    </TableCell>

                                                    {/* Late minutes */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800">
                                                        {record && lateMinutes > 0 ? (
                                                            <Chip 
                                                                label={`${lateMinutes} phút`} 
                                                                size="small" 
                                                                className="bg-rose-50 text-rose-700 border border-rose-100 font-bold" 
                                                                sx={{ height: '20px', fontSize: '11px' }}
                                                            />
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-600">-</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Early minutes */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800">
                                                        {record && earlyMinutes > 0 ? (
                                                            <Chip 
                                                                label={`${earlyMinutes} phút`} 
                                                                size="small" 
                                                                className="bg-rose-50 text-rose-700 border border-rose-100 font-bold" 
                                                                sx={{ height: '20px', fontSize: '11px' }}
                                                            />
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-600">-</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Status */}
                                                    <TableCell align="center" className="py-2.5 border-b border-gray-100 dark:border-zinc-800">
                                                        {record ? getStatusChip(record.status) : (
                                                            <span className="text-gray-300 dark:text-gray-600 italic text-xs">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                        {/* Total Row */}
                                        <TableRow className="bg-gray-50 dark:bg-zinc-800/80 border-t-2 border-gray-200 dark:border-zinc-700">
                                            <TableCell align="center" className="py-3 font-extrabold text-gray-800 dark:text-gray-200 border-b-0">TỔNG CỘNG</TableCell>
                                            <TableCell align="center" className="py-3 border-b-0"></TableCell>
                                            <TableCell className="py-3 font-semibold text-gray-500 border-b-0">Tổng các ngày trong tháng</TableCell>
                                            <TableCell align="center" className="py-3 font-extrabold text-emerald-600 text-sm border-b-0">
                                                {monthlySummary.totalWorkRatio.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="center" className="py-3 font-extrabold text-blue-600 text-sm border-b-0">
                                                {monthlySummary.totalStandardHours.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="center" className="py-3 font-extrabold text-amber-600 text-sm border-b-0">
                                                {monthlySummary.totalOvertimeHours.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="center" className="py-3 font-extrabold text-rose-600 text-sm border-b-0">
                                                {monthlySummary.totalLateMinutes > 0 ? `${monthlySummary.totalLateMinutes}p` : '0p'}
                                            </TableCell>
                                            <TableCell align="center" className="py-3 font-extrabold text-rose-600 text-sm border-b-0">
                                                {monthlySummary.totalEarlyMinutes > 0 ? `${monthlySummary.totalEarlyMinutes}p` : '0p'}
                                            </TableCell>
                                            <TableCell align="center" className="py-3 border-b-0"></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Daily Timesheet Detail Dialog using shared Popup component */}
            <Popup
                open={detailDialogOpen}
                onClosePopup={() => setDetailDialogOpen(false)}
                title={selectedDayRecord ? `Chi tiết chấm công ngày ${dayjs(selectedDayRecord.workingDate).format('DD/MM/YYYY')}` : ''}
                size="sm"
                action={
                    <Button 
                        onClick={() => setDetailDialogOpen(false)} 
                        variant="contained" 
                        color="primary"
                        className="font-bold px-5 py-1.5 rounded-lg shadow-sm"
                    >
                        Đóng
                    </Button>
                }
            >
                {selectedDayRecord && (() => {
                    // Calculate overall day metrics from shift details
                    let minCheckIn = null;
                    let maxCheckOut = null;
                    let totalHours = 0;
                    const details = selectedDayRecord.details || [];
                    
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

                    const displayStandardHours = (selectedDayRecord.standardHours !== undefined && selectedDayRecord.standardHours !== null)
                        ? selectedDayRecord.standardHours
                        : localStdHours;

                    const displayOvertimeHours = (selectedDayRecord.overtimeHours !== undefined && selectedDayRecord.overtimeHours !== null)
                        ? ((selectedDayRecord.overtimeHours || 0) + (selectedDayRecord.weekendOvertimeHours || 0) + (selectedDayRecord.holidayOvertimeHours || 0))
                        : localOtHours;

                    const displayTotalHours = displayStandardHours + displayOvertimeHours;

                    return (
                        <Box className="space-y-4 pt-1 pb-1">
                            {/* Status panel */}
                            <Box className="flex justify-between items-center bg-muted p-3.5 rounded-xl border border-border">
                                <Box>
                                    <Typography variant="subtitle2" className="font-bold text-foreground">
                                        Trạng thái công ngày
                                    </Typography>
                                    <Typography variant="caption" className="text-muted-foreground">
                                        Thống kê ghi nhận chấm công hằng ngày
                                    </Typography>
                                </Box>
                                {selectedDayRecord.status && getStatusChip(selectedDayRecord.status)}
                            </Box>

                            {/* Summary Metrics */}
                            <Box className="grid grid-cols-2 gap-4">
                                <Box className="bg-muted p-3 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground block font-medium">Giờ vào</Typography>
                                    <Typography variant="body2" className="font-bold text-foreground mt-0.5">
                                        {minCheckIn ? minCheckIn.format('HH:mm') : '--:--'}
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-3 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground block font-medium">Giờ ra</Typography>
                                    <Typography variant="body2" className="font-bold text-foreground mt-0.5">
                                        {maxCheckOut ? maxCheckOut.format('HH:mm') : '--:--'}
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-3 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground block font-medium">Số công quy đổi</Typography>
                                    <Typography variant="body2" className="font-bold text-emerald-600 mt-0.5">
                                        {selectedDayRecord.totalWorkRatio || 0} công
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-3 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground block font-medium">Tổng số giờ làm</Typography>
                                    <Typography variant="body2" className="font-bold text-primary mt-0.5">
                                        {displayTotalHours.toFixed(2)} giờ
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-3 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground block font-medium">Giờ làm thường</Typography>
                                    <Typography variant="body2" className="font-bold text-indigo-600 mt-0.5">
                                        {displayStandardHours.toFixed(2)} giờ
                                    </Typography>
                                </Box>
                                <Box className="bg-muted p-3 rounded-xl text-center border border-border">
                                    <Typography variant="caption" className="text-muted-foreground block font-medium">Giờ tăng ca (OT)</Typography>
                                    <Typography variant="body2" className="font-bold text-amber-600 mt-0.5">
                                        {displayOvertimeHours.toFixed(2)} giờ
                                    </Typography>
                                </Box>
                            </Box>

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

                            {/* Raw log history list */}
                            <Box className="space-y-2 pt-1">
                                <Typography variant="subtitle2" className="font-bold text-foreground">
                                    Lịch sử chấm công
                                </Typography>
                                
                                {rawLogs.length === 0 ? (
                                    <Typography variant="body2" className="text-muted-foreground text-center py-4 bg-muted rounded-xl border border-border">
                                        Chưa ghi nhận lượt chấm công nào trong ngày này.
                                    </Typography>
                                ) : (
                                    <Box className="divide-y divide-border border border-border rounded-xl overflow-hidden max-h-[250px] overflow-y-auto">
                                        {rawLogs.map((log) => (
                                            <Box key={log.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                <Box className="flex items-center gap-3">
                                                    {log.photoUrl ? (
                                                        <Tooltip title="Xem ảnh chấm công" arrow>
                                                            <Avatar 
                                                                src={log.photoUrl} 
                                                                variant="rounded" 
                                                                className="cursor-pointer border border-border"
                                                                sx={{ width: 44, height: 44 }}
                                                                onClick={() => window.open(log.photoUrl, '_blank')}
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <Avatar variant="rounded" sx={{ width: 44, height: 44 }} className="bg-muted border border-border">
                                                            <VideocamOff className="text-muted-foreground" />
                                                        </Avatar>
                                                    )}

                                                    <Box>
                                                        <Typography variant="body2" className="font-semibold text-foreground">
                                                            Quét lúc: {dayjs(log.recordTime).format('HH:mm')}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-muted-foreground block mt-0.5">
                                                            IP: {log.ipAddress} | Thiết bị: {log.deviceType || 'Web Browser'}
                                                            {log.latitude && log.longitude && (
                                                                <> | GPS: <span className="font-mono text-foreground font-semibold">{log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}</span></>
                                                            )}
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

                            {selectedDayRecord.note && (
                                <Box className="mt-2 text-xs text-muted-foreground bg-muted p-2.5 rounded-lg border border-border">
                                    <span className="font-bold text-foreground">Ghi chú duyệt công:</span> {selectedDayRecord.note}
                                </Box>
                            )}
                        </Box>
                    );
                })()}
            </Popup>
        </Box>
    );
};

export default TimekeepingCalendar;
