import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, LoginFormData, RegisterFormData } from '../types/user';
import { userApi } from '../utils/api';
import { debugLog, debugError } from '../utils/debug';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await userApi.getProfile();
          setUser({ ...userData, token });
          debugLog('User authenticated from token');
        } catch (error) {
          debugError('Token validation failed', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginFormData) => {
    try {
      setLoading(true);
      const userData = await userApi.login(credentials);
      localStorage.setItem('token', userData.token!);
      setUser(userData);
      debugLog('User logged in successfully');
    } catch (error) {
      debugError('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterFormData) => {
    try {
      setLoading(true);
      const newUser = await userApi.register(userData);
      localStorage.setItem('token', newUser.token!);
      setUser(newUser);
      debugLog('User registered successfully');
    } catch (error) {
      debugError('Registration failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    debugLog('User logged out');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};