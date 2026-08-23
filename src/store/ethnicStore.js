import { create } from 'zustand';

const useEthnicStore = create((set) => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    selectedEthnic: null,
    openForm: false,

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedEthnic: (item) => set({ selectedEthnic: item }),
    resetStore: () => set({
        page: 1,
        pageSize: 10,
        keyword: '',
        selectedEthnic: null,
        openForm: false,
    }),
}));

export default useEthnicStore;
