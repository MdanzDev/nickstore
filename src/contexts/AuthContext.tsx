import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { account } from '@/lib/mongodb';

interface AdminUser {
  $id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      console.log('🔍 Checking session...');
      const currentUser = await account.get();
      console.log('✅ User is authenticated:', currentUser.email);
      setUser(currentUser as AdminUser);
    } catch (error) {
      console.log('❌ No session found');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      console.log('✅ Login successful! User:', currentUser.email);
      setUser(currentUser as AdminUser);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
