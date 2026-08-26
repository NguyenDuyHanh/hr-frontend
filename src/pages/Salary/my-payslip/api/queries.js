import { useQuery } from '@tanstack/react-query';
import { getMyPayslip } from '../../../../services/payrollService';

export const myPayslipKeys = {
  all: ['my-payslip'],
  detail: (periodId) => [...myPayslipKeys.all, periodId],
};

export const useMyPayslip = (periodId) => {
  return useQuery({
    queryKey: myPayslipKeys.detail(periodId),
    queryFn: async () => {
      if (!periodId) return null;
      const response = await getMyPayslip(periodId);
      return response?.data?.data || response?.data || null;
    },
    enabled: !!periodId,
    staleTime: 1000 * 60 * 2,
  });
};
