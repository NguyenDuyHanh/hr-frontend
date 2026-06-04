import { create } from 'zustand';

const useThemeStore = create((set) => ({
  mode: localStorage.getItem('theme-mode') || 'light',
  toggleTheme: () => set((state) => {
    const newMode = state.mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme-mode', newMode);
    
    document.documentElement.classList.toggle('dark', newMode === 'dark');
    
    return { mode: newMode };
  }),
  setMode: (mode) => set(() => {
    localStorage.setItem('theme-mode', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    return { mode };
  })
}));

// Khởi tạo class tối ban đầu dựa trên cấu hình lưu trữ
const initialMode = localStorage.getItem('theme-mode') || 'light';
if (initialMode === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export default useThemeStore;
