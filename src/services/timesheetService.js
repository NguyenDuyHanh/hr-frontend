import axios from './HttpService';
import ConstantList from '../appConfig';

const TIMESHEET_API_PATH = ConstantList.API_ENPOINT + '/timesheets';
const CHECK_IN_OUT_API_PATH = ConstantList.API_ENPOINT + '/check-in-out';

// Timesheet APIs
export const searchTimesheets = async (searchRequest) => {
    const response = await axios.post(`${TIMESHEET_API_PATH}/paging`, searchRequest || {});
    return response.data;
};

export const getTimesheetById = async (id) => {
    const response = await axios.get(`${TIMESHEET_API_PATH}/${id}`);
    return response.data;
};

export const approveTimesheet = async (id, status, note) => {
    const response = await axios.put(`${TIMESHEET_API_PATH}/${id}/approve`, null, {
        params: { status, note }
    });
    return response.data;
};

export const getTimesheetByStaffAndRange = async (staffId, fromDate, toDate) => {
    const response = await axios.get(`${TIMESHEET_API_PATH}/staff-range`, {
        params: { staffId, fromDate, toDate }
    });
    return response.data;
};

// Check-in/out APIs
export const logCheckInOut = async (checkInOutDto) => {
    const response = await axios.post(CHECK_IN_OUT_API_PATH, checkInOutDto);
    return response.data;
};

export const getRawLogs = async (staffId, date) => {
    const response = await axios.get(`${CHECK_IN_OUT_API_PATH}/raw-logs`, {
        params: { staffId, date }
    });
    return response.data;
};
