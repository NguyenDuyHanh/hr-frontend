import { useQuery } from '@tanstack/react-query';
import { pagingRecruitments } from '../../../services/recruitmentService';
import { pagingCandidates } from '../../../services/candidateService';

export const recruitmentKeys = {
  all: ['recruitments'],
  list: (params) => [...recruitmentKeys.all, 'list', params],
  candidates: (recruitmentId, params) => [...recruitmentKeys.all, 'candidates', recruitmentId, params],
};

export const useRecruitments = (params) => {
  return useQuery({
    queryKey: recruitmentKeys.list(params),
    queryFn: async () => {
      const res = await pagingRecruitments(params);
      return res?.data || { content: [], totalElements: 0 };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};

export const useCandidates = (recruitmentId, params) => {
  return useQuery({
    queryKey: recruitmentKeys.candidates(recruitmentId, params),
    queryFn: async () => {
      if (!recruitmentId) return { content: [], totalElements: 0 };
      const res = await pagingCandidates({ ...params, recruitmentId });
      return res?.data || { content: [], totalElements: 0 };
    },
    enabled: !!recruitmentId,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });
};
