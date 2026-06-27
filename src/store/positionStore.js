import { create } from 'zustand';
import { pagingPositions, deletePosition, savePosition } from '../services/positionService';

const usePositionStore = create((set, get) => ({
    positions: [],
    loading: false,
    totalElements: 0,
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
        positions: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedPosition: null,
        openForm: false,
    }),

    loadPositions: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, filters } = get();
            const response = await pagingPositions({ 
                pageIndex: page, 
                pageSize, 
                keyword,
                ...filters
            });
            set({ 
                positions: response?.data?.content || [], 
                totalElements: response?.data?.totalElements || 0,
                loading: false 
            });
        } catch (error) {
            console.error('Error loading positions:', error);
            set({ loading: false });
        }
    },

    removePosition: async (id) => {
        try {
            await deletePosition(id);
            get().loadPositions();
        } catch (error) {
            console.error('Error removing position:', error);
            throw error;
        }
    },

    addPosition: async (pos) => {
        try {
            await savePosition(pos);
            get().loadPositions();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding position:', error);
            throw error;
        }
    },

    modifyPosition: async (pos) => {
        try {
            await savePosition(pos);
            get().loadPositions();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying position:', error);
            throw error;
        }
    },
}));

export default usePositionStore;
