import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import AccessDeniedPage from '@/pages/auth/AccessDeniedPage';

/**
 * AuthGuard - Bảo vệ các tuyến đường (Route Protection)
 * @param {Array} roles - Danh sách các quyền được phép truy cập. Nếu không truyền, chỉ kiểm tra xem đã login chưa.
 */
const AuthGuard = ({ children, roles }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // 1. Kiểm tra đăng nhập
  if (!user) {
    // Chuyển hướng đến trang login và lưu lại vị trí hiện tại để quay lại sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra phân quyền (RBAC)
  if (roles && roles.length > 0) {
    const userRoles = user.role || [];
    const hasPermission = roles.some(r => userRoles.includes(r));
    
    if (!hasPermission) {
      console.warn(`User ${user.staffName || user.username} attempted unauthorized access to ${location.pathname}`);
      return <AccessDeniedPage />;
    }
  }

  return children;
};

export default AuthGuard;
