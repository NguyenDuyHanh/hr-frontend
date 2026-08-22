import { useQuery } from '@tanstack/react-query';
import { pagingDepartments, generateDepartmentCode } from '../../../services/departmentService';
import { pagingPositions } from '../../../services/positionService';

export const departmentKeys = {
  all: ['departments'],
  list: (params) => [...departmentKeys.all, 'list', params],
  code: ['departments', 'generate-code'],
  positions: (deptId, params) => [...departmentKeys.all, 'positions', deptId, params],
};

export const useDepartments = (params) => {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: async () => {
      const res = await pagingDepartments(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useDepartmentCode = (open, selectedDepartment) => {
  return useQuery({
    queryKey: departmentKeys.code,
    queryFn: async () => {
      const res = await generateDepartmentCode();
      return res?.data || '';
    },
    enabled: !!open && !selectedDepartment,
    staleTime: 0,
  });
};

export const useDepartmentPositions = (deptId, params, enabled = true) => {
  return useQuery({
    queryKey: departmentKeys.positions(deptId, params),
    queryFn: async () => {
      if (!deptId) return { content: [], totalElements: 0 };
      const res = await pagingPositions({ ...params, departmentId: deptId });
      return res?.data || { content: [], totalElements: 0 };
    },
    enabled: !!deptId && enabled,
    placeholderData: (previousData) => previousData,
  });
};
