import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      api.getUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('cc_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await api.login(email, password);
    localStorage.setItem('cc_token', token);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const { token, user: u } = await api.register(data);
    localStorage.setItem('cc_token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
