import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/api/users';

export const getUsers = async () => {
    const response = await axios.get(API_PATH);
    return response.data;
};

export const pagingUsers = async (searchDto) => {
    const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
    return response.data;
};

export const getUserById = async (id) => {
    const response = await axios.get(`${API_PATH}/${id}`);
    return response.data;
};

export const saveUser = async (user) => {
    if (user.id) {
        const response = await axios.put(`${API_PATH}/${user.id}`, user);
        return response.data;
    } else {
        const response = await axios.post(API_PATH, user);
        return response.data;
    }
};

export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_PATH}/${id}`);
    return response.data;
};
