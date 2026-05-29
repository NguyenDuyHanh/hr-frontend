import axios from './HttpService';
import axiosDirect from 'axios';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/api/auth';

/**
 * AuthService - Quản lý các cuộc gọi API liên quan đến Xác thực
 */
export const login = async (username, password) => {
  return await axios.post(`${API_PATH}/login`, {
    username: username.trim(),
    password: password.trim(),
  });
};

export const logout = async () => {
  return await axios.post(`${API_PATH}/logout`);
};

export const getCurrentUser = async () => {
  return await axios.get(`${API_PATH}/getCurrentUser`);
};

export const refreshToken = async (token) => {
  return await axiosDirect.post(`${API_PATH}/refresh`, {
    refreshToken: token
  });
};

