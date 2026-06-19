import axios from './HttpService';
import ConstantList from '../appConfig';

const LEAVE_API_PATH = ConstantList.API_ENPOINT + '/leave-requests';

export const searchLeaveRequests = async (searchRequest) => {
    const response = await axios.post(`${LEAVE_API_PATH}/paging`, searchRequest || {});
    return response.data;
};

export const getLeaveRequestById = async (id) => {
    const response = await axios.get(`${LEAVE_API_PATH}/${id}`);
    return response.data;
};

export const createLeaveRequest = async (dto) => {
    const response = await axios.post(LEAVE_API_PATH, dto);
    return response.data;
};

export const updateLeaveRequest = async (id, dto) => {
    const response = await axios.put(`${LEAVE_API_PATH}/${id}`, dto);
    return response.data;
};

export const deleteLeaveRequest = async (id) => {
    const response = await axios.delete(`${LEAVE_API_PATH}/${id}`);
    return response.data;
};

export const approveLeaveRequest = async (id, rejectReason) => {
    const response = await axios.put(`${LEAVE_API_PATH}/${id}/approve`, null, {
        params: { rejectReason }
    });
    return response.data;
};

export const rejectLeaveRequest = async (id, rejectReason) => {
    const response = await axios.put(`${LEAVE_API_PATH}/${id}/reject`, null, {
        params: { rejectReason }
    });
    return response.data;
};

export const getLeaveBalance = async (staffId, year) => {
    const response = await axios.get(`${LEAVE_API_PATH}/balance/${staffId}/${year}`);
    return response.data;
};

export const getLeaveBalances = async (searchDto, year) => {
    const response = await axios.post(`${LEAVE_API_PATH}/balance/paging`, searchDto || {}, {
        params: { year }
    });
    return response.data;
};
