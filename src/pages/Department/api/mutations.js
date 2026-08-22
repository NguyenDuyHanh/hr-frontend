import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveDepartment, deleteDepartment } from '../../../services/departmentService';
import { toast } from 'sonner';
import { departmentKeys } from './queries';

export const useAddDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveDepartment,
    onSuccess: () => {
      toast.success('Thêm phòng ban mới thành công');
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
    onError: (error) => {
      console.error('Error adding department:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới phòng ban');
    },
  });
};

export const useModifyDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveDepartment,
    onSuccess: () => {
      toast.success('Cập nhật phòng ban thành công');
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying department:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phòng ban');
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success('Xóa phòng ban thành công');
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting department:', error);
      toast.error(error?.response?.data?.message || 'Không thể xóa phòng ban này. Vui lòng thử lại sau.');
    },
  });
};
