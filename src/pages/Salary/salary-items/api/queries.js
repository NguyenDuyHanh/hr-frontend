import { useQuery } from '@tanstack/react-query';
import { getAllSalaryItems } from '../../../../services/salaryItemService';

export const salaryItemKeys = {
  all: ['salary-items'],
  list: () => [...salaryItemKeys.all, 'list'],
};

export const useSalaryItems = () => {
  return useQuery({
    queryKey: salaryItemKeys.list(),
    queryFn: async () => {
      const response = await getAllSalaryItems();
      return response?.data?.data || response?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};
