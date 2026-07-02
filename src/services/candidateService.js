import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/candidates';

export const pagingCandidates = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getCandidateById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveCandidate = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, dto);
        return response.data;
    }
};

export const deleteCandidate = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};

export const deleteMultipleCandidates = async (ids) => {
    const response = await axios.post(`${API_PATH}/delete-multiple`, ids);
    return response.data;
};

export const generateCandidateCode = async () => {
    const response = await axios.get(`${API_PATH}/generate-code`);
    return response.data;
};

export const updateCandidateStatus = async (id, status, refusalReason) => {
    const response = await axios.put(`${API_PATH}/${id}/status`, null, {
        params: { status, refusalReason }
    });
    return response.data;
};
