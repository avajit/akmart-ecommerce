import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../utils/ApiError';
import { ApiErrorResponse } from '../types/api.types';
import { clearPersistedAuthState } from '../utils/authSession';

// Base URL for our backend API
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api/v1';

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) sessionStorage.setItem('akmart_access_token', token);
      else sessionStorage.removeItem('akmart_access_token');
    } catch {}
  }
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
  if (typeof window !== 'undefined') {
    try { sessionStorage.removeItem('akmart_access_token'); } catch {}
  }
};

export const getAccessToken = () => {
  if (!inMemoryAccessToken && typeof window !== 'undefined') {
    try {
      inMemoryAccessToken = sessionStorage.getItem('akmart_access_token');
    } catch {}
  }
  return inMemoryAccessToken;
};

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

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
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = res.data.data.accessToken;
        setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        clearAccessToken();
        clearPersistedAuthState();
        window.location.href = '/login';
        return Promise.reject(normalizeError(refreshError as AxiosError<ApiErrorResponse>));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (error.response?.data) {
    const data: any = error.response.data;
    const message = data.message || data.error?.message || error.message || 'Something went wrong';
    const code = data.error?.errorCode || data.error?.code || 'UNKNOWN_ERROR';
    const details = data.errors || data.error?.details;
    return new ApiError(message, String(code), details);
  }
  return new ApiError(error.message || 'Network Error', 'NETWORK_ERROR');
}

export default apiClient;
