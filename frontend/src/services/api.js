import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
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
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 dengan hati-hati
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jangan redirect jika endpoint notifikasi
    const isNotificationEndpoint = error.config?.url?.includes('/notifications');
    
    if (error.response?.status === 401 && !isNotificationEndpoint) {
      console.log('🔒 Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;