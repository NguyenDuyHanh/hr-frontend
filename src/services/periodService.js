import HttpService from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/periods';

export const getAllPeriods = () => {
    return HttpService.get(API_PATH);
};

export const createPeriod = (name, code, description, month, year, fromDate, toDate, standardWorkDays) => {
    return HttpService.post(API_PATH, { name, code, description, month, year, fromDate, toDate, standardWorkDays });
};

export const updatePeriod = (id, name, code, description, month, year, fromDate, toDate, standardWorkDays) => {
    return HttpService.put(`${API_PATH}/${id}`, { name, code, description, month, year, fromDate, toDate, standardWorkDays });
};

export const deletePeriod = (id) => {
    return HttpService.delete(`${API_PATH}/${id}`);
};

export const searchPeriods = (searchDto) => {
    return HttpService.post(`${API_PATH}/paging`, searchDto);
};

