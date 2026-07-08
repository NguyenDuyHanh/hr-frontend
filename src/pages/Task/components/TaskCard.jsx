import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, Typography, Box, Chip, IconButton, Avatar, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '../../../constants/taskConstants';
import { formatDate } from '../../../LocalFunction';
import useTaskStore from '../../../store/useTaskStore';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { ROLES } from '../../../constants/roles';
import useAuthStore from '../../../store/useAuthStore';
import useProjectPermission from '../../../hooks/useProjectPermission';

const TaskCard = ({ task, index }) => {
    const { editTask, viewTask, initiateDelete } = useTaskStore();
    const hasRole = useAuthStore((state) => state.hasRole);

    const isSystemManager = hasRole([ROLES.ADMIN, ROLES.HR_MANAGER]);
    const { isProjectManager } = useProjectPermission(task.projectId);
    const canManage = isSystemManager || isProjectManager;

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const isOverdue = task.endTime && new Date(task.endTime) < new Date() && task.statusCode !== 'COMPLETED';

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    elevation={snapshot.isDragging ? 4 : 1}
                    className="mb-3 hover:shadow-md transition-shadow relative"
                    style={{
                        ...provided.draggableProps.style,
                        borderLeft: `4px solid ${TASK_PRIORITY_COLORS[task.priority] || '#ccc'}`,
                    }}
                >
                    <CardContent className="p-2 pb-2 !pb-2">
                        <Box className="flex justify-between items-center">
                            <Typography variant="caption" className="font-semibold text-primary">
                                {task.code}
                            </Typography>
                             <Box className="flex items-center space-x-0.5">
                                <Tooltip title="Xem chi tiết">
                                    <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => viewTask(task)}>
                                        <VisibilityIcon fontSize="inherit" style={{ fontSize: '14px' }} />
                                    </IconButton>
                                </Tooltip>
                                {canManage && (
                                    <>
                                        <Tooltip title="Sửa">
                                            <IconButton size="small" onClick={() => editTask(task)}>
                                                <EditIcon fontSize="inherit" style={{ fontSize: '14px' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Xóa">
                                            <IconButton size="small" color="error" onClick={() => initiateDelete(task)}>
                                                <DeleteIcon fontSize="inherit" style={{ fontSize: '14px' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </Box>
                        </Box>

                        <Typography variant="subtitle2" className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                            {task.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500 block">
                            Phụ trách: <span className="font-medium text-gray-600 dark:text-gray-400">{task.assigneeName}</span>
                        </Typography>
                        {task.activityName && (
                            <Typography variant="caption" className="text-gray-500 block">
                                Hoạt động: <span className="font-medium text-gray-600 dark:text-gray-400">{task.activityName}</span>
                            </Typography>
                        )}
                        <Typography variant="caption" className="text-gray-500 block">
                            Cập nhật cuối: <span className="font-medium text-gray-600 dark:text-gray-400">{formatDate(task.modifyDate, 'dd/MM/yyyy HH:mm')}</span>
                        </Typography>
                        <Divider className="my-2" />

                        <Box className="flex justify-between items-center mt-2">
                            <Box className="flex items-center space-x-1">
                                <CalendarTodayIcon style={{ fontSize: '12px', color: isOverdue ? '#f44336' : '#757575' }} />
                                <Typography 
                                    variant="caption" 
                                    style={{ color: isOverdue ? '#f44336' : '#757575' }}
                                    className={isOverdue ? 'font-semibold' : ''}
                                >
                                    {task.startTime ? formatDate(task.startTime, "dd/MM") : '—'}
                                </Typography>
                            </Box>

                            <Box className="flex items-center space-x-2">
                                <Chip 
                                    label={TASK_PRIORITY_LABELS[task.priority]} 
                                    size="small"
                                    style={{
                                        backgroundColor: `${TASK_PRIORITY_COLORS[task.priority]}15`,
                                        color: TASK_PRIORITY_COLORS[task.priority],
                                        fontSize: '10px',
                                        height: '20px'
                                    }}
                                />
                                <Tooltip title={task.assigneeName || "Chưa có người phụ trách"}>
                                    <Avatar 
                                        sx={{ 
                                            width: 24, 
                                            height: 24, 
                                            fontSize: '10px',
                                            bgcolor: 'secondary.main'
                                        }}
                                    >
                                        {getInitials(task.assigneeName)}
                                    </Avatar>
                                </Tooltip>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Draggable>
    );
};

// Helper Divider component for visual separation
const Divider = ({ className }) => <div className={`h-[1px] bg-gray-100 dark:bg-gray-800 ${className}`} />;

export default TaskCard;
