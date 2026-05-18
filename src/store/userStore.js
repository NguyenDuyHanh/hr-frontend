import { create } from 'zustand';
import { getUsers, deleteUser, saveUser, pagingUsers } from '../services/UserService';

const useUserStore = create((set, get) => ({
    users: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedUser: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedUser: (user) => set({ selectedUser: user }),

    loadUsers: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword } = get();
            const response = await pagingUsers({ pageIndex: page, pageSize, keyword });
            set({ 
                users: response?.data?.content || [], 
                totalElements: response?.data?.totalElements || 0,
                loading: false 
            });
        } catch (error) {
            console.error('Error loading users:', error);
            set({ loading: false });
        }
    },

    removeUser: async (id) => {
        try {
            await deleteUser(id);
            get().loadUsers();
        } catch (error) {
            console.error('Error removing user:', error);
        }
    },

    addUser: async (user) => {
        try {
            await saveUser(user);
            get().loadUsers();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding user:', error);
        }
    },

    modifyUser: async (id, user) => {
        try {
            await saveUser({ ...user, id });
            get().loadUsers();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying user:', error);
        }
    },
}));

export default useUserStore;
