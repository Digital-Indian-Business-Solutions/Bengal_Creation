import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Admin credentials come from .env
// Create a .env file in project root:
//   REACT_APP_ADMIN_EMAIL=admin@bengalcreations.in
//   REACT_APP_ADMIN_PASSWORD=yourpassword
const ADMIN_EMAIL    = process.env.REACT_APP_ADMIN_EMAIL    || 'admin@bengalcreations.in';
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

const isLoggedIn = () => localStorage.getItem('bc_crm_session') === 'true';

export function AuthProvider({ children }) {
  const [auth, setAuth]         = useState(isLoggedIn);
  const [loginError, setLoginError] = useState('');

  const login = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('bc_crm_session', 'true');
      setAuth(true);
      setLoginError('');
      return true;
    }
    setLoginError('Invalid email or password.');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('bc_crm_session');
    setAuth(false);
    setLoginError('');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
