import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savePosition, deletePosition } from '../../../services/positionService';
import { toast } from 'sonner';
import { positionKeys } from './queries';

export const useAddPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePosition,
    onSuccess: () => {
      toast.success('Thêm vị trí mới thành công');
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
    },
    onError: (error) => {
      console.error('Error adding position:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới vị trí');
    },
  });
};

export const useModifyPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePosition,
    onSuccess: () => {
      toast.success('Cập nhật vị trí thành công');
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying position:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật vị trí');
    },
  });
};

export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      toast.success('Xóa vị trí thành công');
      queryClient.invalidateQueries({ queryKey: positionKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting position:', error);
      toast.error(error?.response?.data?.message || 'Không thể xóa vị trí này. Vui lòng thử lại sau.');
    },
  });
};
