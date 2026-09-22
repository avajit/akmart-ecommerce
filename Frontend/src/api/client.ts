import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../utils/ApiError';
import { ApiErrorResponse } from '../types/api.types';

// Base URL for our backend API
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface for failed queue items
interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}

// Extend InternalAxiosRequestConfig to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ==========================================
// REQUEST INTERCEPTOR: Attach Access Token
// ==========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR: Handle 401 & Normalize Errors
// ==========================================
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 1. Silent Token Refresh Logic for 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(normalizeError(error));
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = 'Bearer ' + token;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // We do NOT send the refreshToken in the body. The browser automatically sends the HTTP-Only cookie.
        const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(normalizeError(refreshError as AxiosError<ApiErrorResponse>));
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Normalize all other errors into an ApiError
    return Promise.reject(normalizeError(error));
  }
);

// Helper to normalize Axios errors into ApiError instances
function normalizeError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (error.response?.data && error.response.data.error) {
    // We successfully received a structured error from the backend
    const { code, message, details } = error.response.data.error;
    return new ApiError(message, code, details);
  }
  
  // Network errors, timeouts, etc.
  return new ApiError(error.message || 'Network Error', 'NETWORK_ERROR');
}

export default apiClient;
