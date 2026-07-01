import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, hasRole } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/" />; // atau halaman "Forbidden"
  }
  return children;
};

export default RoleProtectedRoute;