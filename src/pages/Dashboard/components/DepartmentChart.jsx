import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, Zoom, Skeleton } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DepartmentChart = ({ departmentDistribution, loading }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const isLight = theme.palette.mode === 'light';

    if (loading) {
        return (
            <Card
                sx={{
                    borderRadius: '16px',
                    boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${isLight ? '#e5eaf2' : 'rgba(255, 255, 255, 0.08)'}`,
                    height: '100%'
                }}
            >
                <CardContent sx={{ p: '24px !important' }}>
                    <Skeleton variant="text" width="40%" height={24} className="mb-6" />
                    <div className="flex flex-col items-center justify-center py-4">
                        <Skeleton variant="circular" width={180} height={180} />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Beautiful matching colors for departments
    const COLORS = ['#1976D2', '#26A69A', '#FFA726', '#AB47BC', '#EF5350', '#78909C'];

    const totalStaffCount = departmentDistribution?.reduce((acc, curr) => acc + curr.staffCount, 0) || 0;

    const handlePieClick = (data) => {
        if (data && data.payload && data.payload.departmentId) {
            navigate(`/staff/all?departmentId=${data.payload.departmentId}`);
        } else {
            navigate('/staff/all');
        }
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
                <CardContent sx={{ p: '20px !important', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
                        {t('dashboard.dept.title', 'Phân bố nhân sự theo phòng ban')}
                    </Typography>

                    {departmentDistribution && departmentDistribution.length > 0 ? (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: 3, 
                            flexGrow: 1,
                            '@media (min-width: 640px)': {
                                flexDirection: 'row'
                            },
                            '@media (min-width: 1024px)': {
                                flexDirection: 'column'
                            },
                            '@media (min-width: 1280px)': {
                                flexDirection: 'row'
                            }
                        }}>
                            <Box sx={{ 
                                width: '100%', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                position: 'relative',
                                '@media (min-width: 640px)': {
                                    width: '45%'
                                },
                                '@media (min-width: 1024px)': {
                                    width: '100%'
                                },
                                '@media (min-width: 1280px)': {
                                    width: '45%'
                                }
                            }}>
                                <Box sx={{ 
                                    width: '100%', 
                                    height: 200, 
                                    position: 'relative', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    '@media (min-width: 640px)': {
                                        height: 240
                                    },
                                    '@media (min-width: 1024px)': {
                                        height: 200
                                    },
                                    '@media (min-width: 1280px)': {
                                        height: 240
                                    }
                                }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip 
                                                formatter={(value, name, props) => [`${value} nhân sự (${props.payload.percentage}%)`, name]}
                                                contentStyle={{ 
                                                    backgroundColor: isLight ? '#ffffff' : '#1f2327',
                                                    borderColor: isLight ? '#e5eaf2' : 'rgba(255,255,255,0.08)',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                                                }}
                                            />
                                            <Pie
                                                data={departmentDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="58%"
                                                outerRadius="80%"
                                                paddingAngle={3}
                                                dataKey="staffCount"
                                                nameKey="departmentName"
                                                onClick={handlePieClick}
                                                cursor="pointer"
                                            >
                                                {departmentDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    
                                    {/* Central Headcount Label */}
                                    <Box sx={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                                            {totalStaffCount}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                            {t('dashboard.dept.total', 'Tổng số')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ 
                                width: '100%',
                                '@media (min-width: 640px)': {
                                    width: '55%'
                                },
                                '@media (min-width: 1024px)': {
                                    width: '100%'
                                },
                                '@media (min-width: 1280px)': {
                                    width: '55%'
                                }
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 1.2, 
                                    maxHeight: '180px', 
                                    overflowY: 'auto', 
                                    px: 1,
                                    '@media (min-width: 640px)': {
                                        maxHeight: '240px'
                                    },
                                    '@media (min-width: 1024px)': {
                                        maxHeight: '180px'
                                    },
                                    '@media (min-width: 1280px)': {
                                        maxHeight: '240px'
                                    },
                                    '&::-webkit-scrollbar': {
                                        display: 'none'
                                    },
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                }}>
                                    {departmentDistribution.map((item, index) => (
                                        <Box 
                                            key={index} 
                                            onClick={() => item?.departmentId && navigate(`/department`)}
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                p: '6px 12px',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: isLight ? 'rgba(25, 118, 210, 0.06)' : 'rgba(255, 255, 255, 0.05)',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }} />
                                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.85rem' }}>
                                                    {item?.departmentName}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', ml: 1 }}>
                                                {item?.staffCount} ({item?.percentage}%)
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', height: '100%', flexGrow: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('dashboard.dept.no_data', 'Không có dữ liệu phòng ban')}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Zoom>
    );
};

export default DepartmentChart;
