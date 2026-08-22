import { create } from 'zustand';

const useUserStore = create((set) => ({
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
}));

export default useUserStore;
