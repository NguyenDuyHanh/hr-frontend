import { create } from 'zustand';
import { pagingHolidays, saveHoliday, deleteHoliday } from '../services/holidayService';

const useHolidayStore = create((set, get) => ({
    holidays: [],
    loading: false,
    totalElements: 0,
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

    loadHolidays: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, filterYear, filterFromDate, filterToDate } = get();
            const response = await pagingHolidays({
                pageIndex: page,
                pageSize,
                keyword,
                year: filterYear || null,
                fromDate: filterFromDate || null,
                toDate: filterToDate || null
            });
            set({
                holidays: response?.data?.content || [],
                totalElements: response?.data?.totalElements || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error loading holidays:', error);
            set({ loading: false });
        }
    },

    addHoliday: async (holiday) => {
        try {
            await saveHoliday(holiday);
            get().loadHolidays();
        } catch (error) {
            console.error('Error adding holiday:', error);
            throw error;
        }
    },

    modifyHoliday: async (id, holiday) => {
        try {
            await saveHoliday({ ...holiday, id });
            get().loadHolidays();
        } catch (error) {
            console.error('Error modifying holiday:', error);
            throw error;
        }
    },

    removeHoliday: async (id) => {
        try {
            await deleteHoliday(id);
            get().loadHolidays();
        } catch (error) {
            console.error('Error removing holiday:', error);
            throw error;
        }
    }
}));

export default useHolidayStore;
