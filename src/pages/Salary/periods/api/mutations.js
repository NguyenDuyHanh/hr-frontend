import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPeriod, updatePeriod, deletePeriod } from '../../../../services/periodService';
import { toast } from 'sonner';
import { periodKeys } from './queries';

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createPeriod(data.name, data.code, data.description, data.month, data.year, data.fromDate, data.toDate, data.standardWorkDays),
    onSuccess: () => {
      toast.success('Tạo kỳ lương thành công');
      queryClient.invalidateQueries({ queryKey: periodKeys.all });
    },
    onError: (error) => {
      console.error('Error creating period:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo kỳ lương');
    },
  });
};

export const useUpdatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updatePeriod(id, data.name, data.code, data.description, data.month, data.year, data.fromDate, data.toDate, data.standardWorkDays),
    onSuccess: () => {
      toast.success('Cập nhật kỳ lương thành công');
      queryClient.invalidateQueries({ queryKey: periodKeys.all });
    },
    onError: (error) => {
      console.error('Error updating period:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật kỳ lương');
    },
  });
};

export const useDeletePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deletePeriod(id),
    onSuccess: () => {
      toast.success('Xóa kỳ lương thành công');
      queryClient.invalidateQueries({ queryKey: periodKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting period:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa kỳ lương');
    },
  });
};
