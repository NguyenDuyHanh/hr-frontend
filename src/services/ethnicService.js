import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/ethnics';

export const pagingEthnics = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getAllEthnics = async () => {
    const response = await axios.get(`${API_PATH}/all`);
    return response.data;
};

export const getEthnicById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveEthnic = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, dto);
        return response.data;
    }
};

export const deleteEthnic = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};
