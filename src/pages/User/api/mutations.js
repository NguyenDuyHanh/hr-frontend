import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveUser, deleteUser, lockUser, unlockUser, changePassword } from '../../../services/UserService';
import { toast } from 'sonner';
import { userKeys } from './queries';

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      toast.success('Thêm người dùng thành công');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Error adding user:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi thêm người dùng');
    },
  });
};

export const useModifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...user }) => saveUser({ ...user, id }),
    onSuccess: () => {
      toast.success('Cập nhật người dùng thành công');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying user:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi chỉnh sửa người dùng');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Xóa người dùng thành công');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Error removing user:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa người dùng');
    },
  });
};

export const useLockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lockUser,
    onSuccess: () => {
      toast.success('Khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Error locking user:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi khóa tài khoản');
    },
  });
};

export const useUnlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlockUser,
    onSuccess: () => {
      toast.success('Mở khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Error unlocking user:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi mở khóa tài khoản');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công');
    },
    onError: (error) => {
      console.error('Error changing password:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    },
  });
};
