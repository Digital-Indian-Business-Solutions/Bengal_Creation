import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

const ENV_USER = process.env.REACT_APP_ADMIN_USERNAME;
const ENV_PASS = process.env.REACT_APP_ADMIN_PASSWORD;
const SESSION_KEY = 'bc_admin_auth';

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [error, setError] = useState('');

  const login = useCallback((username, password) => {
    if (!ENV_USER || !ENV_PASS) {
      setError('Auth env variables are not configured. Add REACT_APP_ADMIN_USERNAME and REACT_APP_ADMIN_PASSWORD to your .env file.');
      return false;
    }
    if (username === ENV_USER && password === ENV_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthed(true);
      setError('');
      return true;
    }
    setError('Invalid username or password.');
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setError('');
  }, []);

  return (
    <AuthContext.Provider value={{ authed, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
