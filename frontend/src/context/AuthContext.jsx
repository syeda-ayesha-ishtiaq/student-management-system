import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/token/`, {
      username,
      password,
    });
    const { access } = response.data;
    setAccessToken(access);

    const meResponse = await axios.get(`${API_BASE_URL}/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    setUser(meResponse.data);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  const value = {
    accessToken,
    user,
    isAuthenticated: !!accessToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
