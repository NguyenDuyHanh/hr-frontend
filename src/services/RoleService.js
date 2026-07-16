import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/roles';

export const getRoles = async () => {
    const response = await axios.get(API_PATH);
    return response.data;
};

export const pagingRoles = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getRoleById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveRole = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, dto);
        return response.data;
    }
};

export const deleteRole = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};

export const deleteMultipleRoles = async (ids) => {
    const response = await axios.post(`${API_PATH}/delete-multiple`, ids);
    return response.data;
};
