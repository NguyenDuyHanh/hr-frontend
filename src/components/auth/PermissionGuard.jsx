import React from 'react';
import useAuthStore from '@/store/useAuthStore';

/**
 * PermissionGuard - Component kiểm tra quyền hiển thị children
 * @param {Array|String} roles - Các vai trò được phép xem chức năng.
 * @param {ReactNode} children - Component con hiển thị nếu có quyền.
 * @param {ReactNode} fallback - Giao diện hiển thị thay thế nếu không có quyền (mặc định là null).
 */
const PermissionGuard = ({ roles, children, fallback = null }) => {
  const hasRole = useAuthStore((state) => state.hasRole);

  if (hasRole(roles)) {
    return <>{children}</>;
  }

  return fallback;
};

export default PermissionGuard;
