import { create } from 'zustand';

const useStaffStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: {},
    selectedStaff: null,
    openForm: false,

    // UI Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedStaff: (staff) => set({ selectedStaff: staff }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedStaff: null,
        openForm: false,
    }),
}));

export default useStaffStore;
