import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveRecruitment, deleteRecruitment } from '../../../services/recruitmentService';
import { saveCandidate, deleteCandidate, updateCandidateStatus } from '../../../services/candidateService';
import { toast } from 'sonner';
import { recruitmentKeys } from './queries';

export const useAddRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRecruitment,
    onSuccess: () => {
      toast.success('Lưu tin tuyển dụng thành công');
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
    onError: (error) => {
      console.error('Error saving recruitment:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu tin tuyển dụng');
    },
  });
};

export const useDeleteRecruitment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecruitment,
    onSuccess: () => {
      toast.success('Xóa tin tuyển dụng thành công');
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting recruitment:', error);
      toast.error(error?.response?.data?.message || 'Không thể xóa tin tuyển dụng này');
    },
  });
};

export const useAddCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCandidate,
    onSuccess: () => {
      toast.success('Lưu thông tin ứng viên thành công');
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
    onError: (error) => {
      console.error('Error saving candidate:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu ứng viên');
    },
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      toast.success('Xóa ứng viên thành công');
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting candidate:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa ứng viên');
    },
  });
};

export const useChangeCandidateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, status, reason }) => updateCandidateStatus(candidateId, status, reason),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái ứng viên thành công');
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
    onError: (error) => {
      console.error('Error changing candidate status:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    },
  });
};
