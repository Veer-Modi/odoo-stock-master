// Auth utility functions
export const getToken = () => {
  return localStorage.getItem('stockmaster_token');
};

export const setToken = (token) => {
  localStorage.setItem('stockmaster_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('stockmaster_token');
  localStorage.removeItem('stockmaster_user');
  localStorage.removeItem('stockmaster_auth');
};

export const getUser = () => {
  const userStr = localStorage.getItem('stockmaster_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem('stockmaster_user', JSON.stringify(user));
  localStorage.setItem('stockmaster_auth', 'true');
};

export const isAuthenticated = () => {
  return !!getToken() && !!getUser();
};

export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

export const hasAnyRole = (...roles) => {
  const user = getUser();
  return user && roles.includes(user.role);
};

