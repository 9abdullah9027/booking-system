import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if token exists in LocalStorage
  const token = localStorage.getItem('token');
  
  // If token exists, show the child components (The Dashboard)
  // If not, redirect immediately to Login (/)
  return token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;