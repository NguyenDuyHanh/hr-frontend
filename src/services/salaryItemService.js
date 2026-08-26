import HttpService from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/salary-items';

export const getAllSalaryItems = () => {
    return HttpService.get(API_PATH);
};

export const saveSalaryItem = (item) => {
    return HttpService.post(API_PATH, item);
};

export const deleteSalaryItem = (id) => {
    return HttpService.delete(`${API_PATH}/${id}`);
};

export { getStaffSalaryItems, saveStaffSalaryItems } from './staffSalaryItemService';


