import HttpService from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/staff-salary-items';

export const getStaffSalaryItems = (staffId) => {
    return HttpService.get(`${API_PATH}/staff/${staffId}`);
};

export const saveStaffSalaryItems = (staffId, items) => {
    return HttpService.post(`${API_PATH}/staff/${staffId}`, items);
};
