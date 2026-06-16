    import { create } from 'zustand';
import { searchPeriods, getAllPeriods, createPeriod, updatePeriod, deletePeriod } from '../services/periodService';

const usePeriodStore = create((set, get) => ({
    periods: [],
    allPeriods: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    filterMonth: '',
    filterYear: '',
    selectedPeriod: null,
    openForm: false,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilterMonth: (month) => set({ filterMonth: month, page: 1 }),
    setFilterYear: (year) => set({ filterYear: year, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedPeriod: (period) => set({ selectedPeriod: period }),

    loadPeriods: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, filterMonth, filterYear } = get();
            const response = await searchPeriods({
                pageIndex: page,
                pageSize,
                keyword,
                month: filterMonth ? Number(filterMonth) : null,
                year: filterYear ? Number(filterYear) : null
            });
            const data = response?.data?.data || response?.data;
            set({
                periods: data?.content || [],
                totalElements: data?.totalElements || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error loading periods:', error);
            set({ loading: false });
        }
    },

    loadAllPeriods: async () => {
        set({ loading: true });
        try {
            const response = await getAllPeriods();
            const data = response?.data?.data || response?.data || [];
            set({
                allPeriods: data,
                loading: false
            });
        } catch (error) {
            console.error('Error loading all periods:', error);
            set({ loading: false });
        }
    },

    addPeriod: async (name, code, description, month, year, fromDate, toDate, standardWorkDays) => {
        try {
            await createPeriod(name, code, description, month, year, fromDate, toDate, standardWorkDays);
            get().loadPeriods();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding period:', error);
            throw error;
        }
    },

    modifyPeriod: async (id, name, code, description, month, year, fromDate, toDate, standardWorkDays) => {
        try {
            await updatePeriod(id, name, code, description, month, year, fromDate, toDate, standardWorkDays);
            get().loadPeriods();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying period:', error);
            throw error;
        }
    },

    removePeriod: async (id) => {
        try {
            await deletePeriod(id);
            get().loadPeriods();
        } catch (error) {
            console.error('Error removing period:', error);
            throw error;
        }
    }
}));

export default usePeriodStore;
