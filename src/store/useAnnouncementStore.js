import { create } from 'zustand';
import * as notificationService from '../services/notificationService';

const useAnnouncementStore = create((set, get) => ({
    announcements: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    filterCategory: '',
    filterStatus: '',

    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilterCategory: (filterCategory) => set({ filterCategory, page: 1 }),
    setFilterStatus: (filterStatus) => set({ filterStatus, page: 1 }),

    loadAnnouncements: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, filterCategory, filterStatus } = get();
            const response = await notificationService.pagingAnnouncements({
                pageIndex: page,
                pageSize,
                keyword: keyword || null,
                category: filterCategory || null,
                status: filterStatus || null
            });
            
            set({
                announcements: response?.data?.content || [],
                totalElements: response?.data?.totalElements || 0,
                loading: false
            });
        } catch (error) {
            console.error('Error loading announcements:', error);
            set({ loading: false });
        }
    },

    addAnnouncement: async (announcement) => {
        try {
            await notificationService.saveAnnouncement(announcement);
            get().loadAnnouncements();
        } catch (error) {
            console.error('Error adding announcement:', error);
            throw error;
        }
    },

    modifyAnnouncement: async (id, announcement) => {
        try {
            await notificationService.saveAnnouncement({ ...announcement, id });
            get().loadAnnouncements();
        } catch (error) {
            console.error('Error modifying announcement:', error);
            throw error;
        }
    },

    removeAnnouncement: async (id) => {
        try {
            await notificationService.deleteAnnouncement(id);
            get().loadAnnouncements();
        } catch (error) {
            console.error('Error removing announcement:', error);
            throw error;
        }
    }
}));

export default useAnnouncementStore;
