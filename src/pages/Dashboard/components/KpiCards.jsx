import React from 'react';
import { Zoom, Skeleton } from '@mui/material';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EventNoteIcon from '@mui/icons-material/EventNote';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Sparkline Mock Data for fallback if summary doesn't have spark data
const defaultSparkData = [
    { value: 10 }, { value: 15 }, { value: 12 }, { value: 18 }, { value: 20 }, { value: 25 }
];

const KpiCards = ({ kpiSummary, loading }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800/40 p-6 flex flex-col justify-between h-36 bg-white dark:bg-slate-900/40 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '12px' }} />
                        </div>
                        <Skeleton variant="text" width="40%" height={40} />
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-dashed border-slate-200/60 dark:border-slate-700/40">
                            <Skeleton variant="text" width="50%" height={16} />
                            <Skeleton variant="rectangular" width={60} height={20} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Safe extraction of properties with default values
    const {
        totalStaff = 0,
        newStaffThisMonth = 0,
        newStaffLastMonth = 0,
        pendingTimesheetsToday = 0,
        pendingTimesheetsYesterday = 0,
        pendingLeaveRequests = 0,
        activeProjects = 0,
        nearDeadlineProjects = 0,
        staffTrendSpark = []
    } = kpiSummary || {};

    // Prepare sparkline data from staffTrendSpark
    const sparkData = staffTrendSpark && staffTrendSpark.length > 0 
        ? staffTrendSpark.map((v, i) => ({ id: i, value: v }))
        : defaultSparkData;

    // Calculate dynamic growth percentages
    const prevHeadcount = totalStaff - newStaffThisMonth;
    const staffGrowth = prevHeadcount > 0 
        ? ((newStaffThisMonth / prevHeadcount) * 100).toFixed(1) 
        : (totalStaff > 0 ? '100.0' : '0.0');

    const cards = [
        {
            title: t('dashboard.kpi.total_staff', 'Tổng nhân viên'),
            value: totalStaff,
            icon: <PeopleAltIcon sx={{ fontSize: '24px', color: '#1976D2' }} />,
            color: '#1976D2',
            gradient: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.02) 100%)',
            border: 'rgba(25, 118, 210, 0.12)',
            trend: `▲ +${staffGrowth}% ${t('dashboard.kpi.vs_last_month', 'vs tháng trước')}`,
            trendColor: '#2E7D32',
            sparkColor: '#1976D2',
            path: '/staff/all'
        },
        {
            title: t('dashboard.kpi.pending_timesheets', 'Chấm công chờ duyệt hôm nay'),
            value: pendingTimesheetsToday,
            icon: <FactCheckIcon sx={{ fontSize: '24px', color: '#2E7D32' }} />,
            color: '#2E7D32',
            gradient: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(46, 125, 50, 0.02) 100%)',
            border: 'rgba(46, 125, 50, 0.12)',
            trend: pendingTimesheetsToday > 0 
                ? `⚠ ${t('dashboard.kpi.need_approve', 'Yêu cầu xử lý ngay')}` 
                : t('dashboard.kpi.no_requests', 'Không có yêu cầu tồn đọng'),
            trendColor: pendingTimesheetsToday > 0 ? '#ED6C02' : '#5F6C7D',
            sparkColor: '#2E7D32',
            path: '/check-inout-result'
        },
        {
            title: t('dashboard.kpi.pending_leaves', 'Đơn nghỉ chờ duyệt'),
            value: pendingLeaveRequests,
            icon: <EventNoteIcon sx={{ fontSize: '24px', color: '#ED6C02' }} />,
            color: '#ED6C02',
            gradient: 'linear-gradient(135deg, rgba(237, 108, 2, 0.08) 0%, rgba(237, 108, 2, 0.02) 100%)',
            border: 'rgba(237, 108, 2, 0.12)',
            trend: pendingLeaveRequests > 0 ? `⚠ ${t('dashboard.kpi.need_approve', 'Yêu cầu xử lý ngay')}` : t('dashboard.kpi.no_requests', 'Không có đơn tồn đọng'),
            trendColor: pendingLeaveRequests > 0 ? '#ED6C02' : '#5F6C7D',
            sparkColor: '#ED6C02',
            path: '/leave-requests'
        },
        {
            title: t('dashboard.kpi.active_projects', 'Dự án đang triển khai'),
            value: activeProjects,
            icon: <RocketLaunchIcon sx={{ fontSize: '24px', color: '#7B1FA2' }} />,
            color: '#7B1FA2',
            gradient: 'linear-gradient(135deg, rgba(123, 31, 162, 0.08) 0%, rgba(123, 31, 162, 0.02) 100%)',
            border: 'rgba(123, 31, 162, 0.12)',
            trend: `${nearDeadlineProjects} ${t('dashboard.kpi.near_deadline', 'dự án sắp quá hạn')}`,
            trendColor: nearDeadlineProjects > 0 ? '#C94A38' : '#5F6C7D',
            sparkColor: '#7B1FA2',
            path: '/projects'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cards.map((card, index) => (
                <Zoom in={true} key={index}>
                    <div
                        onClick={() => navigate(card.path)}
                        style={{
                            background: card.gradient,
                            borderColor: card.border
                        }}
                        className="rounded-2xl border p-6 flex flex-col justify-between h-full transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer"
                    >
                        {/* Top Section */}
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-snug max-w-[75%]">
                                {card.title}
                            </span>
                            <div className="bg-white dark:bg-white/5 p-2 rounded-xl flex shadow-sm border border-slate-100/50 dark:border-white/5">
                                {card.icon}
                            </div>
                        </div>

                        {/* Value Section */}
                        <div className="flex items-baseline gap-1 mb-6">
                            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                                <CountUp end={card.value} duration={1.5} separator="." />
                            </h3>
                        </div>

                        {/* Bottom Divider and Trend Info */}
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-dashed border-slate-200/60 dark:border-slate-700/40">
                            <span 
                                className="text-xs font-semibold flex items-center gap-1"
                                style={{ color: card.trendColor }}
                            >
                                {card.trend}
                            </span>

                            {/* Mini Sparkline Chart */}
                            <div className="w-16 h-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparkData}>
                                        <defs>
                                            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={card.sparkColor} stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor={card.sparkColor} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={card.sparkColor}
                                            strokeWidth={1.5}
                                            fillOpacity={1}
                                            fill={`url(#grad-${index})`}
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </Zoom>
            ))}
        </div>
    );
};

export default KpiCards;
