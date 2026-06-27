import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/departments';

export const pagingDepartments = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getAllDepartments = async () => {
    const response = await axios.get(`${API_PATH}/all`);
    return response.data;
};

export const getDepartmentById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveDepartment = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, dto);
        return response.data;
    }
};

export const deleteDepartment = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};

export const deleteMultipleDepartments = async (ids) => {
    const response = await axios.post(`${API_PATH}/delete-multiple`, ids);
    return response.data;
};

export const generateDepartmentCode = async () => {
    const response = await axios.get(`${API_PATH}/generate-code`);
    return response.data;
};
