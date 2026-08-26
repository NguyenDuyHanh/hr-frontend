import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createPayroll,
    calculatePayroll,
    confirmPayroll,
    unconfirmPayroll,
    deletePayroll,
    updatePayslip
} from '../../../../services/payrollService';
import { toast } from 'sonner';
import { salaryKeys } from './queries';

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ periodId, name, code, description }) => createPayroll(periodId, name, code, description),
    onSuccess: () => {
      toast.success('Tạo bảng lương thành công');
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (error) => {
      console.error('Error creating payroll:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo bảng lương');
    },
  });
};

export const useRecalculatePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payrollId) => calculatePayroll(payrollId),
    onSuccess: () => {
      toast.success('Tính toán lại lương thành công');
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (error) => {
      console.error('Error recalculating payroll:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tính toán');
    },
  });
};

export const useConfirmPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payrollId) => confirmPayroll(payrollId),
    onSuccess: () => {
      toast.success('Chốt bảng lương thành công');
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (error) => {
      console.error('Error confirming payroll:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi chốt lương');
    },
  });
};

export const useUnconfirmPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payrollId) => unconfirmPayroll(payrollId),
    onSuccess: () => {
      toast.success('Bỏ chốt bảng lương thành công');
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (error) => {
      console.error('Error unconfirming payroll:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi mở chốt');
    },
  });
};

export const useDeletePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payrollId) => deletePayroll(payrollId),
    onSuccess: () => {
      toast.success('Xóa bảng lương thành công');
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting payroll:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa bảng lương');
    },
  });
};

export const useUpdatePayslipStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payslipId, paidStatus, note }) => updatePayslip(payslipId, paidStatus, note),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thanh toán thành công');
      queryClient.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (error) => {
      console.error('Error updating payslip status:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    },
  });
};
