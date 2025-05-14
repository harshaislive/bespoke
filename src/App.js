import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AssessmentPage from './pages/AssessmentPage';
import Login from './components/Login';
import VerifyAuth from './components/VerifyAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Component to manage layout based on current route
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAssessmentPage = location.pathname === '/';
  
  return (
    <div className={`min-h-screen bg-offWhite flex flex-col ${isAssessmentPage ? 'pt-0 md:pt-16' : ''}`}>
      <Header />
      
      <main className={`flex-grow ${isAssessmentPage ? 'pt-0' : 'pt-16 md:pt-20'}`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <AppLayout>
              <Login />
            </AppLayout>
          } />
          <Route path="/verify" element={
            <AppLayout>
              <VerifyAuth />
            </AppLayout>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <AssessmentPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
