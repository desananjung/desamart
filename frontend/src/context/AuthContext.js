// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cek apakah user sudah login dari localStorage saat pertama kali
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token atau minta data user ke server (lebih aman)
      // Untuk demo, kita simpan data user di localStorage juga
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const register = async (name, email, password, role = 'BUYER') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      return { success: true, data: res.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registrasi gagal' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login gagal' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helper untuk cek role
  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);