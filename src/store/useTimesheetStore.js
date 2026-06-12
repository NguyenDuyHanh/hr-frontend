import { create } from 'zustand';
import { 
    searchTimesheets, 
    getTimesheetById, 
    approveTimesheet, 
    getTimesheetByStaffAndRange, 
    logCheckInOut,
    getRawLogs 
} from '../services/timesheetService';

const useTimesheetStore = create((set, get) => ({
    timesheets: [],
    totalElements: 0,
    page: 1,
    pageSize: 10,
    filters: {
        staffId: null,
        fromDate: null,
        toDate: null,
        status: null,
        departmentId: null
    },
    loading: false,
    myTimesheets: [],
    currentTimesheet: null,
    rawLogs: [],

    setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters },
        page: 1 
    })),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    
    resetFilters: () => set({
        filters: {
            staffId: null,
            fromDate: null,
            toDate: null,
            status: null,
            departmentId: null
        },
        page: 1
    }),

    loadTimesheets: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, filters } = get();
            const searchRequest = {
                pageIndex: page,
                pageSize,
                ...filters
            };
            // Clean empty values
            Object.keys(searchRequest).forEach(key => {
                if (searchRequest[key] === null || searchRequest[key] === undefined || searchRequest[key] === '') {
                    delete searchRequest[key];
                }
            });
            const response = await searchTimesheets(searchRequest);
            set({
                timesheets: response?.data?.content || [],
                totalElements: response?.data?.totalElements || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error loading timesheets:', error);
            set({ loading: false });
        }
    },

    loadMyTimesheets: async (staffId, fromDate, toDate) => {
        if (!staffId || !fromDate || !toDate) return;
        set({ loading: true });
        try {
            const response = await getTimesheetByStaffAndRange(staffId, fromDate, toDate);
            set({
                myTimesheets: response?.data || [],
                loading: false
            });
        } catch (error) {
            console.error('Error loading my timesheets:', error);
            set({ loading: false });
        }
    },

    loadTimesheetById: async (id) => {
        set({ loading: true });
        try {
            const response = await getTimesheetById(id);
            set({
                currentTimesheet: response?.data || null,
                loading: false
            });
        } catch (error) {
            console.error('Error loading timesheet by ID:', error);
            set({ loading: false });
        }
    },

    updateTimesheetStatus: async (id, status, note) => {
        try {
            await approveTimesheet(id, status, note);
            get().loadTimesheets();
        } catch (error) {
            console.error('Error updating timesheet status:', error);
            throw error;
        }
    },

    checkInOut: async (dto) => {
        try {
            const response = await logCheckInOut(dto);
            return response;
        } catch (error) {
            console.error('Error check in out:', error);
            throw error;
        }
    },

    loadRawLogs: async (staffId, date) => {
        if (!staffId || !date) return;
        try {
            const response = await getRawLogs(staffId, date);
            set({ rawLogs: response?.data || [] });
        } catch (error) {
            console.error('Error loading raw logs:', error);
        }
    }
}));

export default useTimesheetStore;
