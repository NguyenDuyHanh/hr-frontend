import { useQuery } from '@tanstack/react-query';
import { pagingHolidays } from '../../../services/holidayService';

export const holidayKeys = {
  all: ['holidays'],
  list: (params) => [...holidayKeys.all, 'list', params],
};

export const useHolidays = (params) => {
  return useQuery({
    queryKey: holidayKeys.list(params),
    queryFn: async () => {
      const res = await pagingHolidays(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};
