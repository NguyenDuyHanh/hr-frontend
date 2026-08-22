import { useQuery } from '@tanstack/react-query';
import { searchLeaveRequests, getLeaveBalance } from '../../../services/leaveService';

export const leaveKeys = {
  all: ['leave-requests'],
  list: (params) => [...leaveKeys.all, 'list', params],
  balance: (staffId, year) => [...leaveKeys.all, 'balance', staffId, year],
};

export const useLeaveRequests = (params) => {
  return useQuery({
    queryKey: leaveKeys.list(params),
    queryFn: async () => {
      const res = await searchLeaveRequests(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useLeaveBalance = (staffId, year) => {
  return useQuery({
    queryKey: leaveKeys.balance(staffId, year),
    queryFn: async () => {
      if (!staffId) return null;
      const res = await getLeaveBalance(staffId, year);
      return res?.data || null;
    },
    enabled: !!staffId,
    staleTime: 1000 * 60 * 2,
  });
};
