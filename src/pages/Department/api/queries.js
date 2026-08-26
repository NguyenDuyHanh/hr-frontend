import { useQuery } from '@tanstack/react-query';
import { pagingDepartments, generateDepartmentCode } from '../../../services/departmentService';
import { getDepartments } from '../../../services/StaffService';

export const departmentKeys = {
  all: ['departments'],
  list: (params) => [...departmentKeys.all, 'list', params],
  code: ['departments', 'generate-code'],
  allDepts: ['departments', 'all'],
};

// Hook lấy toàn bộ danh sách phòng ban dùng chung cho combobox/select
export const useDepartmentsQuery = (options = {}) => {
  return useQuery({
    queryKey: departmentKeys.allDepts,
    queryFn: async () => {
      const res = await getDepartments();
      return res?.data?.data || res?.data || [];
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
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
