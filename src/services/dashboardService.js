import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/dashboard';

export const getDashboardSummary = async () => {
    const response = await axios.get(`${API_PATH}/summary`);
    return response.data;
};
