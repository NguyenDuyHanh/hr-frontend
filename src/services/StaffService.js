import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/staffs';

export const getStaffs = async () => {
    const response = await axios.get(API_PATH);
    return response.data;
};

export const pagingStaffs = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getStaffById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveStaff = async (staff) => {
    if (staff.id) {
        const response = await axios.put(`${API_PATH}/${staff.id}`, staff);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, staff);
        return response.data;
    }
};

export const deleteStaff = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};

export const generateStaffCode = async () => {
    const response = await axios.get(`${API_PATH}/generate-staff-code`);
    return response.data;
};

export const getDepartments = async () => {
    const response = await axios.get(`${API_PATH}/departments`);
    return response.data;
};

export const getPositions = async () => {
    const response = await axios.get(`${API_PATH}/positions`);
    return response.data;
};
