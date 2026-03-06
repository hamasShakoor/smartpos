import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pos_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('pos_token', data.token);
      localStorage.setItem('pos_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, login, logout, loading }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
