import { useQuery } from '@tanstack/react-query';
import { pagingPositions, generatePositionCode } from '../../../services/positionService';
import { getPositions } from '../../../services/StaffService';

export const positionKeys = {
  all: ['positions'],
  list: (params) => [...positionKeys.all, 'list', params],
  code: ['positions', 'generate-code'],
  byDepartment: (deptId, params) => [...positionKeys.all, 'department', deptId, params],
  allPositions: ['positions', 'all'],
};

// Hook lấy toàn bộ danh sách vị trí dùng chung cho combobox/select
export const usePositionsQuery = (options = {}) => {
  return useQuery({
    queryKey: positionKeys.allPositions,
    queryFn: async () => {
      const res = await getPositions();
      return res?.data?.data || res?.data || [];
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const usePositions = (params) => {
  return useQuery({
    queryKey: positionKeys.list(params),
    queryFn: async () => {
      const res = await pagingPositions(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const usePositionCode = (open, selectedPosition) => {
  return useQuery({
    queryKey: positionKeys.code,
    queryFn: async () => {
      const res = await generatePositionCode();
      return res?.data || '';
    },
    enabled: !!open && !selectedPosition,
    staleTime: 0,
  });
};

// Hook lấy danh sách vị trí thuộc về một phòng ban
export const useDepartmentPositions = (deptId, params, enabled = true) => {
  return useQuery({
    queryKey: positionKeys.byDepartment(deptId, params),
    queryFn: async () => {
      if (!deptId) return { content: [], totalElements: 0 };
      const res = await pagingPositions({ ...params, departmentId: deptId });
      return res?.data || { content: [], totalElements: 0 };
    },
    enabled: !!deptId && enabled,
    placeholderData: (previousData) => previousData,
  });
};
