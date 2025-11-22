import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Receipts from '@/pages/Receipts';
import Deliveries from '@/pages/Deliveries';
import MoveHistory from '@/pages/MoveHistory';
import Adjustments from '@/pages/Adjustments';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import Layout from '@/components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('stockmaster_auth');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login setAuth={setIsAuthenticated} /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup setAuth={setIsAuthenticated} /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          
          <Route path="/" element={<ProtectedRoute><Layout setAuth={setIsAuthenticated} /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="move-history" element={<MoveHistory />} />
            <Route path="adjustments" element={<Adjustments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
