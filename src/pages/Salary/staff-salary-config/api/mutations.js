import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveStaffSalaryItems } from '../../../../services/staffSalaryItemService';
import { toast } from 'sonner';
import { staffSalaryKeys } from './queries';

export const useSaveStaffSalaryItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, items }) => saveStaffSalaryItems(staffId, items),
    onSuccess: (_, { staffId }) => {
      toast.success('Cập nhật cấu hình lương nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: staffSalaryKeys.salaryConfig(staffId) });
    },
    onError: (error) => {
      console.error('Error saving staff salary items:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình lương');
    },
  });
};
