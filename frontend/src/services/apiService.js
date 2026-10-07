import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartCanteenToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const setupCanteen = (data) => api.post('/auth/setup-canteen', data);

export const getMenu = () => api.get('/menu');
export const createMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

export const getStudentOrders = () => api.get('/student/orders');
export const placeOrder = (data) => api.post('/student/orders', data);
export const submitFeedback = (data) => api.post('/student/feedback', data);

export const getStaffOrders = () => api.get('/staff/orders');
export const acceptOrder = (id, estimatedMinutes) => api.put(`/staff/orders/${id}/accept`, { estimatedMinutes });
export const rejectOrder = (id) => api.put(`/staff/orders/${id}/reject`);
export const markReady = (id) => api.put(`/staff/orders/${id}/ready`);
export const markCollected = (id) => api.put(`/staff/orders/${id}/collect`);

export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getUsers = () => api.get('/admin/users');
export const createStaff = (data) => api.post('/admin/staff', data);
export const blockUser = (id) => api.put(`/admin/users/${id}/block`);
export const unblockUser = (id) => api.put(`/admin/users/${id}/unblock`);
export const getFeedback = () => api.get('/admin/feedback');

export default api;
