import { create } from 'zustand';
import { pagingProjects, deleteProject, saveProject, finishProject, unfinishProject } from '../services/projectService';

const useProjectStore = create((set, get) => ({
    projects: [],
    loading: false,
    totalElements: 0,
    page: 1,
    pageSize: 10,
    keyword: '',
    filters: {},
    selectedProject: null,
    openForm: false,

    // Actions
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    setKeyword: (keyword) => set({ keyword, page: 1 }),
    setFilters: (filters) => set({ filters, page: 1 }),
    setOpenForm: (open) => set({ openForm: open }),
    setSelectedProject: (project) => set({ selectedProject: project }),
    resetStore: () => set({
        projects: [],
        loading: false,
        totalElements: 0,
        page: 1,
        pageSize: 10,
        keyword: '',
        filters: {},
        selectedProject: null,
        openForm: false,
    }),

    loadProjects: async () => {
        set({ loading: true });
        try {
            const { page, pageSize, keyword, filters } = get();
            const response = await pagingProjects({ 
                pageIndex: page, 
                pageSize, 
                keyword,
                ...filters
            });
            set({ 
                projects: response?.data?.content || [], 
                totalElements: response?.data?.totalElements || 0,
                loading: false 
            });
        } catch (error) {
            console.error('Error loading projects:', error);
            set({ loading: false });
        }
    },

    removeProject: async (id) => {
        try {
            await deleteProject(id);
            get().loadProjects();
        } catch (error) {
            console.error('Error removing project:', error);
        }
    },

    addProject: async (project) => {
        try {
            await saveProject(project);
            get().loadProjects();
            set({ openForm: false });
        } catch (error) {
            console.error('Error adding project:', error);
        }
    },

    modifyProject: async (id, project) => {
        try {
            await saveProject({ ...project, id });
            get().loadProjects();
            set({ openForm: false });
        } catch (error) {
            console.error('Error modifying project:', error);
        }
    },

    completeProject: async (id) => {
        try {
            await finishProject(id);
            get().loadProjects();
        } catch (error) {
            console.error('Error finishing project:', error);
        }
    },

    uncompleteProject: async (id) => {
        try {
            await unfinishProject(id);
            get().loadProjects();
        } catch (error) {
            console.error('Error unfinishing project:', error);
        }
    }
}));

export default useProjectStore;
