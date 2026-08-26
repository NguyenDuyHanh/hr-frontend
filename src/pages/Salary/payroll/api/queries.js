import { useQuery } from '@tanstack/react-query';
import { 
    getAllPayrolls, 
    getPayrollsByPeriod, 
    getPayrollDetails 
} from '../../../../services/payrollService';

export const salaryKeys = {
  all: ['salary'],
  payrolls: (periodId) => [...salaryKeys.all, 'payrolls', periodId],
  details: (payrollId) => [...salaryKeys.all, 'details', payrollId],
};

export const usePayrolls = (periodId) => {
  return useQuery({
    queryKey: salaryKeys.payrolls(periodId),
    queryFn: async () => {
      const response = periodId
        ? await getPayrollsByPeriod(periodId)
        : await getAllPayrolls();
      return Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data) ? response.data : [];
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const usePayrollDetails = (payrollId) => {
  return useQuery({
    queryKey: salaryKeys.details(payrollId),
    queryFn: async () => {
      if (!payrollId) return [];
      const response = await getPayrollDetails(payrollId);
      return Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data) ? response.data : [];
    },
    enabled: !!payrollId,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};
