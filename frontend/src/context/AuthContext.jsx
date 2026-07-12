import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [name, setName] = useState(localStorage.getItem('userName') || null);
  const [role, setRole] = useState(localStorage.getItem('userRole') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial verification of localStorage state
    const savedToken = localStorage.getItem('token');
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    
    if (savedToken) {
      setToken(savedToken);
      setName(savedName);
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRole', data.role);
        
        setToken(data.token);
        setName(data.name);
        setRole(data.role);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: errMsg };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    setToken(null);
    setName(null);
    setRole(null);
  };

  const hasRole = (allowedRoles) => {
    return role && allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        name,
        role,
        loading,
        login: loginUser,
        logout: logoutUser,
        isAuthenticated: !!token,
        hasRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
