import axios from "axios";
import { API_PATHS } from "../constants/apiPaths";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes(API_PATHS.AUTH.PREFIX)) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;