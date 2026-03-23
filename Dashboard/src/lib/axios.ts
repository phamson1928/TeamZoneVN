import axios from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        // Automatically unpack NestJS "success: true, data: {...}" wrapper
        if (response.data && response.data.success === true && response.data.data !== undefined) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            // Clear storage and redirect on auth errors
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else {
            const message = error.response?.data?.message || 'An error occurred. Please try again later.';
            // Handle array messages from Validation Pipe
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        }
        return Promise.reject(error);
    }
);
