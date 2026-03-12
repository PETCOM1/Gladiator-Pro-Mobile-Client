import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  siteId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, load token/user from SecureStore here
    setLoading(false);
  }, []);

  const signIn = async (email: string, newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    // In a real app, save to SecureStore
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    // In a real app, remove from SecureStore
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
