import { useQuery } from '@tanstack/react-query';
import { pagingPositions, generatePositionCode } from '../../../services/positionService';
import { getAllDepartments } from '../../../services/departmentService';

export const positionKeys = {
  all: ['positions'],
  list: (params) => [...positionKeys.all, 'list', params],
  code: ['positions', 'generate-code'],
  allDepts: ['departments', 'all'],
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

export const useAllDepartmentsQuery = (enabled = true) => {
  return useQuery({
    queryKey: positionKeys.allDepts,
    queryFn: async () => {
      const res = await getAllDepartments();
      return res?.data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 mins cache for department reference list
  });
};
