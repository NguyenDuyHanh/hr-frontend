import { create } from 'zustand';
import dayjs from 'dayjs';

const useTimesheetStore = create((set) => ({
    page: 1,
    pageSize: 10,
    filters: {
        staffId: null,
        fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        toDate: dayjs().endOf('month').format('YYYY-MM-DD'),
        status: null,
        departmentId: null
    },

    setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters },
        page: 1 
    })),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    
    resetFilters: () => set({
        filters: {
            staffId: null,
            fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
            toDate: dayjs().endOf('month').format('YYYY-MM-DD'),
            status: null,
            departmentId: null
        },
        page: 1
    }),
}));

export default useTimesheetStore;
