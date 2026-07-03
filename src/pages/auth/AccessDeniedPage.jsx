import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowBack, Home } from '@mui/icons-material';
import { Button } from '@mui/material';
import useAuthStore from '@/store/useAuthStore';
import { ROLES } from '@/constants/roles';

/**
 * AccessDeniedPage — Trang hiển thị khi người dùng không có quyền truy cập
 */
const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.role || [];
  const isAdmin = userRoles.includes(ROLES.ADMIN);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20">
          <Lock sx={{ fontSize: 40, color: 'var(--color-danger, #ef4444)' }} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Truy cập bị từ chối
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg">
          Lỗi 403 — Forbidden
        </p>

        {/* Description */}
        <p className="text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên 
          nếu bạn cho rằng đây là lỗi.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              textTransform: 'none',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
              '&:hover': {
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
              }
            }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-dark)',
              }
            }}
          >
            Về trang chủ
          </Button>
        </div>

        {/* User info */}
        {user && (
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-8">
            Đăng nhập với: <span className="font-medium">{user.staffName || user.username}</span>
            {' '} — Vai trò: {userRoles.join(', ') || 'Chưa gán vai trò'}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccessDeniedPage;
