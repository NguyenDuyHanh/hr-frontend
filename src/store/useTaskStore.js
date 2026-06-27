import { create } from 'zustand';
import { 
    pagingTasks, 
    getTasksForKanban,
    getTaskById, 
    saveTask, 
    deleteTask, 
    updateTaskStatus, 
    getTaskHistory, 
    addTaskComment, 
    updateTaskComment, 
    deleteTaskComment,
    countTasksByStatus
} from '../services/taskService';
import { getProjectWorkingStatuses } from '../services/projectService';
import localStorageService from '../services/localStorageService';
import useAuthStore from './useAuthStore';

const KANBAN_PAGE_SIZE = 10;

const useTaskStore = create((set, get) => ({
    tasks: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: (() => {
        const username = useAuthStore.getState().user?.username || '';
        const projectKey = username ? `task_filter_project_${username}` : 'task_filter_project';
        const assigneeKey = username ? `task_filter_assignee_${username}` : 'task_filter_assignee';

        const savedProject = localStorageService.getItem(projectKey);
        const savedAssignee = localStorageService.getItem(assigneeKey);
        const initialFilters = {};
        if (savedProject) {
            initialFilters.projectId = savedProject.id || savedProject;
        }
        if (savedAssignee) {
            initialFilters.assigneeId = savedAssignee.id || savedAssignee;
        }
        return initialFilters;
    })(),
    selectedTask: null,
    openForm: false,
    isViewMode: false,
    openConfirm: false,
    taskToDelete: null,

    // Kanban State
    kanbanTasks: [],
    kanbanStatuses: [],
    kanbanTotals: {},
    kanbanPages: {},   // { [statusId]: currentPageIndex }
    kanbanLoading: false,

    // History & Comments
    taskHistory: [],
    historyLoading: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedTask: (task) => set({ selectedTask: task }),
    setIsViewMode: (isViewMode) => set({ isViewMode }),
    setOpenConfirm: (open) => set({ openConfirm: open }),
    setTaskToDelete: (task) => set({ taskToDelete: task }),
    editTask: (task) => set({ selectedTask: task, openForm: true, isViewMode: false }),
    viewTask: (task) => set({ selectedTask: task, openForm: true, isViewMode: true }),
    initiateDelete: (task) => set({ taskToDelete: task, openConfirm: true }),
    resetStore: () => set({
        tasks: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedTask: null,
        openForm: false,
        isViewMode: false,
        openConfirm: false,
        taskToDelete: null,
        kanbanTasks: [],
        kanbanStatuses: [],
        kanbanTotals: {},
        kanbanPages: {},
        kanbanLoading: false,
        taskHistory: [],
        historyLoading: false,
    }),

    loadTasks: async () => {
        const { page, pageSize, keyword, filters } = get();
        const projectId = filters.projectId?.id || filters.projectId;
        if (!projectId) {
            set({ tasks: [], totalElements: 0, loading: false });
            return;
        }
        set({ loading: true });
        try {
            const assigneeId = filters.assigneeId?.id || filters.assigneeId;
            const statusId = filters.statusId?.id || filters.statusId;
            const activityId = filters.activityId?.id || filters.activityId;
            const priority = filters.priority;

            const searchParams = {
                pageIndex: page,
                pageSize,
                keyword,
                projectId,
                ...(assigneeId && { assigneeId }),
            };
            if (priority !== undefined && priority !== '') {
                searchParams.priorities = [priority];
            }
            if (statusId) {
                searchParams.statusIds = [statusId];
            }
            if (activityId) {
                searchParams.activityIds = [activityId];
            }

            const response = await pagingTasks(searchParams);
            set({
                tasks: response?.data?.content || [],
                totalElements: response?.data?.totalElements || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            set({ loading: false });
        }
    },

    loadKanbanData: async (projectId) => {
        if (!projectId) return;
        const projId = projectId?.id || projectId;
        set({ kanbanLoading: true });
        try {
            const { filters, keyword } = get();
            const assigneeId = filters.assigneeId?.id || filters.assigneeId;
            const activityId = filters.activityId?.id || filters.activityId;
            const priority = filters.priority;

            const baseParams = {
                projectId: projId,
                pageIndex: 1,
                pageSize: KANBAN_PAGE_SIZE,
                ...(assigneeId && { assigneeId }),
                ...(keyword && { keyword }),
            };
            if (priority !== undefined && priority !== '') {
                baseParams.priorities = [priority];
            }
            if (activityId) {
                baseParams.activityIds = [activityId];
            }

            // Gọi song song 3 APIs: statuses, tasks (trang 1 dạng phẳng) và totals
            const [statusRes, tasksRes, countsRes] = await Promise.all([
                getProjectWorkingStatuses(projId),
                getTasksForKanban(baseParams),
                countTasksByStatus(projId, baseParams)
            ]);

            const statuses = statusRes?.data || [];
            const allTasks = tasksRes?.data || [];
            const totals = countsRes?.data || {};

            const pages = {};
            statuses.forEach((status) => {
                pages[status.id] = 1;
                if (totals[status.id] === undefined) {
                    totals[status.id] = allTasks.filter(t => t.statusId === status.id).length;
                }
            });

            set({
                kanbanStatuses: statuses,
                kanbanTasks: allTasks,
                kanbanTotals: totals,
                kanbanPages: pages,
                kanbanLoading: false
            });
        } catch (error) {
            console.error('Error loading Kanban data:', error);
            set({ kanbanLoading: false });
        }
    },

    loadMoreKanbanTasks: async (statusId) => {
        const { kanbanPages, filters } = get();
        const projId = filters.projectId?.id || filters.projectId;
        if (!projId || !statusId) return;

        const currentPage = kanbanPages[statusId] || 1;
        const nextPage = currentPage + 1;

        const assigneeId = filters.assigneeId?.id || filters.assigneeId;
        const activityId = filters.activityId?.id || filters.activityId;
        const priority = filters.priority;

        const params = {
            projectId: projId,
            statusIds: [statusId],
            pageIndex: nextPage,
            pageSize: KANBAN_PAGE_SIZE,
            ...(assigneeId && { assigneeId }),
        };
        if (priority !== undefined && priority !== '') {
            params.priorities = [priority];
        }
        if (activityId) {
            params.activityIds = [activityId];
        }

        try {
            const response = await pagingTasks(params);
            const newTasks = response?.data?.content || [];
            if (newTasks.length > 0) {
                set({
                    kanbanTasks: [...get().kanbanTasks, ...newTasks],
                    kanbanPages: { ...kanbanPages, [statusId]: nextPage }
                });
            }
        } catch (error) {
            console.error('Error loading more kanban tasks:', error);
        }
    },

    loadTaskHistory: async (taskId) => {
        if (!taskId) return;
        set({ historyLoading: true });
        try {
            const response = await getTaskHistory(taskId);
            set({
                taskHistory: response?.data || [],
                historyLoading: false
            });
        } catch (error) {
            console.error('Error loading task history:', error);
            set({ historyLoading: false });
        }
    },

    addTask: async (task) => {
        try {
            const response = await saveTask(task);
            set({ openForm: false });
            return response?.data;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    },

    modifyTask: async (id, task) => {
        try {
            const response = await saveTask({ ...task, id });
            set({ openForm: false });
            return response?.data;
        } catch (error) {
            console.error('Error modifying task:', error);
            throw error;
        }
    },

    removeTask: async (id) => {
        try {
            await deleteTask(id);
            
            // Cập nhật local state cho Kanban board
            const prevKanbanTasks = get().kanbanTasks;
            const taskToDelete = prevKanbanTasks.find(t => t.id === id);
            
            if (taskToDelete) {
                const updatedKanbanTasks = prevKanbanTasks.filter(t => t.id !== id);
                const statusId = taskToDelete.statusId;
                const updatedTotals = { ...get().kanbanTotals };
                if (statusId && updatedTotals[statusId] !== undefined) {
                    updatedTotals[statusId] = Math.max(0, updatedTotals[statusId] - 1);
                }
                set({
                    kanbanTasks: updatedKanbanTasks,
                    kanbanTotals: updatedTotals
                });
            }

            // Cập nhật local state cho bảng danh sách tasks
            const prevTasks = get().tasks;
            const updatedTasks = prevTasks.filter(t => t.id !== id);
            if (prevTasks.length !== updatedTasks.length) {
                set({
                    tasks: updatedTasks,
                    totalElements: Math.max(0, get().totalElements - 1)
                });
            }
        } catch (error) {
            console.error('Error removing task:', error);
            // Re-fetch để đồng bộ lại nếu lỗi xảy ra
            const projId = get().filters.projectId?.id || get().filters.projectId;
            if (projId) {
                get().loadKanbanData(projId);
            }
            get().loadTasks();
        }
    },

    modifyTaskStatus: async (taskId, statusId) => {
        try {
            const prevTasks = get().kanbanTasks;
            const task = prevTasks.find(t => t.id === taskId);
            if (!task) return;
            const oldStatusId = task.statusId;
            const newStatus = get().kanbanStatuses.find(s => s.id === statusId);

            // Optimistic update cho Kanban board mượt mà
            const updatedTasks = prevTasks.map(t => 
                t.id === taskId ? { 
                    ...t, 
                    statusId, 
                    statusName: newStatus?.name,
                    statusCode: newStatus?.code,
                    statusColor: newStatus?.color
                } : t
            );

            // Cập nhật lại totals tương ứng
            const updatedTotals = { ...get().kanbanTotals };
            if (oldStatusId) {
                updatedTotals[oldStatusId] = Math.max(0, (updatedTotals[oldStatusId] || 0) - 1);
            }
            updatedTotals[statusId] = (updatedTotals[statusId] || 0) + 1;

            set({ 
                kanbanTasks: updatedTasks,
                kanbanTotals: updatedTotals
            });

            // Gọi API cập nhật trạng thái ở background
            await updateTaskStatus(taskId, statusId);

            // Gọi API lấy chi tiết task để đồng bộ dữ liệu đầy đủ và chính xác nhất
            const detailRes = await getTaskById(taskId);
            const updatedTask = detailRes?.data;
            if (updatedTask) {
                set({
                    kanbanTasks: get().kanbanTasks.map(t => t.id === taskId ? updatedTask : t)
                });
            }

            // Gọi API count để đồng bộ lại số lượng chính xác nhất từ DB
            const projId = get().filters.projectId?.id || get().filters.projectId;
            if (projId) {
                const { filters, keyword } = get();
                const assigneeId = filters.assigneeId?.id || filters.assigneeId;
                const activityId = filters.activityId?.id || filters.activityId;
                const priority = filters.priority;

                const countParams = {
                    ...(assigneeId && { assigneeId }),
                    ...(keyword && { keyword }),
                };
                if (priority !== undefined && priority !== '') {
                    countParams.priorities = [priority];
                }
                if (activityId) {
                    countParams.activityIds = [activityId];
                }

                const countsRes = await countTasksByStatus(projId, countParams);
                if (countsRes?.data) {
                    set({ kanbanTotals: countsRes.data });
                }
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            // Revert nếu lỗi
            const projId = get().filters.projectId?.id || get().filters.projectId;
            if (projId) {
                get().loadKanbanData(projId);
            }
        }
    },

    addComment: async (taskId, commentText) => {
        try {
            await addTaskComment(taskId, commentText);
            get().loadTaskHistory(taskId);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    },

    modifyComment: async (commentId, commentText, taskId) => {
        try {
            await updateTaskComment(commentId, commentText);
            if (taskId) {
                get().loadTaskHistory(taskId);
            }
        } catch (error) {
            console.error('Error modifying comment:', error);
        }
    },

    removeComment: async (commentId, taskId) => {
        try {
            await deleteTaskComment(commentId);
            if (taskId) {
                get().loadTaskHistory(taskId);
            }
        } catch (error) {
            console.error('Error removing comment:', error);
        }
    }
}));

export default useTaskStore;
