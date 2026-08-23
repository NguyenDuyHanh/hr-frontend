import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAdministrativeUnit, deleteAdministrativeUnit } from '../../../../services/administrativeUnitService';
import { toast } from 'sonner';
import { administrativeUnitKeys } from './queries';

export const useAddAdministrativeUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAdministrativeUnit,
    onSuccess: () => {
      toast.success('Thêm mới đơn vị hành chính thành công');
      queryClient.invalidateQueries({ queryKey: administrativeUnitKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới đơn vị hành chính');
    },
  });
};

export const useModifyAdministrativeUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAdministrativeUnit,
    onSuccess: () => {
      toast.success('Cập nhật đơn vị hành chính thành công');
      queryClient.invalidateQueries({ queryKey: administrativeUnitKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đơn vị hành chính');
    },
  });
};

export const useDeleteAdministrativeUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdministrativeUnit,
    onSuccess: () => {
      toast.success('Xóa đơn vị hành chính thành công');
      queryClient.invalidateQueries({ queryKey: administrativeUnitKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn vị hành chính');
    },
  });
};
