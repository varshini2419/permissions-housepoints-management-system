import axios from 'axios';
import { getApiBaseUrl } from '../config/apiBase';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile')
};

// Permission APIs
export const permissionAPI = {
  create: (data) => api.post('/permissions', data),
  getAll: (params) => api.get('/permissions', { params }),
  getById: (id) => api.get(`/permissions/${id}`),
  updateStatus: (id, data) => api.put(`/permissions/${id}`, data),
  getStats: () => api.get('/permissions/stats')
};

// Activity APIs
export const activityAPI = {
  create: (data) => api.post('/activities', data),
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  approve: (id, data) => api.put(`/activities/${id}/approve`, data),
  reject: (id, data) => api.put(`/activities/${id}/reject`, data),
  getStats: () => api.get('/activities/stats')
};

// House Points APIs
export const housePointAPI = {
  // Get points for current student
  getMyPoints: () => api.get('/housepoints/my-points'),
  
  // Get rank of current student
  getMyRank: () => api.get('/housepoints/my-rank'),
  
  // Get leaderboard (all students ranked by points)
  getLeaderboard: (params) => api.get('/housepoints/leaderboard', { params }),
  
  // Get points for all students in faculty's department
  getDepartmentPoints: () => api.get('/housepoints/department'),
  
  // Get points for a specific student
  getStudentPoints: (studentId) => api.get(`/housepoints/student/${studentId}`),
  
  // Add points to a student (with reason)
  addPoints: (data) => api.post('/housepoints/add', data),
  
  // Deduct points from a student (with reason)
  deductPoints: (data) => api.post('/housepoints/deduct', data),
  
  // Get points history for a student
  getPointsHistory: (studentId) => api.get(`/housepoints/history/${studentId}`),
  
  // Get points summary statistics
  getPointsSummary: () => api.get('/housepoints/summary')
};

// Dashboard APIs
export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getFacultyDashboard: () => api.get('/dashboard/faculty'),
  getHODDashboard: () => api.get('/dashboard/hod'),
  getAdminDashboard: () => api.get('/dashboard/admin')
};

// Upload APIs
export const uploadAPI = {
  uploadDocument: (formData) => api.post('/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;