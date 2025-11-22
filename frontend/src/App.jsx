import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Stock from './pages/Stock';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Adjustments from './pages/Adjustments';
import Ledger from './pages/Ledger';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { PERMISSIONS } from './contexts/AuthContext';

function PublicRoute({ children }) {
  // Removed authentication check - allow access to login/signup pages always
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute requiredPermission="VIEW_DASHBOARD">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="products"
          element={
            <ProtectedRoute requiredPermission="VIEW_PRODUCTS">
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouses"
          element={
            <ProtectedRoute requiredPermission="VIEW_WAREHOUSES">
              <Warehouses />
            </ProtectedRoute>
          }
        />
        <Route
          path="stock"
          element={
            <ProtectedRoute requiredPermission="VIEW_STOCK_PAGE">
              <Stock />
            </ProtectedRoute>
          }
        />
        <Route
          path="stock/my-warehouse"
          element={
            <ProtectedRoute requiredPermission="VIEW_STOCK_MY_WAREHOUSE">
              <Stock />
            </ProtectedRoute>
          }
        />
        <Route
          path="receipts"
          element={
            <ProtectedRoute requiredPermission="CREATE_RECEIPTS">
              <Receipts />
            </ProtectedRoute>
          }
        />
        <Route
          path="deliveries"
          element={
            <ProtectedRoute requiredPermission="CREATE_DELIVERIES">
              <Deliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="transfers"
          element={
            <ProtectedRoute requiredPermission="CREATE_TRANSFERS">
              <Transfers />
            </ProtectedRoute>
          }
        />
        <Route
          path="adjustments"
          element={
            <ProtectedRoute requiredPermission="CREATE_ADJUSTMENTS">
              <Adjustments />
            </ProtectedRoute>
          }
        />
        <Route
          path="ledger"
          element={
            <ProtectedRoute requiredPermission="VIEW_LEDGER">
              <Ledger />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredPermission="VIEW_USERS">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredPermission="VIEW_SETTINGS">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute requiredPermission="VIEW_DASHBOARD">
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}

export default App;
