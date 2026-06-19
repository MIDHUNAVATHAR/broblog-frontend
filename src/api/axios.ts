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
                try {
                    const base64Url = accessToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        window.atob(base64)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    );
                    const user = JSON.parse(jsonPayload);
                    localStorage.setItem('user', JSON.stringify({ id: user.id, email: user.email }));
                } catch (e) {
                    console.error("Error decoding token in axios interceptor", e);
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;