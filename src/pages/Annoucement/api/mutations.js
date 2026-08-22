import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAnnouncement, deleteAnnouncement } from '../../../services/notificationService';
import { toast } from 'sonner';
import { announcementKeys } from './queries';

export const useAddAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAnnouncement,
    onSuccess: () => {
      toast.success('Thêm thông báo thành công');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: (error) => {
      console.error('Error adding announcement:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm thông báo');
    },
  });
};

export const useModifyAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...announcement }) => saveAnnouncement({ ...announcement, id }),
    onSuccess: () => {
      toast.success('Cập nhật thông báo thành công');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying announcement:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông báo');
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success('Xóa thông báo thành công');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting announcement:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa thông báo');
    },
  });
};
