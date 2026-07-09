// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email, password, redirectTo = '/') => {
  try {
    console.log('📤 Login payload:', { email, password });
    
    const response = await api.post('/auth/login', { email, password });
    console.log('📥 Login response:', response.data);

    // ✅ PERBAIKAN: Cek success atau status
    if (response.data.success || response.data.status === 'success') {
      // Ambil data dari berbagai kemungkinan format
      const data = response.data.data || response.data;
      const user = data.user || data;
      const token = data.token || response.data.token;
      
      // Simpan token dan user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set user di state
      setUser(user);
      
      // Set header Authorization
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Login successful for:', user.email || user.name);
      
      // Redirect
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        // Redirect berdasarkan role
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'SELLER') {
          navigate('/seller/dashboard');
        } else {
          navigate('/marketplace');
        }
      }
      
      return { success: true, user };
    } else {
      console.error('❌ Login failed:', response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Gagal login' 
    };
  }
};

  // ============================================
  // REGISTER
  // ============================================
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      console.log('📥 Register response:', response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        navigate('/marketplace');
        return { success: true, user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Gagal registrasi' 
      };
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  // ============================================
  // CHECK AUTH
  // ============================================
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(savedUser));
          
          // Verifikasi token dengan server
          try {
            const response = await api.get('/auth/profile');
            if (response.data.success) {
              setUser(response.data.data);
              localStorage.setItem('user', JSON.stringify(response.data.data));
            }
          } catch (err) {
            // Jika 404, tetap pakai user dari localStorage
            if (err.response?.status !== 404) {
              console.warn('Auth check warning:', err.message);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;