import { create } from 'zustand';

const useDepartmentStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedDepartment: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        selectedDepartment: null,
        openForm: false,
    }),
}));

export default useDepartmentStore;
