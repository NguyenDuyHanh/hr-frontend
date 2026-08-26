import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  saveStaff, 
  deleteStaff, 
  saveStaffCertificate, 
  deleteStaffCertificate,
  saveStaffBankAccount,
  setDefaultStaffBankAccount,
  deleteStaffBankAccount
} from '../../../services/StaffService';
import { saveStaffSalaryItems } from '../../../services/staffSalaryItemService';
import { toast } from 'sonner';
import { staffKeys } from './queries';

export const useAddStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStaff,
    onSuccess: () => {
      toast.success('Thêm mới nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
    onError: (error) => {
      console.error('Error adding staff:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới nhân viên');
    },
  });
};

export const useModifyStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStaff,
    onSuccess: () => {
      toast.success('Cập nhật nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
    onError: (error) => {
      console.error('Error modifying staff:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên');
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      toast.success('Xóa nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting staff:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa nhân viên');
    },
  });
};

export const useSaveStaffCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStaffCertificate,
    onSuccess: () => {
      toast.success('Lưu bằng cấp / chứng chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-certificates'] });
    },
    onError: (error) => {
      console.error('Error saving staff certificate:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu bằng cấp / chứng chỉ');
    },
  });
};

export const useDeleteStaffCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaffCertificate,
    onSuccess: () => {
      toast.success('Xóa bằng cấp / chứng chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-certificates'] });
    },
    onError: (error) => {
      console.error('Error deleting staff certificate:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa bằng cấp / chứng chỉ');
    },
  });
};

export const useSaveStaffBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStaffBankAccount,
    onSuccess: (_, variables) => {
      toast.success(variables?.id ? 'Cập nhật tài khoản thành công' : 'Thêm mới tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-bank-accounts'] });
    },
    onError: (error) => {
      console.error('Error saving bank account:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu tài khoản ngân hàng');
    },
  });
};

export const useSetDefaultStaffBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultStaffBankAccount,
    onSuccess: () => {
      toast.success('Đã đặt làm tài khoản mặc định');
      queryClient.invalidateQueries({ queryKey: ['staff-bank-accounts'] });
    },
    onError: (error) => {
      console.error('Error setting default bank account:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi đặt tài khoản mặc định');
    },
  });
};

export const useDeleteStaffBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaffBankAccount,
    onSuccess: () => {
      toast.success('Xóa tài khoản ngân hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-bank-accounts'] });
    },
    onError: (error) => {
      console.error('Error deleting bank account:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản ngân hàng');
    },
  });
};

export const useSaveStaffSalaryItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, items }) => saveStaffSalaryItems(staffId, items),
    onSuccess: (_, variables) => {
      toast.success('Lưu cấu hình lương nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-salary-config', variables.staffId] });
    },
    onError: (error) => {
      console.error('Error saving staff salary items:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi lưu cấu hình lương nhân viên');
    },
  });
};
