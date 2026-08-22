import { useQuery } from '@tanstack/react-query';
import { 
    searchTimesheets, 
    getTimesheetById, 
    getTimesheetByStaffAndRange, 
    getRawLogs 
} from '../../../services/timesheetService';

export const timesheetKeys = {
  all: ['timesheets'],
  list: (params) => [...timesheetKeys.all, 'list', params],
  my: (staffId, fromDate, toDate) => [...timesheetKeys.all, 'my', staffId, fromDate, toDate],
  detail: (id) => [...timesheetKeys.all, 'detail', id],
  logs: (staffId, date) => [...timesheetKeys.all, 'logs', staffId, date],
};

export const useTimesheets = (params) => {
  return useQuery({
    queryKey: timesheetKeys.list(params),
    queryFn: async () => {
      const res = await searchTimesheets(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useMyTimesheets = (staffId, fromDate, toDate) => {
  return useQuery({
    queryKey: timesheetKeys.my(staffId, fromDate, toDate),
    queryFn: async () => {
      if (!staffId || !fromDate || !toDate) return [];
      const res = await getTimesheetByStaffAndRange(staffId, fromDate, toDate);
      return res?.data || [];
    },
    enabled: !!staffId && !!fromDate && !!toDate,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useTimesheetDetail = (id) => {
  return useQuery({
    queryKey: timesheetKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await getTimesheetById(id);
      return res?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useRawLogs = (staffId, date) => {
  return useQuery({
    queryKey: timesheetKeys.logs(staffId, date),
    queryFn: async () => {
      if (!staffId || !date) return [];
      const res = await getRawLogs(staffId, date);
      return res?.data || [];
    },
    enabled: !!staffId && !!date,
  });
};
