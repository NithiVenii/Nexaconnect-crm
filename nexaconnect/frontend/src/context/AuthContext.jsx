import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nexaconnect_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nexaconnect_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('nexaconnect_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('nexaconnect_token');
        localStorage.removeItem('nexaconnect_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('nexaconnect_token', data.token);
    localStorage.setItem('nexaconnect_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('nexaconnect_token', data.token);
    localStorage.setItem('nexaconnect_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Account created successfully!');
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nexaconnect_token');
    localStorage.removeItem('nexaconnect_user');
    setUser(null);
    toast.info('Logged out successfully');
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('nexaconnect_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
