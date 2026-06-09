import React, { useEffect, useState, useRef } from 'react';
import { Paper, Tabs, Tab, Box, Typography, Button, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { Formik } from 'formik';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// UI components
import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import TaskListFilter from './components/TaskListFilter';
import TaskFormDialog from './components/TaskFormDialog';
import KanbanBoard from './components/KanbanBoard';
import { TabComponent } from '../../components/ui/Tab';

// Zustand stores
import useTaskStore from '../../store/useTaskStore';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '../../constants/taskConstants';
import { formatDate } from '../../LocalFunction';
import localStorageService from '../../services/localStorageService';

const TaskList = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(1); // 0 = Table, 1 = Kanban
    const [filterOpen, setFilterOpen] = useState(false);

    const {
        tasks,
        loadTasks,
        removeTask,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalElements,
        openForm,
        setOpenForm,
        selectedTask,
        setSelectedTask,
        keyword,
        setKeyword,
        filters,
        setFilters,
        loadKanbanData,
        openConfirm,
        setOpenConfirm,
        taskToDelete,
        setTaskToDelete,
        editTask,
        initiateDelete
    } = useTaskStore();

    const formikRef = useRef();
    const [searchDraft, setSearchDraft] = useState(keyword || '');

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    // Load tasks for table view
    useEffect(() => {
        if (activeTab === 0) {
            loadTasks();
        }
    }, [page, pageSize, keyword, filters, activeTab]);

    // Load Kanban data when tab changes or project filter changes
    useEffect(() => {
        if (activeTab === 1 && filters.projectId) {
            const projId = filters.projectId?.id || filters.projectId;
            loadKanbanData(projId);
        }
    }, [filters.projectId, filters.assigneeId, filters.priority, filters.followerId, filters.activityId, activeTab]);

    const handleSearch = () => {
        setKeyword(searchDraft);
    };

    const handleReset = () => {
        setSearchDraft('');
        localStorageService.removeItem('task_filter_project');
        localStorageService.removeItem('task_filter_assignee');
        formikRef.current?.resetForm({
            values: {
                projectId: null,
                assigneeId: null,
                priority: '',
                followerId: null,
                statusId: null,
                activityId: null
            }
        });
        setKeyword('');
        setFilters({});
    };

    const handleApplyFilters = () => {
        setKeyword(searchDraft);
        formikRef.current?.handleSubmit();
    };

    const handleAdd = () => {
        const selectedProj = formikRef.current?.values?.projectId;
        const savedProject = localStorageService.getItem('task_filter_project');
        if (selectedProj) {
            setSelectedTask({ projectId: selectedProj });
        } else if (savedProject) {
            setSelectedTask({ projectId: savedProject });
        } else if (filters.projectId) {
            setSelectedTask({ projectId: filters.projectId });
        } else {
            setSelectedTask(null);
        }
        setOpenForm(true);
    };

    const handleAddForStatus = (statusId) => {
        const savedProject = localStorageService.getItem('task_filter_project');
        setSelectedTask({
            projectId: savedProject || filters.projectId,
            statusId: statusId
        });
        setOpenForm(true);
    };

    const confirmDelete = async () => {
        if (taskToDelete?.id) {
            await removeTask(taskToDelete.id);
            toast.success("Xóa công việc thành công");
            setTaskToDelete(null);
            setOpenConfirm(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const columns = [
        {
            title: 'Thao tác',
            field: 'actions',
            width: 130,
            align: 'center',
            render: (rowData) => (
                <div className="flex items-center justify-center space-x-1">
                    <IconButton size="small" color="primary" onClick={() => editTask(rowData)} title="Sửa">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => initiateDelete(rowData)} title="Xóa">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </div>
            )
        },
        {
            title: 'Mã',
            field: 'code',
            width: 120,
            render: (rowData) => <span className="font-semibold text-primary">{rowData.code}</span>
        },
        {
            title: 'Tên công việc',
            field: 'name',
            minWidth: 200,
            render: (rowData) => <span className="font-semibold">{rowData.name}</span>
        },
        {
            title: 'Dự án',
            field: 'projectName',
            minWidth: 150,
            render: (rowData) => <span>{rowData.projectName || '—'}</span>
        },
        {
            title: 'Hoạt động',
            field: 'activityName',
            width: 150,
            render: (rowData) => <span>{rowData.activityName || '—'}</span>
        },
        {
            title: 'Trạng thái',
            field: 'statusName',
            width: 130,
            render: (rowData) => (
                <Chip
                    label={rowData.statusName || '—'}
                    size="small"
                    style={{
                        backgroundColor: `${rowData.statusColor || '#1976d2'}15`,
                        color: rowData.statusColor || '#1976d2',
                        border: `1px solid ${rowData.statusColor || '#1976d2'}`
                    }}
                />
            )
        },
        {
            title: 'Người phụ trách',
            field: 'assigneeName',
            width: 150,
            render: (rowData) => <span>{rowData.assigneeName || '—'}</span>
        },
        {
            title: 'Độ ưu tiên',
            field: 'priority',
            width: 110,
            render: (rowData) => (
                <Chip
                    label={TASK_PRIORITY_LABELS[rowData.priority]}
                    size="small"
                    style={{
                        backgroundColor: `${TASK_PRIORITY_COLORS[rowData.priority]}15`,
                        color: TASK_PRIORITY_COLORS[rowData.priority]
                    }}
                />
            )
        },
        {
            title: 'Ngày tạo',
            field: 'createDate',
            width: 130,
            render: (rowData) => <span>{formatDate(rowData.createDate)}</span>
        }
    ];

    const currentProjectId = filters.projectId?.id || filters.projectId;

    return (
        <>
            <Paper elevation={0} className="p-4 border border-border">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        projectId: localStorageService.getItem('task_filter_project') || null,
                        assigneeId: localStorageService.getItem('task_filter_assignee') || null,
                        priority: '',
                        followerId: null,
                        statusId: null,
                        activityId: null
                    }}
                    onSubmit={(values) => {
                        const newFilters = {};
                        if (values.projectId) {
                            newFilters.projectId = values.projectId.id || values.projectId;
                            localStorageService.setItem('task_filter_project', values.projectId);
                            
                            if (values.assigneeId) {
                                newFilters.assigneeId = values.assigneeId.id || values.assigneeId;
                                localStorageService.setItem('task_filter_assignee', values.assigneeId);
                            } else {
                                localStorageService.removeItem('task_filter_assignee');
                            }

                            if (values.followerId) {
                                newFilters.followerId = values.followerId.id || values.followerId;
                            }
                            if (values.statusId) {
                                newFilters.statusId = values.statusId.id || values.statusId;
                            }
                            if (values.activityId) {
                                newFilters.activityId = values.activityId.id || values.activityId;
                            }
                        } else {
                            localStorageService.removeItem('task_filter_project');
                            localStorageService.removeItem('task_filter_assignee');
                        }
                        if (values.priority !== '') {
                            newFilters.priority = Number(values.priority);
                        }
                        setFilters(newFilters);
                    }}
                >
                    {() => (
                        <>
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                onAdd={handleAdd}
                                addLabel="Thêm công việc"
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: Object.keys(filters).length
                                }}
                            />

                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            >
                                <TaskListFilter />
                            </FilterPanel>
                        </>
                    )}
                </Formik>

                {(() => {
                    const tabList = [
                        {
                            label: 'Dạng danh sách',
                            content: (
                                <>
                                    {currentProjectId ? (
                                        <Box className="mt-4">
                                            <Table
                                                columns={columns}
                                                data={tasks}
                                                totalElements={totalElements}
                                                page={page}
                                                pageSize={pageSize}
                                                handleChangePage={(e, p) => setPage(p)}
                                                setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                                            />
                                        </Box>
                                    ) : (
                                        <Box className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-md bg-gray-50/50">
                                            <Typography className="text-gray-500 mb-2 font-medium">
                                                Vui lòng chọn Dự án ở phần lọc để hiển thị danh sách công việc
                                            </Typography>
                                            <Button variant="outlined" onClick={() => setFilterOpen(true)} startIcon={<AddIcon />}>
                                                Mở bộ lọc dự án
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            )
                        },
                        {
                            label: 'Bảng Kanban',
                            content: (
                                <>
                                    {currentProjectId ? (
                                        <KanbanBoard 
                                            onAddTask={handleAddForStatus} 
                                        />
                                    ) : (
                                        <Box className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-md bg-gray-50/50">
                                            <Typography className="text-gray-500 mb-2 font-medium">
                                                Vui lòng chọn Dự án ở phần lọc để hiển thị bảng Kanban
                                            </Typography>
                                            <Button variant="outlined" onClick={() => setFilterOpen(true)} startIcon={<AddIcon />}>
                                                Mở bộ lọc dự án
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            )
                        }
                    ];

                    return (
                        <TabComponent
                            tabList={tabList}
                            value={activeTab}
                            handleChange={handleTabChange}
                            hideIcon
                        />
                    );
                })()}
            </Paper>

            {/* Dialog Form Thêm/Sửa */}
            {openForm && (
                <TaskFormDialog
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    taskData={selectedTask}
                    onSaveSuccess={() => {
                        if (activeTab === 0) {
                            loadTasks();
                        } else if (currentProjectId) {
                            loadKanbanData(currentProjectId);
                        }
                    }}
                />
            )}

            {/* Dialog Xác nhận xóa */}
            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => setOpenConfirm(false)}
                onYesClick={confirmDelete}
                title="Xác nhận xóa công việc"
                text={`Bạn có chắc chắn muốn xóa công việc ${taskToDelete?.code} - "${taskToDelete?.name}"? Thao tác này không thể hoàn tác.`}
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </>
    );
};

export default TaskList;
