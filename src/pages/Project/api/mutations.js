import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveProject, deleteProject, finishProject, unfinishProject } from '../../../services/projectService';
import { toast } from 'sonner';
import { projectKeys } from './queries';

export const useAddProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveProject,
    onSuccess: () => {
      toast.success('Thêm mới dự án thành công');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      console.error('Error adding project:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới dự án');
    },
  });
};

export const useModifyProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...project }) => saveProject({ ...project, id }),
    onSuccess: () => {
      toast.success('Cập nhật dự án thành công');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying project:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dự án');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success('Xóa dự án thành công');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error(error?.response?.data?.message || 'Không thể xóa dự án này');
    },
  });
};

export const useCompleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: finishProject,
    onSuccess: () => {
      toast.success('Đã hoàn thành dự án');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      console.error('Error finishing project:', error);
      toast.error('Lỗi khi cập nhật trạng thái hoàn thành');
    },
  });
};

export const useUncompleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfinishProject,
    onSuccess: () => {
      toast.success('Đã mở lại dự án');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      console.error('Error unfinishing project:', error);
      toast.error('Lỗi khi mở lại dự án');
    },
  });
};
