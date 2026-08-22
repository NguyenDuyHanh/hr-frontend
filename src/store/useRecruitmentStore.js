import { create } from 'zustand';

const useRecruitmentStore = create((set) => ({
    // Recruitment states
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
    candidatePage: 1,
    candidatePageSize: 10,
    candidateKeyword: '',
    candidateFilters: {},
    selectedCandidate: null,
    openCandidateForm: false,
    candidateInput: {
        id: null, candidateCode: '', displayName: '', gender: 'Nam', birthDate: '', 
        email: '', phoneNumber: '', address: '', 
        avatarUrl: '', cvFileUrl: '', status: 'SCREENING', recruitmentId: '', departmentId: '', positionId: '', note: ''
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
        recruitmentPage: 1,
        recruitmentPageSize: 10,
        recruitmentKeyword: '',
        recruitmentFilters: {},
        selectedRecruitment: null,
        openRecruitmentForm: false,
        recruitmentInput: {
            id: null, code: '', name: '', description: '', status: 1, personApproveCVId: '', personApproveCVName: ''
        },
        candidatePage: 1,
        candidatePageSize: 10,
        candidateKeyword: '',
        candidateFilters: {},
        selectedCandidate: null,
        openCandidateForm: false,
        candidateInput: {
            id: null, candidateCode: '', displayName: '', gender: 'Nam', birthDate: '', 
            email: '', phoneNumber: '', address: '', 
            avatarUrl: '', cvFileUrl: '', status: 'SCREENING', recruitmentId: '', departmentId: '', positionId: '', note: ''
        }
    }),
}));

export default useRecruitmentStore;
