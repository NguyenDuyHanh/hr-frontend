import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/banks';

export const pagingBanks = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getAllBanks = async () => {
    const response = await axios.get(`${API_PATH}/all`);
    return response.data;
};

export const getBankById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveBank = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, dto);
        return response.data;
    }
};

export const deleteBank = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};
