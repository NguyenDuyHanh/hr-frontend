import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';

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
    const hasPermission = roles.includes(user.role);
    
    if (!hasPermission) {
      // Nếu không có quyền, chuyển hướng về trang dashboard hoặc trang 403
      // Ở đây tạm thời về dashboard
      console.warn(`User ${user.fullName} attempted unauthorized access to ${location.pathname}`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default AuthGuard;
