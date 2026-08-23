import { create } from 'zustand';

const initialCollapsed = localStorage.getItem('hrm_sidebar_collapsed') === 'true';

const useSidebarStore = create((set) => ({
  isCollapsed: initialCollapsed,
  isMobileOpen: false,
  toggleCollapsed: () => set((state) => {
    const nextState = !state.isCollapsed;
    localStorage.setItem('hrm_sidebar_collapsed', String(nextState));
    return { isCollapsed: nextState };
  }),
  toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setCollapsed: (collapsed) => set(() => {
    localStorage.setItem('hrm_sidebar_collapsed', String(collapsed));
    return { isCollapsed: collapsed };
  }),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}));

export default useSidebarStore;

