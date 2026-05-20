import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/api/roles';

export const getRoles = async () => {
    const response = await axios.get(API_PATH);
    return response.data;
};
