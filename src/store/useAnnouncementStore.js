import { create } from 'zustand';

const useAnnouncementStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    filterCategory: '',
    filterStatus: '',

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilterCategory: (filterCategory) => set({ filterCategory, page: 1 }),
    setFilterStatus: (filterStatus) => set({ filterStatus, page: 1 }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        filterCategory: '',
        filterStatus: '',
    }),
}));

export default useAnnouncementStore;
