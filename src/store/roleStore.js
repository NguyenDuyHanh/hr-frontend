import { create } from 'zustand';
import { pagingRoles, deleteRole, saveRole } from '../services/RoleService';

const useRoleStore = create((set, get) => ({
    roles: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedRole: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedRole: (role) => set({ selectedRole: role }),
    resetStore: () => set({
        roles: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        selectedRole: null,
        openForm: false,
    }),

    loadRoles: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword } = get();
            const response = await pagingRoles({ 
                pageIndex: page, 
                pageSize, 
                keyword
            });
            set({ 
                roles: response?.data?.content || [], 
                totalElements: response?.data?.totalElements || 0,
                loading: false 
            });
        } catch (error) {
            console.error('Error loading roles:', error);
            set({ loading: false });
        }
    },

    removeRole: async (id) => {
        try {
            await deleteRole(id);
            get().loadRoles();
        } catch (error) {
            console.error('Error removing role:', error);
            throw error;
        }
    },

    addRole: async (role) => {
        try {
            await saveRole(role);
            get().loadRoles();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding role:', error);
            throw error;
        }
    },

    modifyRole: async (role) => {
        try {
            await saveRole(role);
            get().loadRoles();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying role:', error);
            throw error;
        }
    },
}));

export default useRoleStore;
