import React, { useEffect } from 'react';
import { CircularProgress, Alert } from '@mui/material';
import KpiCards from './components/KpiCards';
import StaffTrendChart from './components/StaffTrendChart';
import DepartmentChart from './components/DepartmentChart';
import RecentActivities from './components/RecentActivities';
import PendingLeaves from './components/PendingLeaves';
import OverviewCharts from './components/OverviewCharts';
import useDashboardStore from '../../store/useDashboardStore';

const DashboardPage = () => {
    const { summary, loading, error, fetchSummary } = useDashboardStore();

    useEffect(() => {
        fetchSummary();
        
        // Auto refresh dashboard data every 2 minutes
        const interval = setInterval(() => {
            fetchSummary();
        }, 120000);

        return () => clearInterval(interval);
    }, [fetchSummary]);

    const isFirstLoad = loading && !summary;

    if (error) {
        return (
            <div className="p-4">
                <Alert severity="error" variant="filled" className="rounded-xl">
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Row 2: KPI Summary Cards */}
            <KpiCards kpiSummary={summary?.kpiSummary} loading={isFirstLoad} />

            {/* Row 3: Fluctuation & Department Distribution Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
                <div className="xl:col-span-7">
                    <StaffTrendChart staffTrend={summary?.staffTrend} loading={isFirstLoad} />
                </div>
                <div className="xl:col-span-5">
                    <DepartmentChart departmentDistribution={summary?.departmentDistribution} loading={isFirstLoad} />
                </div>
            </div>

            {/* Row 4: Recent Activities & Pending Leaves Approval */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <RecentActivities recentActivities={summary?.recentActivities} loading={isFirstLoad} />
                </div>
                <div>
                    <PendingLeaves pendingLeaves={summary?.pendingLeaves} loading={isFirstLoad} />
                </div>
            </div>

            {/* Row 5: Company Projects & Recruitment Pipelines */}
            <OverviewCharts 
                projectOverview={summary?.projectOverview} 
                recruitmentPipeline={summary?.recruitmentPipeline} 
                loading={isFirstLoad}
            />
        </div>
    );
};

export default DashboardPage;
