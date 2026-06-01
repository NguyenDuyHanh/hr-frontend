import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Button, InputAdornment } from '@mui/material';
import {
  PersonOutline,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Shield
} from '@mui/icons-material';
import { toast } from 'sonner';
import useAuthStore from '../../store/useAuthStore';
import UiTextField from '../../components/ui/UiTextField';
import UiCheckBox from '../../components/ui/UiCheckBox';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  // Retrieve remembered username from localStorage
  const rememberedUsername = localStorage.getItem('remembered_username') || '';

  const initialValues = {
    username: rememberedUsername,
    password: '',
    rememberMe: !!rememberedUsername,
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Tên đăng nhập không được để trống'),
    password: Yup.string().required('Mật khẩu không được để trống'),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);

      const result = await login(values.username, values.password);

      setIsLoading(false);
      if (result.success) {
        toast.success('Đăng nhập thành công!');
        
        // Remember user choice in localStorage
        if (values.rememberMe) {
          localStorage.setItem('remembered_username', values.username);
        } else {
          localStorage.removeItem('remembered_username');
        }

        // Redirect user
        navigate(from, { replace: true });
      } else {
        toast.error(result.message);
      }
    }
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      {/* Visual background ambient glow circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-100 blur-[150px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-100 blur-[150px] opacity-60 pointer-events-none"></div>

      <div className="w-full max-w-[480px] p-4 z-10">
        {/* Main premium login card container */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl">

          {/* Header image/brand section with circular shield badge */}
          <div className="pt-10 pb-4 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary shadow-lg shadow-primary/20 flex items-center justify-center text-primary-foreground mb-6 transform transition duration-500 hover:scale-105 hover:rotate-3">
              <Shield className="text-[32px]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm font-medium text-slate-500 max-w-[320px]">
              Sign in to manage your human resources securely.
            </p>
          </div>

          {/* Formik Provider Wrapper */}
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="px-8 pb-10 flex flex-col gap-1">

              {/* Username Input using shared UiTextField */}
              <UiTextField
                name="username"
                label="Tên đăng nhập"
                placeholder="Tên đăng nhập"
                disabled={isLoading}
                autoComplete="username"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline className="text-primary" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Input using shared UiTextField */}
              <UiTextField
                name="password"
                label="Mật khẩu"
                placeholder="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                disabled={isLoading}
                autoComplete="current-password"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined className="text-primary" />
                    </InputAdornment>
                  ),
                }}
                endAdornment={(
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-primary/70 hover:text-primary focus:outline-none transition-colors"
                    tabIndex="-1"
                  >
                    {showPassword ? <VisibilityOff className="text-[20px]" /> : <Visibility className="text-[20px]" />}
                  </button>
                )}
              />

              {/* Checkbox and Forgot Password Link */}
              <div className="flex items-center justify-between text-sm py-2">
                <div className="flex items-center">
                  <UiCheckBox
                    name="rememberMe"
                    label="Remember Me"
                    disabled={isLoading}
                    alignCenter={false}
                  />
                </div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Vui lòng liên hệ quản trị viên (admin@hrm.com) để khôi phục mật khẩu.');
                  }}
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-[13px] transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Login Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </Button>
            </form>
          </FormikProvider>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
