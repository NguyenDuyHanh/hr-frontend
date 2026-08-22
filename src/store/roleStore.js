import { create } from 'zustand';

const useRoleStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedRole: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedRole: (role) => set({ selectedRole: role }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        selectedRole: null,
        openForm: false,
    }),
}));

export default useRoleStore;
