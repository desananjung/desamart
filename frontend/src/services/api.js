// frontend/src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================
// ✅ UPDATE DENGAN URL NGROK BARU
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://73e9-182-10-130-155.ngrok-free.app/api';

console.log('🔧 API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Skip ngrok warning
  },
  withCredentials: false
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      toast.error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      if (status === 404) {
        toast.error(data?.message || 'Endpoint tidak ditemukan');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;