import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, requiredPermission, requiredRole }) {
  const { isAuthenticated, loading, hasPermission, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Enforce authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Still check permissions if user is authenticated
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && !hasAnyRole(...(Array.isArray(requiredRole) ? requiredRole : [requiredRole]))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


