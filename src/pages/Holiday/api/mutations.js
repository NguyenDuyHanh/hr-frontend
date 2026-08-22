import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveHoliday, deleteHoliday } from '../../../services/holidayService';
import { toast } from 'sonner';
import { holidayKeys } from './queries';

export const useAddHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveHoliday,
    onSuccess: () => {
      toast.success('Thêm mới ngày lễ thành công');
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
    onError: (error) => {
      console.error('Error adding holiday:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới ngày lễ');
    },
  });
};

export const useModifyHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...holiday }) => saveHoliday({ ...holiday, id }),
    onSuccess: () => {
      toast.success('Cập nhật ngày lễ thành công');
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying holiday:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ngày lễ');
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      toast.success('Xóa ngày lễ thành công');
      queryClient.invalidateQueries({ queryKey: holidayKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting holiday:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa ngày lễ');
    },
  });
};
