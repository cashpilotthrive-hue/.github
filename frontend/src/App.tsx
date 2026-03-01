import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Placeholder routes for other pages */}
      <Route
        path="/wallets"
        element={
          <ProtectedRoute>
            <div>Wallets Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/mining"
        element={
          <ProtectedRoute>
            <div>Mining Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/withdrawals"
        element={
          <ProtectedRoute>
            <div>Withdrawals Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/kyc"
        element={
          <ProtectedRoute>
            <div>KYC Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
