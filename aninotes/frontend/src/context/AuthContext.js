import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginRequest, registerRequest, getMeRequest } from '../api/authApi';
import { connectSocket, disconnectSocket } from '../socket/socketClient';

const AuthContext = createContext(null);

const TOKEN_KEY = 'aninotes_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await getMeRequest();
      setUser(res.data.data);
      connectSocket(token);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
    return () => disconnectSocket();
  }, [loadCurrentUser]);

  const login = async (credentials) => {
    const res = await loginRequest(credentials);
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.data);
    connectSocket(res.data.token);
    return res.data;
  };

  const register = async (details) => {
    const res = await registerRequest(details);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    disconnectSocket();
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
