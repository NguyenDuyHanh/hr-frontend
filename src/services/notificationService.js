import axios from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/notifications';

export const pagingNotifications = async (searchDto) => {
  const response = await axios.post(`${API_PATH}/paging`, searchDto || {});
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get(`${API_PATH}/unread-count`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.put(`${API_PATH}/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.put(`${API_PATH}/read-all`);
  return response.data;
};

export const createNotification = async (noti) => {
  const response = await axios.post(API_PATH, noti);
  return response.data;
};
