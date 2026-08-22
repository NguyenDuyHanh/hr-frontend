import { useQuery } from '@tanstack/react-query';
import { pagingAnnouncements } from '../../../services/notificationService';

export const announcementKeys = {
  all: ['announcements'],
  list: (params) => [...announcementKeys.all, 'list', params],
};

export const useAnnouncements = (params) => {
  return useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: async () => {
      const res = await pagingAnnouncements(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};
