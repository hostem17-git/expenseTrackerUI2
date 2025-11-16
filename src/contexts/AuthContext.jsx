import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, getToken, verifyOTP } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user info here
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await signIn({ email, password });
      setIsAuthenticated(true);
      setUser(data.payload);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      await signUp({ username, email, password });
      // After successful signup, automatically sign in
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithOTP = async (phoneNumber, otp) => {
    try {
      const data = await verifyOTP(phoneNumber, otp);
      setIsAuthenticated(true);
      setUser(data.payload);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    loginWithOTP,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

