import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, useTheme, Zoom, Skeleton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventNoteIcon from '@mui/icons-material/EventNote';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const RecentActivities = ({ recentActivities, loading }) => {
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
                    height: '100%'
                }}
            >
                <CardContent sx={{ p: '24px !important' }}>
                    <Skeleton variant="text" width="30%" height={24} className="mb-6" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <Skeleton variant="circular" width={40} height={40} className="shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton variant="text" width="70%" />
                                    <Skeleton variant="text" width="30%" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Get color & icon based on activity type
    const getActivityConfig = (type) => {
        switch (type) {
            case 'STAFF':
                return {
                    color: '#2E7D32',
                    bgColor: isLight ? 'rgba(46, 125, 50, 0.1)' : 'rgba(102, 187, 106, 0.2)',
                    icon: <PersonAddIcon sx={{ fontSize: '18px', color: '#2E7D32' }} />
                };
            case 'LEAVE':
                return {
                    color: '#ED6C02',
                    bgColor: isLight ? 'rgba(237, 108, 2, 0.1)' : 'rgba(255, 183, 77, 0.2)',
                    icon: <EventNoteIcon sx={{ fontSize: '18px', color: '#ED6C02' }} />
                };
            case 'PROJECT':
                return {
                    color: '#7B1FA2',
                    bgColor: isLight ? 'rgba(123, 31, 162, 0.1)' : 'rgba(186, 104, 200, 0.2)',
                    icon: <RocketLaunchIcon sx={{ fontSize: '18px', color: '#7B1FA2' }} />
                };
            default:
                return {
                    color: '#1976D2',
                    bgColor: isLight ? 'rgba(25, 118, 210, 0.1)' : 'rgba(102, 179, 255, 0.2)',
                    icon: <WorkOutlineIcon sx={{ fontSize: '18px', color: '#1976D2' }} />
                };
        }
    };

    return (
        <Zoom in={true}>
            <Card
                sx={{
                    borderRadius: '16px',
                    boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.15)',
                    border: `1px solid ${isLight ? '#e5eaf2' : 'rgba(255, 255, 255, 0.08)'}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <CardContent className="!p-6 flex flex-col h-full">
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary" className="mb-6">
                        {t('dashboard.activity.title', 'Hoạt động gần đây')}
                    </Typography>

                    {recentActivities && recentActivities.length > 0 ? (
                        <Box className="relative max-h-[350px] overflow-y-auto flex-grow no-scrollbar">
                            {recentActivities.map((act, index) => {
                                const cfg = getActivityConfig(act.type);
                                return (
                                    <div 
                                        key={index} 
                                        className="relative mb-6 last:mb-0 flex items-start gap-4"
                                    >

                                        {/* Avatar / Thumbnail */}
                                        <Avatar 
                                            src={act.staffAvatar} 
                                            alt={act.staffName}
                                            className="text-[0.85rem] font-semibold"
                                            style={{ 
                                                width: 36,
                                                height: 36,
                                                backgroundColor: cfg.bgColor,
                                                color: cfg.color
                                            }}
                                        >
                                            {act.staffName ? act.staffName.substring(0, 1).toUpperCase() : '?'}
                                        </Avatar>

                                        {/* Text content */}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <Typography variant="body2" fontWeight={600} color="text.primary" className="text-sm">
                                                    {act.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" className="text-xs ml-2 whitespace-nowrap">
                                                    {dayjs(act.timestamp).fromNow()}
                                                </Typography>
                                            </div>
                                            <Typography variant="body2" color="text.secondary" className="text-[13px] leading-relaxed">
                                                {act.description}
                                            </Typography>
                                        </div>
                                    </div>
                                );
                            })}
                        </Box>
                    ) : (
                        <div className="flex h-full flex-grow items-center justify-center min-h-[200px]">
                            <Typography variant="body2" color="text.secondary">
                                {t('dashboard.activity.no_data', 'Không có hoạt động nào gần đây')}
                            </Typography>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Zoom>
    );
};

export default RecentActivities;
