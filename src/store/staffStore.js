import { create } from 'zustand';
import { getStaffs, deleteStaff, saveStaff } from '../services/StaffService';

const useStaffStore = create((set, get) => ({
    staffs: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    selectedStaff: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedStaff: (staff) => set({ selectedStaff: staff }),

    loadStaffs: async () => {
        set({ loading: true });
        try {
            // Lưu ý: Nếu service hỗ trợ phân trang, hãy truyền params vào đây
            const data = await getStaffs();
            set({ 
                staffs: data || [], 
                totalElements: data?.length || 0,
                loading: false 
            });
        } catch (error) {
            console.error('Error loading staffs:', error);
            set({ loading: false });
        }
    },

    removeStaff: async (id) => {
        try {
            await deleteStaff(id);
            get().loadStaffs();
        } catch (error) {
            console.error('Error removing staff:', error);
        }
    },

    addStaff: async (staff) => {
        try {
            await saveStaff(staff);
            get().loadStaffs();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding staff:', error);
        }
    },

    modifyStaff: async (id, staff) => {
        try {
            await saveStaff({ ...staff, id });
            get().loadStaffs();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying staff:', error);
        }
    },
}));

export default useStaffStore;
