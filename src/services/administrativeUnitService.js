import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/administrative-units';

export const pagingAdministrativeUnits = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getAllProvinces = async () => {
    const response = await axios.get(`${API_PATH}/provinces`);
    return response.data;
};

export const getChildrenByParentCode = async (parentCode) => {
    const response = await axios.get(`${API_PATH}/by-parent-code/${parentCode}`);
    return response.data;
};

export const getAdministrativeUnitById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveAdministrativeUnit = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, dto);
        return response.data;
    }
};

export const deleteAdministrativeUnit = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};
