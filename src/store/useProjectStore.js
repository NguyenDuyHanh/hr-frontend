import { create } from 'zustand';

const useProjectStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: {},
    selectedProject: null,
    openForm: false,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedProject: (project) => set({ selectedProject: project }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedProject: null,
        openForm: false,
    }),
}));

export default useProjectStore;
