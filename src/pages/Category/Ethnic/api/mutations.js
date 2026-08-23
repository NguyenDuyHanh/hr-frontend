import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveEthnic, deleteEthnic } from '../../../../services/ethnicService';
import { toast } from 'sonner';
import { ethnicKeys } from './queries';

export const useAddEthnic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveEthnic,
    onSuccess: () => {
      toast.success('Thêm mới dân tộc thành công');
      queryClient.invalidateQueries({ queryKey: ethnicKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới dân tộc');
    },
  });
};

export const useModifyEthnic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveEthnic,
    onSuccess: () => {
      toast.success('Cập nhật dân tộc thành công');
      queryClient.invalidateQueries({ queryKey: ethnicKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dân tộc');
    },
  });
};

export const useDeleteEthnic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEthnic,
    onSuccess: () => {
      toast.success('Xóa dân tộc thành công');
      queryClient.invalidateQueries({ queryKey: ethnicKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa dân tộc');
    },
  });
};
