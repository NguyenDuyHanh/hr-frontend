import { useQuery } from '@tanstack/react-query';
import { pagingRoles } from '../../../services/RoleService';

export const roleKeys = {
  all: ['roles'],
  list: (params) => [...roleKeys.all, 'list', params],
};

export const useRoles = (params) => {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const res = await pagingRoles(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};
