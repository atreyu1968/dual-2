import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Courses } from './pages/Courses';
import { Groups } from './pages/Groups';
import { Students } from './pages/Students';
import { Companies } from './pages/Companies';
import { Activities } from './pages/Activities';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.must_change_password && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="academic-years" element={<Courses />} />
            <Route path="groups" element={<Groups />} />
            <Route path="companies" element={<Companies />} />
            <Route path="students" element={<Students />} />
            <Route path="activities" element={<Activities />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
