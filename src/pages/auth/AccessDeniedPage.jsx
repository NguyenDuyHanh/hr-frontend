import { useNavigate } from 'react-router-dom';
import { Lock, ArrowBack, Home } from '@mui/icons-material';
import { Button, Box, Paper, Typography, Avatar, Chip } from '@mui/material';
import useAuthStore from '@/store/useAuthStore';

/**
 * AccessDeniedPage — Trang hiển thị khi người dùng không có quyền truy cập
 */
const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.role || [];

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box className="min-h-[70vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-400/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[180px] h-[180px] bg-amber-400/5 rounded-full blur-[60px] pointer-events-none" />

      <Paper 
        elevation={0}
        className="relative z-10 max-w-md w-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-red-100/50 dark:border-red-900/20 rounded-3xl shadow-xl shadow-red-500/5 p-8 md:p-10 text-center transition-all duration-300 hover:shadow-red-500/10"
      >
        {/* Animated Icon Header */}
        <Box className="relative mb-6 inline-flex">
          {/* Inner ring pulse */}
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping opacity-75" />
          
          <Box className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Lock sx={{ fontSize: 36, color: '#ffffff' }} />
          </Box>
          
          {/* Floating warning dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
        </Box>

        {/* Title */}
        <Typography 
          variant="h5" 
          className="font-extrabold text-gray-900 dark:text-zinc-50 mb-2 tracking-tight"
        >
          Truy cập bị từ chối
        </Typography>

        {/* Description */}
        <Typography className="text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-xs mx-auto text-sm">
          Tài khoản của bạn không được phân quyền để truy cập trang này. Vui lòng liên hệ với bộ phận kỹ thuật hoặc quản trị viên nếu bạn tin rằng đây là một sự nhầm lẫn.
        </Typography>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            className="flex-1"
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderColor: 'var(--color-border, #e4e4e7)',
              color: 'var(--color-text-secondary, #71717a)',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'var(--color-primary, #ef4444)',
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                color: 'var(--color-primary, #ef4444)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            className="flex-1"
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: 'var(--color-primary, #ef4444)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'var(--color-primary-dark, #dc2626)',
                boxShadow: '0 6px 16px rgba(239, 68, 68, 0.3)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Về trang chủ
          </Button>
        </div>
      </Paper>
    </Box>
  );
};

export default AccessDeniedPage;
