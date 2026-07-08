// frontend/src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// ============================================
// DETEKSI ENVIRONMENT
// ============================================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================
// URL API - PASTIKAN TIDAK ADA SPASI
// ============================================
const API_URL = isProduction
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://73e9-182-10-130-155.ngrok-free.app/api').trim();

console.log(`🔧 API_URL (${process.env.NODE_ENV}):`, API_URL);

// ============================================
// AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(isDevelopment && { 'ngrok-skip-browser-warning': 'true' })
  },
  withCredentials: false
});

// ============================================
// ✅ REQUEST INTERCEPTOR - CLEAN URL
// ============================================
api.interceptors.request.use(
  (config) => {
    // ✅ CLEAN URL: Hapus spasi dan karakter tidak valid
    if (config.url) {
      // Trim spasi di awal/akhir
      config.url = config.url.trim();
      // Hapus multiple slashes
      config.url = config.url.replace(/\/+/g, '/');
      // Hapus trailing slash (kecuali untuk root)
      if (config.url.length > 1 && config.url.endsWith('/')) {
        config.url = config.url.slice(0, -1);
      }
      // Hapus %20 (spasi) jika ada
      config.url = config.url.replace(/%20/g, '');
    }
    
    // ✅ CLEAN BASEURL
    if (config.baseURL) {
      config.baseURL = config.baseURL.trim();
      if (config.baseURL.endsWith('/')) {
        config.baseURL = config.baseURL.slice(0, -1);
      }
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (isDevelopment) {
      console.log('📤 Request:', {
        method: config.method?.toUpperCase(),
        fullUrl: config.baseURL + config.url,
        url: config.url,
        baseURL: config.baseURL
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('📥 Response:', {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
      console.error('❌ Request URL:', error.config?.url);
      console.error('❌ Request BaseURL:', error.config?.baseURL);
    }
    
    if (error.code === 'ERR_NETWORK') {
      toast.error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        toast.error(data?.message || 'Data yang dikirim tidak valid');
      }
      
      if (status === 401) {
        toast.error('Sesi berakhir. Silakan login kembali.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      if (status === 403) {
        toast.error('Anda tidak memiliki akses');
      }
      
      if (status === 404) {
        toast.error(data?.message || 'Endpoint tidak ditemukan');
      }
      
      if (status >= 500) {
        toast.error('Terjadi kesalahan pada server');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;