import { create } from 'zustand';
import { pagingDepartments, deleteDepartment, saveDepartment } from '../services/departmentService';

const useDepartmentStore = create((set, get) => ({
    departments: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedDepartment: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
    resetStore: () => set({
        departments: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        selectedDepartment: null,
        openForm: false,
    }),

    loadDepartments: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword } = get();
            const response = await pagingDepartments({ 
                pageIndex: page, 
                pageSize, 
                keyword
            });
            set({ 
                departments: response?.data?.content || [], 
                totalElements: response?.data?.totalElements || 0,
                loading: false 
            });
        } catch (error) {
            console.error('Error loading departments:', error);
            set({ loading: false });
        }
    },

    removeDepartment: async (id) => {
        try {
            await deleteDepartment(id);
            get().loadDepartments();
        } catch (error) {
            console.error('Error removing department:', error);
            throw error;
        }
    },

    addDepartment: async (dept) => {
        try {
            await saveDepartment(dept);
            get().loadDepartments();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding department:', error);
            throw error;
        }
    },

    modifyDepartment: async (dept) => {
        try {
            await saveDepartment(dept);
            get().loadDepartments();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying department:', error);
            throw error;
        }
    },
}));

export default useDepartmentStore;
