import { create } from 'zustand';
import { pagingShifts, getAllShifts, saveShift, deleteShift } from '../services/shiftWorkService';

const useShiftWorkStore = create((set, get) => ({
    shifts: [],
    allShifts: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedShift: null,
    openForm: false,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedShift: (shift) => set({ selectedShift: shift }),

    loadShifts: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword } = get();
            const response = await pagingShifts({
                pageIndex: page,
                pageSize,
                keyword
            });
            set({
                shifts: response?.data?.content || [],
                totalElements: response?.data?.totalElements || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error loading shifts:', error);
            set({ loading: false });
        }
    },

    loadAllShifts: async () => {
        set({ loading: true });
        try {
            const response = await getAllShifts();
            set({
                allShifts: response?.data || [],
                loading: false
            });
        } catch (error) {
            console.error('Error loading all shifts:', error);
            set({ loading: false });
        }
    },

    addShift: async (shift) => {
        try {
            await saveShift(shift);
            get().loadShifts();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding shift:', error);
            throw error;
        }
    },

    modifyShift: async (id, shift) => {
        try {
            await saveShift({ ...shift, id });
            get().loadShifts();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying shift:', error);
            throw error;
        }
    },

    removeShift: async (id) => {
        try {
            await deleteShift(id);
            get().loadShifts();
        } catch (error) {
            console.error('Error removing shift:', error);
            throw error;
        }
    }
}));

export default useShiftWorkStore;
