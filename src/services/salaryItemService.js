import HttpService from './HttpService';

export const getAllSalaryItems = () => {
    return HttpService.get('/salary-items');
};

export const saveSalaryItem = (item) => {
    return HttpService.post('/salary-items', item);
};

export const deleteSalaryItem = (id) => {
    return HttpService.delete(`/salary-items/${id}`);
};

export const getStaffSalaryItems = (staffId) => {
    return HttpService.get(`/staff-salary-items/staff/${staffId}`);
};

export const saveStaffSalaryItems = (staffId, items) => {
    return HttpService.post(`/staff-salary-items/staff/${staffId}`, items);
};
