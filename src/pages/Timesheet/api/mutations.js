import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveTimesheet, logCheckInOut } from '../../../services/timesheetService';
import { toast } from 'sonner';
import { timesheetKeys } from './queries';

export const useApproveTimesheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) => approveTimesheet(id, status, note),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái bảng công thành công');
      queryClient.invalidateQueries({ queryKey: timesheetKeys.all });
    },
    onError: (error) => {
      console.error('Error updating timesheet status:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    },
  });
};

export const useCheckInOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logCheckInOut,
    onSuccess: () => {
      toast.success('Chấm công thành công');
      queryClient.invalidateQueries({ queryKey: timesheetKeys.all });
    },
    onError: (error) => {
      console.error('Error check in out:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi chấm công');
    },
  });
};
