import { useQuery } from '@tanstack/react-query';
import { pagingStaffs, generateStaffCode, getStaffById, getCertificatesByStaffId, getBankAccountsByStaffId } from '../../../services/StaffService';
import { getAllSalaryItems, getStaffSalaryItems } from '../../../services/salaryItemService';

export const staffKeys = {
  all: ['staffs'],
  list: (params) => [...staffKeys.all, 'list', params],
  detail: (id) => [...staffKeys.all, 'detail', id],
  code: ['staffs', 'generate-code'],
  certificates: (staffId, type) => ['staff-certificates', staffId, type || 'ALL'],
  bankAccounts: (staffId) => ['staff-bank-accounts', staffId],
  salaryConfig: (staffId) => ['staff-salary-config', staffId],
  masterSalaryItems: ['master-salary-items'],
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

// 4. Danh sách Bằng cấp / Chứng chỉ của nhân viên theo loại (TanStack Query)
export const useStaffCertificates = (staffId, type) => {
  return useQuery({
    queryKey: staffKeys.certificates(staffId, type),
    queryFn: async () => {
      if (!staffId) return [];
      const res = await getCertificatesByStaffId(staffId, type);
      return res?.data || res || [];
    },
    enabled: !!staffId,
    staleTime: 1000 * 60 * 2,
  });
};

// 5. Danh sách tài khoản ngân hàng của nhân viên (TanStack Query)
export const useStaffBankAccounts = (staffId) => {
  return useQuery({
    queryKey: staffKeys.bankAccounts(staffId),
    queryFn: async () => {
      if (!staffId || staffId === 'new') return [];
      const res = await getBankAccountsByStaffId(staffId);
      return res?.data || res || [];
    },
    enabled: !!staffId && staffId !== 'new',
    staleTime: 1000 * 60 * 2,
  });
};

// 6. Danh mục tất cả khoản lương
export const useAllSalaryItems = () => {
  return useQuery({
    queryKey: staffKeys.masterSalaryItems,
    queryFn: async () => {
      const res = await getAllSalaryItems();
      return res?.data?.data || res?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// 7. Cấu hình lương & phụ cấp của nhân viên (TanStack Query)
export const useStaffSalaryItems = (staffId) => {
  return useQuery({
    queryKey: staffKeys.salaryConfig(staffId),
    queryFn: async () => {
      if (!staffId || staffId === 'new') return [];
      const res = await getStaffSalaryItems(staffId);
      return res?.data?.data || res?.data || [];
    },
    enabled: !!staffId && staffId !== 'new',
    staleTime: 1000 * 60 * 2,
  });
};
