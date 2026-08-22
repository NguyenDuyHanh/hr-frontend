import { useQuery } from '@tanstack/react-query';
import { pagingUsers } from '../../../services/UserService';
import { getRoles } from '../../../services/RoleService';

export const userKeys = {
  all: ['users'],
  list: (params) => [...userKeys.all, 'list', params],
  roles: ['roles', 'all'],
};

export const useUsers = (params) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const res = await pagingUsers(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useRolesQuery = (enabled = true) => {
  return useQuery({
    queryKey: userKeys.roles,
    queryFn: async () => {
      const res = await getRoles();
      return res?.data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};
