import { create } from 'zustand';

const useBankStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedBank: null,
    openForm: false,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedBank: (item) => set({ selectedBank: item }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        selectedBank: null,
        openForm: false,
    }),
}));

export default useBankStore;
