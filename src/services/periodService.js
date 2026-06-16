import HttpService from './HttpService';

export const getAllPeriods = () => {
    return HttpService.get('/periods');
};

export const createPeriod = (name, code, description, month, year, fromDate, toDate, standardWorkDays) => {
    return HttpService.post('/periods', { name, code, description, month, year, fromDate, toDate, standardWorkDays });
};

export const updatePeriod = (id, name, code, description, month, year, fromDate, toDate, standardWorkDays) => {
    return HttpService.put(`/periods/${id}`, { name, code, description, month, year, fromDate, toDate, standardWorkDays });
};

export const deletePeriod = (id) => {
    return HttpService.delete(`/periods/${id}`);
};

export const searchPeriods = (searchDto) => {
    return HttpService.post('/periods/paging', searchDto);
};
