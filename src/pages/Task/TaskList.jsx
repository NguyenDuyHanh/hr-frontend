import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
import PermissionGuard from '../../components/auth/PermissionGuard';
import { ROLES } from '../../constants/roles';
import useAuthStore from '../../store/useAuthStore';
import useProjectPermission from '../../hooks/useProjectPermission';
import { useTasks, useDeleteTask } from './api';

const TaskList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const hasRole = useAuthStore((state) => state.hasRole);
    const username = useAuthStore((state) => state.user?.username) || '';
    const projectKey = username ? `task_filter_project_${username}` : 'task_filter_project';
    const assigneeKey = username ? `task_filter_assignee_${username}` : 'task_filter_assignee';
    const [activeTab, setActiveTab] = useState(1); // 0 = Table, 1 = Kanban
    const [filterOpen, setFilterOpen] = useState(false);

    const {
        removeTask,
        page,
        setPage,
        pageSize,
        setPageSize,
        openForm,
        setOpenForm,
        selectedTask,
        setSelectedTask,
        isViewMode,
        setIsViewMode,
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
        viewTask,
        initiateDelete
    } = useTaskStore();

    const currentProjectId = filters.projectId?.id || filters.projectId;
    const { data: taskData, isFetching } = useTasks({
        pageIndex: page,
        pageSize,
        keyword,
        ...filters
    });
    const deleteTaskMutation = useDeleteTask();

    const { isProjectManager } = useProjectPermission(currentProjectId);
    const canManageTasks = hasRole([ROLES.ADMIN, ROLES.HR_MANAGER]) || isProjectManager;

    const formikRef = useRef();
    const [searchDraft, setSearchDraft] = useState(keyword || '');

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    // Đồng bộ bộ lọc từ localStorage vào store khi component mount hoặc username thay đổi
    useEffect(() => {
        if (username) {
            const savedProject = localStorageService.getItem(projectKey);
            const savedAssignee = localStorageService.getItem(assigneeKey);
            const initialFilters = {};
            if (savedProject) {
                initialFilters.projectId = savedProject.id || savedProject;
            }
            if (savedAssignee) {
                initialFilters.assigneeId = savedAssignee.id || savedAssignee;
            }
            if (JSON.stringify(initialFilters) !== JSON.stringify(filters)) {
                setFilters(initialFilters);
            }
        } else {
            setFilters({});
        }
    }, [username, projectKey, assigneeKey]);



    // Load Kanban data when tab changes or project filter changes
    useEffect(() => {
        if (activeTab === 1 && filters.projectId) {
            const projId = filters.projectId?.id || filters.projectId;
            loadKanbanData(projId);
        }
    }, [filters.projectId, filters.assigneeId, filters.priority, filters.activityId, keyword, activeTab]);

    const handleSearch = () => {
        setKeyword(searchDraft);
    };

    const handleReset = () => {
        setSearchDraft('');
        localStorageService.removeItem(projectKey);
        localStorageService.removeItem(assigneeKey);
        formikRef.current?.resetForm({
            values: {
                projectId: null,
                assigneeId: null,
                priority: '',
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
        setIsViewMode(false);
        const selectedProj = formikRef.current?.values?.projectId;
        const savedProject = localStorageService.getItem(projectKey);
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
        setIsViewMode(false);
        const savedProject = localStorageService.getItem(projectKey);
        setSelectedTask({
            projectId: savedProject || filters.projectId,
            statusId: statusId
        });
        setOpenForm(true);
    };

    const confirmDelete = async () => {
        if (taskToDelete?.id) {
            await deleteTaskMutation.mutateAsync(taskToDelete.id);
            setTaskToDelete(null);
            setOpenConfirm(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const columns = [
        {
            title: t('common.actions', 'Thao tác'),
            field: 'actions',
            width: 130,
            align: 'center',
            render: (rowData) => (
                <div className="flex items-center justify-center space-x-1">
                    <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => viewTask(rowData)} title={t('common.view_detail', 'Xem chi tiết')}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {canManageTasks && (
                        <>
                            <IconButton size="small" color="primary" onClick={() => editTask(rowData)} title={t('common.edit', 'Sửa')}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => initiateDelete(rowData)} title={t('common.delete', 'Xóa')}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                </div>
            )
        },
        {
            title: t('task.code', 'Mã'),
            field: 'code',
            width: 120,
            render: (rowData) => <span className="font-semibold text-primary">{rowData.code}</span>
        },
        {
            title: t('task.name', 'Tên công việc'),
            field: 'name',
            minWidth: 200,
            render: (rowData) => <span className="font-semibold">{rowData.name}</span>
        },
        {
            title: t('project.name', 'Dự án'),
            field: 'projectName',
            minWidth: 150,
            render: (rowData) => <span>{rowData.projectName || '—'}</span>
        },
        {
            title: t('task.activity', 'Hoạt động'),
            field: 'activityName',
            width: 150,
            render: (rowData) => <span>{rowData.activityName || '—'}</span>
        },
        {
            title: t('common.status', 'Trạng thái'),
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
            title: t('task.assignee', 'Người phụ trách'),
            field: 'assigneeName',
            width: 150,
            render: (rowData) => <span>{rowData.assigneeName || '—'}</span>
        },
        {
            title: t('task.priority', 'Độ ưu tiên'),
            field: 'priority',
            width: 110,
            render: (rowData) => (
                <Chip
                    label={t('task.priority_label.' + rowData.priority, TASK_PRIORITY_LABELS[rowData.priority])}
                    size="small"
                    style={{
                        backgroundColor: `${TASK_PRIORITY_COLORS[rowData.priority]}15`,
                        color: TASK_PRIORITY_COLORS[rowData.priority]
                    }}
                />
            )
        },
        {
            title: t('common.created_date', 'Ngày tạo'),
            field: 'createDate',
            width: 130,
            render: (rowData) => <span>{formatDate(rowData.createDate)}</span>
        }
    ];

    return (
        <>
            <Paper elevation={0} className="p-4 border border-border">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        projectId: localStorageService.getItem(projectKey) || null,
                        assigneeId: localStorageService.getItem(assigneeKey) || null,
                        priority: '',
                        statusId: null,
                        activityId: null
                    }}
                    onSubmit={(values) => {
                        const newFilters = {};
                        if (values.projectId) {
                            newFilters.projectId = values.projectId.id || values.projectId;
                            localStorageService.setItem(projectKey, values.projectId);
                            
                            if (values.assigneeId) {
                                newFilters.assigneeId = values.assigneeId.id || values.assigneeId;
                                localStorageService.setItem(assigneeKey, values.assigneeId);
                            } else {
                                localStorageService.removeItem(assigneeKey);
                            }

                            if (values.statusId) {
                                newFilters.statusId = values.statusId.id || values.statusId;
                            }
                            if (values.activityId) {
                                newFilters.activityId = values.activityId.id || values.activityId;
                            }
                        } else {
                            localStorageService.removeItem(projectKey);
                            localStorageService.removeItem(assigneeKey);
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
                                onAdd={canManageTasks ? handleAdd : undefined}
                                addLabel={t('task.add_btn', 'Thêm công việc')}
                                searchPlaceholder={t('task.search_placeholder', 'Tìm kiếm theo tên công việc...')}
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
                            label: t('task.tab_list', 'Dạng danh sách'),
                            content: (
                                <>
                                    {currentProjectId ? (
                                        <Box className="mt-4">
                                            <Table
                                                columns={columns}
                                                data={taskData?.content || []}
                                                totalElements={taskData?.totalElements || 0}
                                                page={page}
                                                pageSize={pageSize}
                                                handleChangePage={(e, p) => setPage(p)}
                                                setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                                                loading={isFetching}
                                            />
                                        </Box>
                                    ) : (
                                        <Box className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-md bg-gray-50/50">
                                            <Typography className="text-gray-500 mb-2 font-medium">
                                                {t('task.select_project_hint_list', 'Vui lòng chọn Dự án ở phần lọc để hiển thị danh sách công việc')}
                                            </Typography>
                                            <Button variant="outlined" onClick={() => setFilterOpen(true)} startIcon={<AddIcon />}>
                                                {t('task.open_filter_btn', 'Mở bộ lọc dự án')}
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            )
                        },
                        {
                            label: t('task.tab_kanban', 'Bảng Kanban'),
                            content: (
                                <>
                                    {currentProjectId ? (
                                        <KanbanBoard 
                                            onAddTask={handleAddForStatus} 
                                            canManage={canManageTasks}
                                        />
                                    ) : (
                                        <Box className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-md bg-gray-50/50">
                                            <Typography className="text-gray-500 mb-2 font-medium">
                                                {t('task.select_project_hint_kanban', 'Vui lòng chọn Dự án ở phần lọc để hiển thị bảng Kanban')}
                                            </Typography>
                                            <Button variant="outlined" onClick={() => setFilterOpen(true)} startIcon={<AddIcon />}>
                                                {t('task.open_filter_btn', 'Mở bộ lọc dự án')}
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
                    isViewMode={isViewMode}
                    onSaveSuccess={() => {
                        if (currentProjectId) {
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
                title={t('task.delete_confirm_title', 'Xác nhận xóa công việc')}
                text={t('task.delete_confirm_text', 'Bạn có chắc chắn muốn xóa công việc {{code}} - "{{name}}"? Thao tác này không thể hoàn tác.', { code: taskToDelete?.code, name: taskToDelete?.name })}
                agree={t('common.confirm', 'Xác nhận')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </>
    );
};

export default TaskList;
