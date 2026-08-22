import { create } from 'zustand';

const useLeaveStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: {},
    selectedRequest: null,
    openForm: false,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedRequest: (request) => set({ selectedRequest: request }),
    resetFilters: () => set({
        keyword: '',
        filters: {},
        page: 1,
    }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedRequest: null,
        openForm: false,
    }),
}));

export default useLeaveStore;
