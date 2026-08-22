import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    saveTask, 
    deleteTask, 
    updateTaskStatus, 
    addTaskComment, 
    updateTaskComment, 
    deleteTaskComment 
} from '../../../services/taskService';
import { toast } from 'sonner';
import { taskKeys } from './queries';

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTask,
    onSuccess: () => {
      toast.success('Thêm mới công việc thành công');
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      console.error('Error adding task:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới công việc');
    },
  });
};

export const useModifyTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...task }) => saveTask({ ...task, id }),
    onSuccess: () => {
      toast.success('Cập nhật công việc thành công');
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying task:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật công việc');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Xóa công việc thành công');
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa công việc');
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, statusId }) => updateTaskStatus(taskId, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error) => {
      console.error('Error updating task status:', error);
      toast.error('Có lỗi xảy ra khi chuyển trạng thái công việc');
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, commentText }) => addTaskComment(taskId, commentText),
    onSuccess: (_, variables) => {
      toast.success('Thêm bình luận thành công');
      queryClient.invalidateQueries({ queryKey: taskKeys.history(variables.taskId) });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Lỗi khi thêm bình luận');
    },
  });
};

export const useModifyComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, commentText }) => updateTaskComment(commentId, commentText),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật bình luận thành công');
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.history(variables.taskId) });
      }
    },
    onError: (error) => {
      console.error('Error modifying comment:', error);
      toast.error('Lỗi khi sửa bình luận');
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }) => deleteTaskComment(commentId),
    onSuccess: (_, variables) => {
      toast.success('Xóa bình luận thành công');
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.history(variables.taskId) });
      }
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast.error('Lỗi khi xóa bình luận');
    },
  });
};
