import axios from 'axios';
import useUiStore from '../store/uiStore';

const HttpService = axios.create();

HttpService.interceptors.request.use(
    (config) => {
        useUiStore.getState().startLoading();
        return config;
    },
    (error) => {
        useUiStore.getState().stopLoading();
        return Promise.reject(error);
    }
);

HttpService.interceptors.response.use(
    (response) => {
        useUiStore.getState().stopLoading();
        return response;
    },
    (error) => {
        useUiStore.getState().stopLoading();
        return Promise.reject(error);
    }
);

export default HttpService;
