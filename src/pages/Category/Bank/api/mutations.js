import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveBank, deleteBank } from '../../../../services/bankService';
import { toast } from 'sonner';
import { bankKeys } from './queries';

export const useAddBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveBank,
    onSuccess: () => {
      toast.success('Thêm mới ngân hàng thành công');
      queryClient.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới ngân hàng');
    },
  });
};

export const useModifyBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveBank,
    onSuccess: () => {
      toast.success('Cập nhật ngân hàng thành công');
      queryClient.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ngân hàng');
    },
  });
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBank,
    onSuccess: () => {
      toast.success('Xóa ngân hàng thành công');
      queryClient.invalidateQueries({ queryKey: bankKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa ngân hàng');
    },
  });
};
