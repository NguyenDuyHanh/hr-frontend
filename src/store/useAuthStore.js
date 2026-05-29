// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as AuthService from '../services/AuthService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      login: async (username, password) => {
        try {
          const response = await AuthService.login(username, password);

          if (response.data && response.data.status === 200) {
            const { accessToken, refreshToken } = response.data.data;
            
            // Lưu token tạm thời để các request tiếp theo có token trong Header
            set({ accessToken, refreshToken });
            
            try {
              // Gọi API lấy thông tin user hiện tại
              const userResponse = await AuthService.getCurrentUser();
              
              if (userResponse.data && userResponse.data.status === 200) {
                const userData = userResponse.data.data;
                const rolesList = userData.roles || [];
                const primaryRole = rolesList.length > 0 ? rolesList[0].name : 'ROLE_EMPLOYEE';
                
                const userObj = {
                  id: userData.id,
                  username: userData.username,
                  email: userData.email,
                  fullName: userData.staffName || userData.username,
                  role: primaryRole,
                  staffId: userData.staffId
                };
                
                set({ user: userObj });
                return { success: true, data: { accessToken, refreshToken, user: userObj } };
              } else {
                // Nếu không lấy được user, xóa sạch token đã lưu tạm
                set({ user: null, accessToken: null, refreshToken: null });
                return { success: false, message: userResponse.data?.message || 'Không thể lấy thông tin người dùng' };
              }
            } catch (userErr) {
              console.error('Error fetching current user details:', userErr);
              set({ user: null, accessToken: null, refreshToken: null });
              return { success: false, message: 'Lỗi khi lấy thông tin tài khoản sau đăng nhập' };
            }
          } else {
            return { success: false, message: response.data?.message || 'Đăng nhập không thành công' };
          }
        } catch (err) {
          console.error('Login error in store:', err);
          const msg = err.response?.data?.message || 'Kết nối đến máy chủ thất bại. Vui lòng kiểm tra lại.';
          return { success: false, message: msg };
        }
      },

      getCurrentUser: async () => {
        try {
          const userResponse = await AuthService.getCurrentUser();
          if (userResponse.data && userResponse.data.status === 200) {
            const userData = userResponse.data.data;
            const rolesList = userData.roles || [];
            const primaryRole = rolesList.length > 0 ? rolesList[0].name : 'ROLE_EMPLOYEE';
            
            const userObj = {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              fullName: userData.staffName || userData.username,
              role: primaryRole,
              staffId: userData.staffId
            };
            
            set({ user: userObj });
            return { success: true, user: userObj };
          }
          return { success: false };
        } catch (err) {
          console.error('Error fetching current user:', err);
          return { success: false };
        }
      },

      logout: async () => {
        // Xóa trạng thái client ngay lập tức để UX mượt mà, không bị trễ
        set({ user: null, accessToken: null, refreshToken: null });
        
        try {
          await AuthService.logout();
        } catch (err) {
          console.error('Gọi API logout ở backend thất bại:', err);
        }
      },

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        if (!roles) return true; // Không yêu cầu role thì cho qua
        
        return Array.isArray(roles)
          ? roles.includes(user.role)
          : user.role === roles;
      },
    }),
    {
      name: 'hrm-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
