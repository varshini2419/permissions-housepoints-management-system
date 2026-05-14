// frontend/src/api/axiosConfig.js
import axios from 'axios';
import { getApiBaseUrl } from '../config/apiBase';

const getBaseURL = () => getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
  withCredentials: true, // Important for cookies if you're using them
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from multiple possible sources
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    }
    
    // Return full Axios response so existing code using response.data continues to work
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ Response Error:', error.response || error);
    }
    
    // Handle token expiration - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${getBaseURL()}/auth/refresh-token`,
            { refreshToken }
          );
          
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied. You do not have permission.');
      // Optionally redirect to dashboard or show notification
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common operations
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem('refreshToken', token);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export default api;