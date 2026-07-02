import { create } from 'zustand';
import { getStaffs, deleteStaff, saveStaff, pagingStaffs } from '../services/StaffService';
import { toast } from 'sonner';

const useStaffStore = create((set, get) => ({
    staffs: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: {},
    selectedStaff: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedStaff: (staff) => set({ selectedStaff: staff }),
    resetStore: () => set({
        staffs: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedStaff: null,
        openForm: false,
    }),

    loadStaffs: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, filters } = get();
            const response = await pagingStaffs({ 
                pageIndex: page, 
                pageSize, 
                keyword,
                ...filters
            });
            set({ 
                staffs: response?.data?.content || [], 
                totalElements: response?.data?.totalElements || 0,
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
            toast.success('Xóa nhân viên thành công');
            get().loadStaffs();
        } catch (error) {
            console.error('Error removing staff:', error);
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa nhân viên');
        }
    },

    addStaff: async (staff) => {
        try {
            await saveStaff(staff);
            toast.success('Thêm mới nhân viên thành công');
            get().loadStaffs();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding staff:', error);
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm mới nhân viên');
            throw error;
        }
    },

    modifyStaff: async (id, staff) => {
        try {
            await saveStaff({ ...staff, id });
            toast.success('Cập nhật nhân viên thành công');
            get().loadStaffs();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying staff:', error);
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhân viên');
            throw error;
        }
    },
}));

export default useStaffStore;
