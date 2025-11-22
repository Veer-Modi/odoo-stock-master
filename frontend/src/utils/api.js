import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockmaster_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only force redirect to login if user had a token (expired/invalid session)
      const token = localStorage.getItem('stockmaster_token');
      const path = window.location.pathname;
      const onAuthPage = path === '/login' || path === '/signup' || path === '/forgot-password';

      if (token && !onAuthPage) {
        localStorage.removeItem('stockmaster_token');
        localStorage.removeItem('stockmaster_user');
        localStorage.removeItem('stockmaster_auth');
        window.location.href = '/login';
      }
      // If no token, let the requesting page handle the error (e.g., public pages)
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  registerAdmin: (userData) => api.post('/auth/register-admin', userData),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAll: () => api.get('/user'),
  getById: (id) => api.get(`/user/${id}`),
  update: (id, data) => api.put(`/user/${id}`, data),
  delete: (id) => api.delete(`/user/${id}`),
};

// Product API
export const productAPI = {
  getAll: () => api.get('/product'),
  getById: (id) => api.get(`/product/${id}`),
  create: (data) => api.post('/product', data),
  update: (id, data) => api.put(`/product/${id}`, data),
  delete: (id) => api.delete(`/product/${id}`),
};

// Warehouse API
export const warehouseAPI = {
  getAll: () => api.get('/warehouse'),
  getById: (id) => api.get(`/warehouse/${id}`),
  create: (data) => api.post('/warehouse', data),
  update: (id, data) => api.put(`/warehouse/${id}`, data),
  delete: (id) => api.delete(`/warehouse/${id}`),
};

// Stock API
export const stockAPI = {
  getAll: (warehouseId) => api.get('/stock', { params: { warehouseId } }),
  getByProduct: (productId) => api.get(`/stock/${productId}`),
};

// Receipt API
export const receiptAPI = {
  getAll: () => api.get('/receipt'),
  getById: (id) => api.get(`/receipt/${id}`),
  create: (data) => api.post('/receipt', data),
  update: (id, data) => api.put(`/receipt/${id}`, data),
  validate: (id) => api.post(`/receipt/${id}/validate`),
};

// Delivery API
export const deliveryAPI = {
  getAll: () => api.get('/delivery'),
  getById: (id) => api.get(`/delivery/${id}`),
  create: (data) => api.post('/delivery', data),
  update: (id, data) => api.put(`/delivery/${id}`, data),
  pick: (id) => api.post(`/delivery/${id}/pick`),
  pack: (id) => api.post(`/delivery/${id}/pack`),
  validate: (id) => api.post(`/delivery/${id}/validate`),
};

// Transfer API
export const transferAPI = {
  getAll: () => api.get('/transfer'),
  getById: (id) => api.get(`/transfer/${id}`),
  create: (data) => api.post('/transfer', data),
  dispatch: (id) => api.post(`/transfer/${id}/dispatch`),
  receive: (id) => api.post(`/transfer/${id}/receive`),
};

// Adjustment API
export const adjustmentAPI = {
  getAll: () => api.get('/adjustment'),
  getById: (id) => api.get(`/adjustment/${id}`),
  create: (data) => api.post('/adjustment', data),
  validate: (id) => api.post(`/adjustment/${id}/validate`),
};

// Ledger API
export const ledgerAPI = {
  getAll: (params) => api.get('/ledger', { params }),
};

export default api;


