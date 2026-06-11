import { create } from 'zustand';
import { pagingRecruitments, saveRecruitment, deleteRecruitment } from '../services/recruitmentService';
import { pagingCandidates, saveCandidate, deleteCandidate, updateCandidateStatus, convertToStaff } from '../services/candidateService';

const useRecruitmentStore = create((set, get) => ({
    // Recruitment states
    recruitments: [],
    loadingRecruitments: false,
    totalRecruitments: 0,
    recruitmentPage: 1,
    recruitmentPageSize: 10,
    recruitmentKeyword: '',
    recruitmentFilters: {},
    selectedRecruitment: null,
    openRecruitmentForm: false,
    recruitmentInput: {
        id: null, code: '', name: '', description: '', status: 1, personApproveCVId: '', personApproveCVName: ''
    },

    // Candidate states
    candidates: [],
    loadingCandidates: false,
    totalCandidates: 0,
    candidatePage: 1,
    candidatePageSize: 10,
    candidateKeyword: '',
    candidateFilters: {},
    selectedCandidate: null,
    openCandidateForm: false,
    candidateInput: {
        id: null, candidateCode: '', displayName: '', gender: 'Nam', birthDate: '', 
        email: '', phoneNumber: '', currentResidence: '', 
        imagePath: '', cvFilePath: '', status: 0, recruitmentId: '', departmentId: '', positionId: '', note: ''
    },

    // Actions
    setRecruitmentPage: (page) => set({ recruitmentPage: page }),
    setRecruitmentPageSize: (pageSize) => set({ recruitmentPageSize: pageSize, recruitmentPage: 1 }),
    setRecruitmentKeyword: (keyword) => set({ recruitmentKeyword: keyword, recruitmentPage: 1 }),
    setRecruitmentFilters: (filters) => set({ recruitmentFilters: filters, recruitmentPage: 1 }),
    setSelectedRecruitment: (recruitment) => set({ selectedRecruitment: recruitment }),
    setOpenRecruitmentForm: (open) => set({ openRecruitmentForm: open }),
    setRecruitmentInput: (input) => set({ recruitmentInput: input }),

    setCandidatePage: (page) => set({ candidatePage: page }),
    setCandidatePageSize: (pageSize) => set({ candidatePageSize: pageSize, candidatePage: 1 }),
    setCandidateKeyword: (keyword) => set({ candidateKeyword: keyword, candidatePage: 1 }),
    setCandidateFilters: (filters) => set({ candidateFilters: filters, candidatePage: 1 }),
    setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
    setOpenCandidateForm: (open) => set({ openCandidateForm: open }),
    setCandidateInput: (input) => set({ candidateInput: input }),

    resetStore: () => set({
        recruitments: [],
        loadingRecruitments: false,
        totalRecruitments: 0,
        recruitmentPage: 1,
        recruitmentPageSize: 10,
        recruitmentKeyword: '',
        recruitmentFilters: {},
        selectedRecruitment: null,
        openRecruitmentForm: false,
        recruitmentInput: {
            id: null, code: '', name: '', description: '', status: 1, personApproveCVId: '', personApproveCVName: ''
        },
        candidates: [],
        loadingCandidates: false,
        totalCandidates: 0,
        candidatePage: 1,
        candidatePageSize: 10,
        candidateKeyword: '',
        candidateFilters: {},
        selectedCandidate: null,
        openCandidateForm: false,
        candidateInput: {
            id: null, candidateCode: '', displayName: '', gender: 'Nam', birthDate: '', 
            email: '', phoneNumber: '', currentResidence: '', 
            imagePath: '', cvFilePath: '', status: 0, recruitmentId: '', departmentId: '', positionId: '', note: ''
        }
    }),

    loadRecruitments: async () => {
        set({ loadingRecruitments: true });
        try {
            const { recruitmentPage, recruitmentPageSize, recruitmentKeyword, recruitmentFilters } = get();
            const res = await pagingRecruitments({
                pageIndex: recruitmentPage,
                pageSize: recruitmentPageSize,
                keyword: recruitmentKeyword,
                ...recruitmentFilters
            });
            set({
                recruitments: res?.data?.content || [],
                totalRecruitments: res?.data?.totalElements || 0,
                loadingRecruitments: false
            });
        } catch (err) {
            console.error("Lỗi tải danh sách tin tuyển dụng:", err);
            set({ loadingRecruitments: false });
        }
    },

    loadCandidates: async () => {
        const { selectedRecruitment, candidatePage, candidatePageSize, candidateKeyword, candidateFilters } = get();
        if (!selectedRecruitment?.id) {
            set({ candidates: [], totalCandidates: 0 });
            return;
        }
        set({ loadingCandidates: true });
        try {
            const res = await pagingCandidates({
                pageIndex: candidatePage,
                pageSize: candidatePageSize,
                keyword: candidateKeyword,
                recruitmentId: selectedRecruitment.id,
                ...candidateFilters
            });
            set({
                candidates: res?.data?.content || [],
                totalCandidates: res?.data?.totalElements || 0,
                loadingCandidates: false
            });
        } catch (err) {
            console.error("Lỗi tải danh sách ứng viên:", err);
            set({ loadingCandidates: false });
        }
    },

    addRecruitment: async (values) => {
        try {
            await saveRecruitment(values);
            get().loadRecruitments();
            set({ openRecruitmentForm: false });
        } catch (err) {
            console.error("Error saving recruitment:", err);
            throw err;
        }
    },

    removeRecruitment: async (id) => {
        try {
            await deleteRecruitment(id);
            get().loadRecruitments();
        } catch (err) {
            console.error("Error removing recruitment:", err);
            throw err;
        }
    },

    addCandidate: async (values) => {
        try {
            await saveCandidate(values);
            get().loadCandidates();
            set({ openCandidateForm: false });
        } catch (err) {
            console.error("Error saving candidate:", err);
            throw err;
        }
    },

    removeCandidate: async (id) => {
        try {
            await deleteCandidate(id);
            get().loadCandidates();
        } catch (err) {
            console.error("Error removing candidate:", err);
            throw err;
        }
    },

    changeCandidateStatus: async (candidateId, status, reason) => {
        try {
            await updateCandidateStatus(candidateId, status, reason);
            get().loadCandidates();
        } catch (err) {
            console.error("Error changing candidate status:", err);
            throw err;
        }
    },

    onboardCandidate: async (id) => {
        try {
            await convertToStaff(id);
            get().loadCandidates();
        } catch (err) {
            console.error("Error onboarding candidate:", err);
            throw err;
        }
    }
}));

export default useRecruitmentStore;
