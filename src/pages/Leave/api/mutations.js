import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createLeaveRequest, 
  updateLeaveRequest, 
  deleteLeaveRequest, 
  approveLeaveRequest, 
  rejectLeaveRequest 
} from '../../../services/leaveService';
import { toast } from 'sonner';
import { leaveKeys } from './queries';

export const useAddLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      toast.success('Gửi đơn nghỉ phép thành công');
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (error) => {
      console.error('Error creating leave request:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi gửi đơn nghỉ phép');
    },
  });
};

export const useModifyLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }) => updateLeaveRequest(id, dto),
    onSuccess: () => {
      toast.success('Cập nhật đơn nghỉ phép thành công');
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (error) => {
      console.error('Error updating leave request:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật đơn nghỉ phép');
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLeaveRequest,
    onSuccess: () => {
      toast.success('Xóa đơn nghỉ phép thành công');
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting leave request:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa đơn nghỉ phép');
    },
  });
};

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectReason }) => approveLeaveRequest(id, rejectReason),
    onSuccess: () => {
      toast.success('Duyệt đơn nghỉ phép thành công');
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (error) => {
      console.error('Error approving leave request:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi duyệt đơn nghỉ phép');
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectReason }) => rejectLeaveRequest(id, rejectReason),
    onSuccess: () => {
      toast.success('Từ chối đơn nghỉ phép thành công');
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
    onError: (error) => {
      console.error('Error rejecting leave request:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi từ chối đơn nghỉ phép');
    },
  });
};
