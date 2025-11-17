import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserType } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    type: UserType
  ) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Added isLoading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added isLoading state

  // Simulate checking initial auth state (like checking AsyncStorage, tokens, etc.)
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Simulate async operation (e.g., checking token, loading user from storage)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In a real app, you might check for stored user/token here:
        // const storedUser = await AsyncStorage.getItem('user');
        // if (storedUser) setUser(JSON.parse(storedUser));

        // For now, we'll just set loading to false
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = mockUsers.find((u) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = (
    name: string,
    email: string,
    phone: string,
    password: string,
    type: UserType
  ): boolean => {
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      phone,
      type,
      rating: 5.0,
      reviewCount: 0,
    };
    mockUsers.push(newUser);
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading, // Added to context value
      }}
    >
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
