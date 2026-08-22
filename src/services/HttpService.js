import axios from 'axios';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import ConstantList from '../appConfig';
import { navigateTo } from '../navigation';
import * as AuthService from './AuthService';

const HttpService = axios.create({
    baseURL: ConstantList.API_ENPOINT,
});

HttpService.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        
        // Don't send Authorization header for login and refresh endpoints
        const isAuthUrl = config.url && (
            config.url.includes('/api/auth/login') ||
            config.url.includes('/api/auth/refresh')
        );

        console.log(`[HttpService Request] URL: ${config.url}, HasToken: ${!!token}, Token: ${token ? token.substring(0, 15) + '...' : 'none'}`);
        if (token && !isAuthUrl) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];
let isRedirecting = false;

const handleRedirectToLogin = (message = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!") => {
    if (isRedirecting) return;
    isRedirecting = true;
    
    if (!window.location.pathname.endsWith('/login')) {
        toast.error(message);
        setTimeout(() => {
            useAuthStore.getState().logout();
            navigateTo('/login');
            isRedirecting = false;
        }, 2000);
    } else {
        useAuthStore.getState().logout();
        isRedirecting = false;
    }
};

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

HttpService.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Xử lý 403 Forbidden — không có quyền truy cập
        if (error.response && error.response.status === 403) {
            const message = error.response?.data?.message || 'Bạn không có quyền thực hiện hành động này';
            toast.error(message);
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && originalRequest) {
            // Nếu đã retry rồi nhưng vẫn bị 401 -> Token mới cũng không hợp lệ hoặc đã hết hạn
            if (originalRequest._retry) {
                handleRedirectToLogin();
                return Promise.reject(error);
            }

            // Tránh lặp vô hạn nếu API refresh hoặc login hoặc logout trả về 401
            const isAuthUrl = originalRequest.url && (
                originalRequest.url.includes('/api/auth/refresh') || 
                originalRequest.url.includes('/api/auth/login') ||
                originalRequest.url.includes('/api/auth/logout')
            );

            if (isAuthUrl) {
                // Nếu là API login thất bại, chỉ cần trả về lỗi mà không gọi logout hay redirect
                if (originalRequest.url.includes('/api/auth/login')) {
                    return Promise.reject(error);
                }

                // Nếu là API logout, tránh gọi lại logout() để tránh đệ quy vô hạn
                if (!originalRequest.url.includes('/api/auth/logout')) {
                    handleRedirectToLogin();
                } else {
                    // Đảm bảo state ở client được xóa sạch
                    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
                    if (!window.location.pathname.endsWith('/login')) {
                        navigateTo('/login');
                    }
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest._retry = true; // Đánh dấu đã retry để tránh lặp vô hạn
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return HttpService(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = useAuthStore.getState().refreshToken;
            if (refreshToken) {
                try {
                    // Gọi API refresh token từ AuthService (dùng axiosDirect độc lập để không dính interceptor)
                    const response = await AuthService.refreshToken(refreshToken);

                    if (response.data && response.data.status === 200) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                        
                        // Cập nhật token mới vào Zustand store, giữ lại refresh token cũ nếu backend không trả về cái mới
                        useAuthStore.getState().setAuth(
                            useAuthStore.getState().user,
                            accessToken,
                            newRefreshToken || refreshToken
                        );

                        processQueue(null, accessToken);
                        
                        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                        return HttpService(originalRequest);
                    } else {
                        // Ném lỗi để chạy vào catch block nếu response thành công ở tầng HTTP nhưng dữ liệu không hợp lệ
                        throw new Error(response.data?.message || 'Refresh token failed');
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    handleRedirectToLogin();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                handleRedirectToLogin("Vui lòng đăng nhập để tiếp tục!");
            }
        }
        return Promise.reject(error);
    }
);

export default HttpService;
