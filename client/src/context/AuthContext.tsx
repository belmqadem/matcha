// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import type { User, LoginCredentials } from '@/types/auth';
import { photoBuster } from '@/utils/photoBuster';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // login returns the User so the calling component can decide where to route
  login: (credentials: LoginCredentials) => Promise<User>;
  // logout clears the local user state
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth on initial load. No routing logic here!
    photoBuster.regenerate();
    authService
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    await authService.login(credentials);
    photoBuster.regenerate();
    const { user } = await authService.me();
    setUser(user);
    return user; // Return user so the UI can navigate based on profile status
  };

  const logout = () => {
    photoBuster.regenerate();
    setUser(null); // Clear the local state so the UI updates immediately
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
