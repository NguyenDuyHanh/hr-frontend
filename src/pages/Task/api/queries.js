import { useQuery } from '@tanstack/react-query';
import { 
    pagingTasks, 
    getTasksForKanban,
    getTaskById, 
    getTaskHistory, 
    countTasksByStatus
} from '../../../services/taskService';
import { getProjectWorkingStatuses } from '../../../services/projectService';

export const taskKeys = {
  all: ['tasks'],
  list: (params) => [...taskKeys.all, 'list', params],
  kanban: (projectId, params) => [...taskKeys.all, 'kanban', projectId, params],
  detail: (id) => [...taskKeys.all, 'detail', id],
  history: (id) => [...taskKeys.all, 'history', id],
};

export const useTasks = (params) => {
  const projectId = params?.projectId?.id || params?.projectId;
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => {
      if (!projectId) return { content: [], totalElements: 0 };
      const res = await pagingTasks(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    enabled: !!projectId,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useKanbanData = (projectId, params) => {
  const projId = projectId?.id || projectId;
  return useQuery({
    queryKey: taskKeys.kanban(projId, params),
    queryFn: async () => {
      if (!projId) return { statuses: [], tasks: [], totals: {} };
      const [statusRes, tasksRes, countsRes] = await Promise.all([
        getProjectWorkingStatuses(projId),
        getTasksForKanban({ ...params, projectId: projId, pageIndex: 1, pageSize: 10 }),
        countTasksByStatus(projId, params)
      ]);
      const statuses = statusRes?.data || [];
      const tasks = tasksRes?.data || [];
      const totals = countsRes?.data || {};
      return { statuses, tasks, totals };
    },
    enabled: !!projId,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 15,
  });
};

export const useTaskDetail = (taskId) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: async () => {
      if (!taskId) return null;
      const res = await getTaskById(taskId);
      return res?.data || null;
    },
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useTaskHistory = (taskId) => {
  return useQuery({
    queryKey: taskKeys.history(taskId),
    queryFn: async () => {
      if (!taskId) return [];
      const res = await getTaskHistory(taskId);
      return res?.data || [];
    },
    enabled: !!taskId,
  });
};
