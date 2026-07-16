import { create } from 'zustand';
import { getUsers, deleteUser, saveUser, pagingUsers, lockUser, unlockUser, changePassword } from '../services/UserService';
import { getRoles } from '../services/RoleService';
import { toast } from 'sonner';

const useUserStore = create((set, get) => ({
    users: [],
    roles: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    active: null,
    departmentId: null,
    positionId: null,
    roleId: null,
    selectedUser: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setActive: (active) => set({ active, page: 1 }),
    setDepartmentId: (departmentId) => set({ departmentId, page: 1 }),
    setPositionId: (positionId) => set({ positionId, page: 1 }),
    setRoleId: (roleId) => set({ roleId, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedUser: (user) => set({ selectedUser: user }),
    resetFilters: () => set({ 
        keyword: '', 
        active: null, 
        departmentId: null, 
        positionId: null, 
        roleId: null, 
        page: 1 
    }),
    resetStore: () => set({
        users: [],
        roles: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        active: null,
        departmentId: null,
        positionId: null,
        roleId: null,
        selectedUser: null,
        openForm: false,
    }),

    loadUsers: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, active, departmentId, positionId, roleId } = get();
            const response = await pagingUsers({ 
                pageIndex: page, 
                pageSize, 
                keyword,
                active,
                departmentId,
                positionId,
                roleId
            });
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
            toast.success('Xóa người dùng thành công');
            get().loadUsers();
        } catch (error) {
            console.error('Error removing user:', error);
            const msg = error.response?.data?.message || 'Lỗi khi xóa người dùng';
            toast.error(msg);
            throw error;
        }
    },

    addUser: async (user) => {
        try {
            await saveUser(user);
            toast.success('Thêm người dùng thành công');
            get().loadUsers();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding user:', error);
            const msg = error.response?.data?.message || 'Lỗi khi thêm người dùng';
            toast.error(msg);
            throw error;
        }
    },

    modifyUser: async (id, user) => {
        try {
            await saveUser({ ...user, id });
            toast.success('Cập nhật người dùng thành công');
            get().loadUsers();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying user:', error);
            const msg = error.response?.data?.message || 'Lỗi khi chỉnh sửa người dùng';
            toast.error(msg);
            throw error;
        }
    },

    lockUserAccount: async (id) => {
        try {
            await lockUser(id);
            toast.success('Khóa tài khoản thành công');
            get().loadUsers();
        } catch (error) {
            console.error('Error locking user:', error);
            const msg = error.response?.data?.message || 'Lỗi khi khóa tài khoản';
            toast.error(msg);
            throw error;
        }
    },

    unlockUserAccount: async (id) => {
        try {
            await unlockUser(id);
            toast.success('Mở khóa tài khoản thành công');
            get().loadUsers();
        } catch (error) {
            console.error('Error unlocking user:', error);
            const msg = error.response?.data?.message || 'Lỗi khi mở khóa tài khoản';
            toast.error(msg);
            throw error;
        }
    },

    changeUserPassword: async (data) => {
        try {
            await changePassword(data);
            toast.success('Đổi mật khẩu thành công');
        } catch (error) {
            console.error('Error changing password:', error);
            const msg = error.response?.data?.message || 'Lỗi khi đổi mật khẩu';
            toast.error(msg);
            throw error;
        }
    },

    loadRoles: async () => {
        try {
            const response = await getRoles();
            set({ roles: response?.data || [] });
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    },
}));

export default useUserStore;
