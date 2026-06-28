import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, Zoom, Skeleton } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const StaffTrendChart = ({ staffTrend, loading }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';

    if (loading) {
        return (
            <Card
                sx={{
                    borderRadius: '16px',
                    boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${isLight ? '#e5eaf2' : 'rgba(255, 255, 255, 0.08)'}`,
                }}
            >
                <CardContent sx={{ p: '24px !important' }}>
                    <Skeleton variant="text" width="30%" height={24} className="mb-6" />
                    <Skeleton variant="rectangular" height={240} sx={{ borderRadius: '8px' }} />
                </CardContent>
            </Card>
        );
    }

    // Custom Tooltip component for premium styling
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        backgroundColor: isLight ? '#ffffff' : '#1f2327',
                        p: 1.5,
                        border: `1px solid ${isLight ? '#e5eaf2' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                        {t('dashboard.trend.month', 'Tháng')} {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {entry.name}: <strong>{entry.value}</strong>
                            </Typography>
                        </Box>
                    ))}
                </Box>
            );
        }
        return null;
    };

    return (
        <Zoom in={true}>
            <Card
                sx={{
                    borderRadius: '16px',
                    boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${isLight ? '#e5eaf2' : 'rgba(255, 255, 255, 0.08)'}`,
                    height: '100%'
                }}
            >
                <CardContent sx={{ p: '24px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {t('dashboard.trend.title', 'Biến động nhân sự (12 tháng)')}
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%', height: 300 }}>
                        {staffTrend && staffTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={staffTrend}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1976D2" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#1976D2" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorResignations" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF5350" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#EF5350" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#f1f5f9' : '#334155'} />
                                    <XAxis 
                                        dataKey="month" 
                                        stroke={theme.palette.text.secondary} 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke={theme.palette.text.secondary} 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        verticalAlign="top" 
                                        height={36} 
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '13px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        name={t('dashboard.trend.new_hires', 'Tuyển mới')} 
                                        dataKey="newHires" 
                                        stroke="#1976D2" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorHires)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        name={t('dashboard.trend.resignations', 'Nghỉ việc')} 
                                        dataKey="resignations" 
                                        stroke="#EF5350" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorResignations)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('dashboard.trend.no_data', 'Không có dữ liệu biến động')}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Zoom>
    );
};

export default StaffTrendChart;
