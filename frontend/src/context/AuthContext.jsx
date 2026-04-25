import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure Axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/auth/me');
      setUser({...data, token});
    } catch (error) {
      console.error('Error fetching user', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    window.location.href = data.role === 'Admin' ? '/dashboard/admin' : data.role === 'Agent' ? '/dashboard/agent' : '/dashboard/customer';
  };

  const register = async (name, email, password, role, department) => {
    const { data } = await axios.post('/auth/register', { name, email, password, role, department });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    window.location.href = data.role === 'Admin' ? '/dashboard/admin' : data.role === 'Agent' ? '/dashboard/agent' : '/dashboard/customer';
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
