import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveSalaryItem, deleteSalaryItem } from '../../../../services/salaryItemService';
import { toast } from 'sonner';
import { salaryItemKeys } from './queries';

export const useSaveSalaryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item) => saveSalaryItem(item),
    onSuccess: () => {
      toast.success('Lưu khoản lương thành công');
      queryClient.invalidateQueries({ queryKey: salaryItemKeys.all });
    },
    onError: (error) => {
      console.error('Error saving salary item:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu khoản lương');
    },
  });
};

export const useDeleteSalaryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSalaryItem(id),
    onSuccess: () => {
      toast.success('Xóa khoản lương thành công');
      queryClient.invalidateQueries({ queryKey: salaryItemKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting salary item:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa khoản lương');
    },
  });
};
