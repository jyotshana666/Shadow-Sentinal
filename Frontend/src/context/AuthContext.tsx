import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponseDto, UserResponseDto } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  token: string | null;
  user: UserResponseDto | null;
  role: 'USER' | 'ADMIN' | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: AuthResponseDto) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ss_jwt_token'));
  const [user, setUser] = useState<UserResponseDto | null>(() => {
    const saved = localStorage.getItem('ss_user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ss_jwt_token');
      if (savedToken) {
        try {
          const resp = await authService.getCurrentUser();
          if (resp.success && resp.data) {
            setUser(resp.data);
            localStorage.setItem('ss_user_info', JSON.stringify(resp.data));
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (data: AuthResponseDto) => {
    setToken(data.jwt);
    localStorage.setItem('ss_jwt_token', data.jwt);

    const userInfo: UserResponseDto = {
      id: data.userId,
      email: data.email,
      role: data.role,
      orgId: data.orgId,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setUser(userInfo);
    localStorage.setItem('ss_user_info', JSON.stringify(userInfo));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ss_jwt_token');
    localStorage.removeItem('ss_user_info');
  };

  const refreshUser = async () => {
    try {
      const resp = await authService.getCurrentUser();
      if (resp.success && resp.data) {
        setUser(resp.data);
        localStorage.setItem('ss_user_info', JSON.stringify(resp.data));
      }
    } catch {
      // Ignore
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role || null,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
