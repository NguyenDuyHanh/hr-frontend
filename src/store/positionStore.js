import { create } from 'zustand';

const usePositionStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: {},
    selectedPosition: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedPosition: (pos) => set({ selectedPosition: pos }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedPosition: null,
        openForm: false,
    }),
}));

export default usePositionStore;
