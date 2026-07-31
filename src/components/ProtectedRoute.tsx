import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadBase64));
    
    const roles = decoded.roles || decoded.role || [];
    const roleList = Array.isArray(roles) ? roles : [roles];
    const isSupplier = roleList.some((r: string) => r.toUpperCase() === 'SUPPLIER' || r.toUpperCase() === 'VENDOR');
    
    if (!isSupplier) {
      console.warn("Access denied: User does not have SUPPLIER or VENDOR role.");
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error("Failed to parse auth token:", err);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
