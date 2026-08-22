import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveRole, deleteRole } from '../../../services/RoleService';
import { toast } from 'sonner';
import { roleKeys } from './queries';

export const useAddRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRole,
    onSuccess: () => {
      toast.success('Thêm vai trò mới thành công');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error) => {
      console.error('Error adding role:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới vai trò');
    },
  });
};

export const useModifyRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRole,
    onSuccess: () => {
      toast.success('Cập nhật vai trò thành công');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying role:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật vai trò');
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success('Xóa vai trò thành công');
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting role:', error);
      toast.error(error?.response?.data?.message || 'Không thể xóa vai trò này. Vui lòng thử lại sau.');
    },
  });
};
