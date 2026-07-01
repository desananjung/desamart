import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Pastikan port 8000
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk menyertakan token jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk menangani error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;