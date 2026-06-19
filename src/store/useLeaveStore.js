import { create } from 'zustand';
import {
    searchLeaveRequests,
    createLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    getLeaveBalance
} from '../services/leaveService';

const useLeaveStore = create((set, get) => ({
    requests: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: {},
    selectedRequest: null,
    openForm: false,
    balance: null,

    // Basic setters
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedRequest: (request) => set({ selectedRequest: request }),
    resetStore: () => set({
        requests: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedRequest: null,
        openForm: false,
        balance: null,
    }),

    // Business actions
    loadRequests: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, filters } = get();
            const response = await searchLeaveRequests({
                pageIndex: page,
                pageSize,
                keyword,
                ...filters
            });
            set({
                requests: response?.data?.content || [],
                totalElements: response?.data?.totalElements || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error loading leave requests:', error);
            set({ loading: false });
        }
    },

    addLeaveRequest: async (dto) => {
        set({ loading: true });
        try {
            await createLeaveRequest(dto);
            set({ openForm: false });
            get().loadRequests();
        } catch (error) {
            console.error('Error creating leave request:', error);
            set({ loading: false });
            throw error;
        }
    },

    modifyLeaveRequest: async (id, dto) => {
        set({ loading: true });
        try {
            await updateLeaveRequest(id, dto);
            set({ openForm: false });
            get().loadRequests();
        } catch (error) {
            console.error('Error updating leave request:', error);
            set({ loading: false });
            throw error;
        }
    },

    removeLeaveRequest: async (id) => {
        set({ loading: true });
        try {
            await deleteLeaveRequest(id);
            get().loadRequests();
        } catch (error) {
            console.error('Error deleting leave request:', error);
            set({ loading: false });
            throw error;
        }
    },

    approveRequest: async (id, rejectReason) => {
        set({ loading: true });
        try {
            await approveLeaveRequest(id, rejectReason);
            get().loadRequests();
        } catch (error) {
            console.error('Error approving leave request:', error);
            set({ loading: false });
            throw error;
        }
    },

    rejectRequest: async (id, rejectReason) => {
        set({ loading: true });
        try {
            await rejectLeaveRequest(id, rejectReason);
            get().loadRequests();
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            set({ loading: false });
            throw error;
        }
    },

    loadLeaveBalance: async (staffId, year) => {
        try {
            const response = await getLeaveBalance(staffId, year);
            set({ balance: response?.data || null });
        } catch (error) {
            console.error('Error loading leave balance:', error);
            set({ balance: null });
        }
    }
}));

export default useLeaveStore;
