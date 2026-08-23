import { useQuery } from '@tanstack/react-query';
import { pagingEthnics } from '../../../../services/ethnicService';

export const ethnicKeys = {
  all: ['ethnics'],
  list: (params) => [...ethnicKeys.all, 'list', params],
};

export const useEthnics = (params) => {
  return useQuery({
    queryKey: ethnicKeys.list(params),
    queryFn: async () => {
      const res = await pagingEthnics(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};
