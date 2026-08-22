import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveStaff, deleteStaff } from '../../../services/StaffService';
import { toast } from 'sonner';
import { staffKeys } from './queries';

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStaff,
    onSuccess: () => {
      toast.success('Thêm mới nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
    onError: (error) => {
      console.error('Error adding staff:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới nhân viên');
    },
  });
};

export const useModifyStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStaff,
    onSuccess: () => {
      toast.success('Cập nhật nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying staff:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên');
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success('Xóa nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting staff:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa nhân viên');
    },
  });
};
