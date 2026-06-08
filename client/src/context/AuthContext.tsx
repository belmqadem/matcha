// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import type { User, LoginCredentials } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth on initial load
    authService.me()
      .then(({ user }) => {
        setUser(user);
        // Centralized routing logic
        if (!user.gender) navigate('/profile/setup');
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [navigate]);

  const login = async (credentials: LoginCredentials) => {
    await authService.login(credentials);
    const { user } = await authService.me();
    setUser(user);

    if (!user.gender) {
      navigate('/profile/setup');
    } else {
      navigate('/browse');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
