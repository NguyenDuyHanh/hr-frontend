import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/holidays';

export const pagingHolidays = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getAllHolidays = async () => {
    const response = await axios.get(API_PATH);
    return response.data;
};

export const getHolidaysByYear = async (year) => {
    const response = await axios.get(`${API_PATH}/year/${year}`);
    return response.data;
};

export const getHolidayById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveHoliday = async (dto) => {
    if (dto.id) {
        const response = await axios.put(`${API_PATH}/${dto.id}`, dto);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, dto);
        return response.data;
    }
};

export const deleteHoliday = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};
