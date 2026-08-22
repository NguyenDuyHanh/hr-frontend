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

const ANNOUNCEMENT_API_PATH = ConstantList.API_ENPOINT + '/announcements';

export const pagingAnnouncements = async (searchDto) => {
  const response = await axios.post(`${ANNOUNCEMENT_API_PATH}/paging`, searchDto || {});
  return response.data;
};

export const getAnnouncementById = async (id) => {
  const response = await axios.get(`${ANNOUNCEMENT_API_PATH}/${id}`);
  return response.data;
};

export const saveAnnouncement = async (dto) => {
  const response = await axios.post(ANNOUNCEMENT_API_PATH, dto);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await axios.delete(`${ANNOUNCEMENT_API_PATH}/${id}`);
  return response.data;
};

export const generateAnnouncementCode = async () => {
  const response = await axios.get(`${ANNOUNCEMENT_API_PATH}/generate-code`);
  return response.data;
};

