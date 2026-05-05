// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: {
        id: 1,
        fullName: 'Admin User',
        email: 'admin@globits.net',
        role: 'ROLE_ADMIN', // Giá trị mặc định để test, thực tế sẽ lấy từ API login
      },
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

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
