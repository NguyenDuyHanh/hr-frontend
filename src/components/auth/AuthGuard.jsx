import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { ROLES } from '@/constants/roles';

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
      // Nếu không có quyền, chuyển hướng về trang dashboard (nếu là Admin) hoặc trang chủ của nhân viên (/profile-page/home)
      console.warn(`User ${user.staffName || user.username} attempted unauthorized access to ${location.pathname}`);
      const isAdmin = userRoles.includes(ROLES.ADMIN);
      const defaultPath = isAdmin ? "/dashboard" : "/profile-page/home";
      
      // Tránh lặp vô hạn nếu người dùng cố tình truy cập chính trang default
      if (defaultPath === location.pathname) {
        return <Navigate to="/login" replace />;
      }
      return <Navigate to={defaultPath} replace />;
    }
  }

  return children;
};

export default AuthGuard;
