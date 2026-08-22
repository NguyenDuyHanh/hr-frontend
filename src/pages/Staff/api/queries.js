import { useQuery } from '@tanstack/react-query';
import { pagingStaffs, generateStaffCode, getStaffById } from '../../../services/StaffService';

export const staffKeys = {
  all: ['staffs'],
  list: (params) => [...staffKeys.all, 'list', params],
  detail: (id) => [...staffKeys.all, 'detail', id],
  code: ['staffs', 'generate-code'],
};

// 1. Danh sách nhân viên: staleTime 30 giây (Tránh spam API khi bấm nhanh, giữ UI mượt)
export const useStaffs = (params) => {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: async () => {
      const res = await pagingStaffs(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

// 2. Mã nhân viên tự động: staleTime 0 (Luôn lấy mã mới nhất từ server)
export const useStaffCode = (open, staffData) => {
  return useQuery({
    queryKey: staffKeys.code,
    queryFn: async () => {
      const res = await generateStaffCode();
      return res?.data || '';
    },
    enabled: !!open && !staffData,
    staleTime: 0,
  });
};

// 3. Chi tiết nhân viên: staleTime 2 phút (Mở xem chi tiết tức thì trong 2 phút)
export const useStaffDetail = (id) => {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await getStaffById(id);
      return res?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};
