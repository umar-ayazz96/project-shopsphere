import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('shopsphere_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('shopsphere_token', data.token);
    localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('shopsphere_token', data.token);
    localStorage.setItem('shopsphere_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
