import { useQuery } from '@tanstack/react-query';
import { pagingProjects, getProjectById } from '../../../services/projectService';

export const projectKeys = {
  all: ['projects'],
  list: (params) => [...projectKeys.all, 'list', params],
  detail: (id) => [...projectKeys.all, 'detail', id],
};

export const useProjects = (params) => {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: async () => {
      const res = await pagingProjects(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useProjectDetail = (id) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await getProjectById(id);
      return res?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};
