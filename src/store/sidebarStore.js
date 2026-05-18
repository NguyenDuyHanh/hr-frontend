import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}));

export default useSidebarStore;
