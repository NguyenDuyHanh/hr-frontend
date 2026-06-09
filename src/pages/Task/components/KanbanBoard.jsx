import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Box, Paper, Typography, IconButton, Tooltip, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskCard from './TaskCard';
import useTaskStore from '../../../store/useTaskStore';

const KanbanBoard = ({ onAddTask }) => {
    const { 
        kanbanStatuses, 
        kanbanTasks, 
        kanbanTotals, 
        kanbanLoading, 
        modifyTaskStatus,
        loadMoreKanbanTasks
    } = useTaskStore();

    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Bỏ qua nếu kéo ra ngoài hoặc kéo về chỗ cũ
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        // Gọi action cập nhật trạng thái của task
        modifyTaskStatus(draggableId, destination.droppableId);
    };

    if (kanbanLoading && kanbanStatuses.length === 0) {
        return (
            <Box className="flex justify-center items-center py-12">
                <Typography className="text-gray-500">Đang tải bảng Kanban...</Typography>
            </Box>
        );
    }

    if (kanbanStatuses.length === 0) {
        return (
            <Box className="flex justify-center items-center py-12 border border-dashed border-border rounded-md">
                <Typography className="text-gray-400">Dự án này chưa được cấu hình các trạng thái công việc.</Typography>
            </Box>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Box className="flex overflow-x-auto gap-2 pb-4 select-none min-h-[300px] items-stretch mt-4">
                {kanbanStatuses.map((status) => {
                    const columnTasks = kanbanTasks.filter((t) => t.statusId === status.id);
                    const taskCount = kanbanTotals[status.id] !== undefined ? kanbanTotals[status.id] : columnTasks.length;

                    return (
                        <Box key={status.id} className="flex flex-col min-w-[220px] w-[220px] bg-gray-50 dark:bg-gray-800/20 border border-border rounded-lg overflow-hidden">
                            {/* Column Header */}
                            <Box 
                                className="p-3 flex justify-between items-center bg-white dark:bg-gray-800 border-b border-border rounded-t-lg"
                                style={{ borderTop: `4px solid ${status.color || '#ccc'}` }}
                            >
                                <Box className="flex items-center space-x-2">
                                    <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                                        {status.name}
                                    </Typography>
                                    <span 
                                        className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    >
                                        {taskCount}
                                    </span>
                                </Box>
                                <Tooltip title="Thêm công việc vào trạng thái này">
                                    <IconButton size="small" onClick={() => onAddTask(status.id)} color="primary">
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Inner Container wrapping Droppable and load more button */}
                            <Box className="flex-1 flex flex-col p-2">
                                {/* Droppable Area for Column Tasks */}
                                <Droppable droppableId={status.id}>
                                    {(provided, snapshot) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 min-h-[150px] transition-colors ${
                                                snapshot.isDraggingOver
                                                    ? 'bg-blue-50 dark:bg-blue-900/10'
                                                    : ''
                                            }`}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    index={index}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    )}
                                </Droppable>

                                {columnTasks.length < taskCount && (
                                    <Button
                                        size="small"
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => loadMoreKanbanTasks(status.id)}
                                        className="mt-1 normal-case text-xs text-muted-foreground border border-border"
                                    >
                                        Tải thêm
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </DragDropContext>
    );
};

export default KanbanBoard;
