import { useQuery } from '@tanstack/react-query';
import { getAllSalaryItems } from '../../../../services/salaryItemService';
import { getStaffSalaryItems } from '../../../../services/staffSalaryItemService';

export const staffSalaryKeys = {
  all: ['staff-salary'],
  masterSalaryItems: ['master-salary-items'],
  salaryConfig: (staffId) => ['staff-salary-config', staffId],
};

// 1. Danh mục tất cả khoản lương master
export const useAllSalaryItems = () => {
  return useQuery({
    queryKey: staffSalaryKeys.masterSalaryItems,
    queryFn: async () => {
      const res = await getAllSalaryItems();
      return res?.data?.data || res?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// 2. Cấu hình lương & phụ cấp của nhân viên
export const useStaffSalaryItems = (staffId) => {
  return useQuery({
    queryKey: staffSalaryKeys.salaryConfig(staffId),
    queryFn: async () => {
      if (!staffId || staffId === 'new') return [];
      const res = await getStaffSalaryItems(staffId);
      return res?.data?.data || res?.data || [];
    },
    enabled: !!staffId && staffId !== 'new',
    staleTime: 1000 * 60 * 2,
  });
};
