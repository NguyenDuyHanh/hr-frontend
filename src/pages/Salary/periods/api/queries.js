import { useQuery } from '@tanstack/react-query';
import { getAllPeriods, searchPeriods } from '../../../../services/periodService';

export const periodKeys = {
  all: ['periods'],
  list: (params) => [...periodKeys.all, 'list', params],
};

export const usePeriods = (searchDto) => {
  return useQuery({
    queryKey: periodKeys.list(searchDto),
    queryFn: async () => {
      const response = searchDto ? await searchPeriods(searchDto) : await getAllPeriods();
      return response?.data?.content || response?.data?.data || response?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};
