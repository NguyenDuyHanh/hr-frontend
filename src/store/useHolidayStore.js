import { create } from 'zustand';

const useHolidayStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    filterYear: '',
    filterFromDate: null,
    filterToDate: null,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilterYear: (filterYear) => set({ filterYear, page: 1 }),
    setFilterFromDate: (filterFromDate) => set({ filterFromDate, page: 1 }),
    setFilterToDate: (filterToDate) => set({ filterToDate, page: 1 }),
    resetFilters: () => set({
        keyword: '',
        filterYear: '',
        filterFromDate: null,
        filterToDate: null,
        page: 1,
    }),
}));

export default useHolidayStore;
