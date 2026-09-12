import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('villagemart_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('villagemart_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const registerCustomer = async (data) => {
    const res = await api.post('/auth/register-customer', data);
    if (res.success) {
      localStorage.setItem('villagemart_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const registerFarmer = async (data) => {
    const res = await api.post('/auth/register-farmer', data);
    if (res.success) {
      localStorage.setItem('villagemart_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('villagemart_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, registerCustomer, registerFarmer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
