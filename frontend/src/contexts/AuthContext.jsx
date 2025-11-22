import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { getToken, setToken, removeToken, getUser, setUser } from '../utils/auth';

const AuthContext = createContext(null);

// Role constants - matching backend
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF'
};

// Role-based permissions
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true, // Limited view
  },

  // Products
  VIEW_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },
  CREATE_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },
  EDIT_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },
  DELETE_PRODUCTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },

  // Warehouses
  VIEW_WAREHOUSES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },
  CREATE_WAREHOUSES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },
  EDIT_WAREHOUSES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },

  // Stock pages access
  VIEW_STOCK_PAGE: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },
  VIEW_STOCK_MY_WAREHOUSE: {
    [ROLES.ADMIN]: false,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: true,
  },

  // Receipts
  CREATE_RECEIPTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true,
  },
  VALIDATE_RECEIPTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },

  // Deliveries
  CREATE_DELIVERIES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true,
  },
  PICK_DELIVERIES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true,
  },
  PACK_DELIVERIES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true,
  },
  VALIDATE_DELIVERIES: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },

  // Transfers
  CREATE_TRANSFERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true,
  },
  DISPATCH_TRANSFERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true,
  },
  RECEIVE_TRANSFERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },

  // Adjustments
  CREATE_ADJUSTMENTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: true,
  },
  VALIDATE_ADJUSTMENTS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },

  // Users
  VIEW_USERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },
  CREATE_USERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },
  EDIT_USERS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },

  // Stock visibility
  VIEW_ALL_STOCK: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false, // Only own warehouse
  },

  // Ledger
  VIEW_LEDGER: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: true,
    [ROLES.STAFF]: false,
  },

  // Settings
  VIEW_SETTINGS: {
    [ROLES.ADMIN]: true,
    [ROLES.MANAGER]: false,
    [ROLES.STAFF]: false,
  },
};

export function AuthProvider({ children }) {
  const [userState, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to update both state and localStorage
  const updateUser = (userData) => {
    setUserState(userData);
    if (userData) {
      setUser(userData); // Update localStorage via utility
    }
  };

  useEffect(() => {
    // Load user from localStorage on mount
    const token = getToken();
    const userData = getUser();
    
    if (token && userData) {
      updateUser(userData);
      setIsAuthenticated(true);
      
      // Only verify token with backend if it's not a demo token
      if (token && !token.startsWith('demo-token-')) {
        authAPI.getMe()
          .then(response => {
            const updatedUser = {
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              role: response.data.role,
              warehouseId: response.data.warehouseId,
              warehouseName: response.data.warehouseName
            };
            updateUser(updatedUser);
          })
          .catch(() => {
            // Token invalid, but don't logout for demo tokens
            if (!token.startsWith('demo-token-')) {
              logout();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        // Demo token, skip API verification
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      setToken(token);
      updateUser(userData);
      setIsAuthenticated(true);
      
      // Return success with user data
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUserState(null);
    setIsAuthenticated(false);
    removeToken();
  };

  const hasPermission = (permission) => {
    // Enforce auth and role-based permissions
    if (!isAuthenticated || !userState || !userState.role) return false;
    return PERMISSIONS[permission]?.[userState.role] || false;
  };

  const hasAnyRole = (...roles) => {
    if (!isAuthenticated || !userState || !userState.role) return false;
    return roles.includes(userState.role);
  };

  const value = {
    user: userState,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


