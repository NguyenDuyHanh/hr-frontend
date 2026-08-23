import { create } from 'zustand';

const useAdministrativeUnitStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedUnit: null,
    openForm: false,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedUnit: (item) => set({ selectedUnit: item }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        selectedUnit: null,
        openForm: false,
    }),
}));

export default useAdministrativeUnitStore;
