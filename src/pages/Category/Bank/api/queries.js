import { useQuery } from '@tanstack/react-query';
import { pagingBanks } from '../../../../services/bankService';

export const bankKeys = {
  all: ['banks'],
  list: (params) => [...bankKeys.all, 'list', params],
};

export const useBanks = (params) => {
  return useQuery({
    queryKey: bankKeys.list(params),
    queryFn: async () => {
      const res = await pagingBanks(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};
