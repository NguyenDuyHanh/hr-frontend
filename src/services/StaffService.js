import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/staffs';
const CERT_API_PATH = ConstantList.API_ENPOINT + '/staff-certificates';
const BANK_ACC_API_PATH = ConstantList.API_ENPOINT + '/staff-bank-accounts';

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

export const exportStaffExcel = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/export-excel`, searchDto || {}, {
        responseType: 'blob',
    });
    return response.data;
};

// --- Staff Certificate APIs ---
export const getCertificatesByStaffId = async (staffId, type) => {
    const params = type && type !== 'ALL' ? { type } : {};
    const response = await axios.get(`${CERT_API_PATH}/staff/${staffId}`, { params });
    return response.data;
};

export const saveStaffCertificate = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${CERT_API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(CERT_API_PATH, dto);
        return response.data;
    }
};

export const deleteStaffCertificate = async (id) => {
    const response = await axios.delete(`${CERT_API_PATH}/${id}`);
    return response.data;
};

// --- Staff Bank Account APIs ---
export const getBankAccountsByStaffId = async (staffId) => {
    const response = await axios.get(`${BANK_ACC_API_PATH}/staff/${staffId}`);
    return response.data;
};

export const saveStaffBankAccount = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${BANK_ACC_API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(BANK_ACC_API_PATH, dto);
        return response.data;
    }
};

export const setDefaultStaffBankAccount = async (id) => {
    const response = await axios.put(`${BANK_ACC_API_PATH}/${id}/set-default`);
    return response.data;
};

export const deleteStaffBankAccount = async (id) => {
    const response = await axios.delete(`${BANK_ACC_API_PATH}/${id}`);
    return response.data;
};
