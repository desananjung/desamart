// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cek user saat pertama kali load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verifikasi token dengan backend
          const response = await api.get('/auth/profile');
          if (response.data.success) {
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          } else {
            // Token invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // ============================================
  // REGISTER
  // ============================================
  const register = async (name, email, password, role = 'BUYER') => {
    setLoading(true);
    setError(null);
    
    try {
      // Validasi input
      if (!name || !email || !password) {
        throw new Error('Semua field wajib diisi');
      }
      
      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }
      
      const res = await api.post('/auth/register', { 
        name, 
        email: email.toLowerCase(), 
        password, 
        role 
      });
      
      if (res.data.success) {
        const { token, user } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success('Registrasi berhasil! Selamat datang ' + user.name);
        return { success: true, user };
      }
      
      return { success: false, message: 'Registrasi gagal' };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registrasi gagal';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email, password) => {
  setLoading(true);
  setError(null);
  
  try {
    // Validasi dan bersihkan data
    const cleanEmail = email?.trim()?.toLowerCase() || '';
    const cleanPassword = password?.trim() || '';
    
    if (!cleanEmail || !cleanPassword) {
      throw new Error('Email dan password wajib diisi');
    }
    
    const payload = { 
      email: cleanEmail, 
      password: cleanPassword 
    };
    
    console.log('📤 Login payload:', payload);
    console.log('📤 Login payload JSON:', JSON.stringify(payload));
    
    const res = await api.post('/auth/login', payload);
    
    console.log('📥 Login response:', res.data);
    
    if (res.data && res.data.success) {
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Selamat datang, ' + user.name + '!');
      return { success: true, user };
    }
    
    return { success: false, message: res.data?.message || 'Login gagal' };
  } catch (error) {
    console.error('❌ Login error:', error);
    
    let message = 'Login gagal. Periksa email dan password Anda.';
    
    if (error.response) {
      const { status, data } = error.response;
      console.log('❌ Response status:', status);
      console.log('❌ Response data:', data);
      
      // Ambil pesan error dari response
      if (data?.message) {
        message = data.message;
      } else if (data?.errors) {
        if (Array.isArray(data.errors)) {
          message = data.errors.map(e => e.message || e.msg).join(', ');
        } else {
          message = JSON.stringify(data.errors);
        }
      } else if (status === 400) {
        message = 'Email atau password salah. Silakan coba lagi.';
      } else if (status === 401) {
        message = 'Email atau password salah.';
      } else if (status === 404) {
        message = 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
      }
    } else if (error.message) {
      message = error.message;
    }
    
    setError(message);
    toast.error(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};

  // ============================================
  // LOGOUT
  // ============================================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Berhasil logout');
  };

  // ============================================
  // UPDATE PROFILE
  // ============================================
  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', data);
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        toast.success('Profil berhasil diperbarui');
        return { success: true, user: response.data.data };
      }
      return { success: false, message: 'Gagal update profil' };
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal update profil';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAuthenticated = !!user;

  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER';
  const isBuyer = user?.role === 'BUYER';

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    hasRole,
    isAuthenticated,
    isAdmin,
    isSeller,
    isBuyer
  };

  return (
    <AuthContext.Provider value={value}>
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