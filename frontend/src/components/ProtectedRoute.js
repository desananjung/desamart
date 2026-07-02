import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  // Jika belum login, redirect ke login
  if (!user) {
    // Buka modal login
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.showModal();
    }
    return <Navigate to="/" replace />;
  }

  // Jika ada role yang diizinkan, cek role user
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;