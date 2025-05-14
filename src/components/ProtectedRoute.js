import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AssessmentLoading from './AssessmentLoading';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading animation while checking authentication
  if (loading) {
    return <AssessmentLoading message="Verifying your login..." />;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute;
