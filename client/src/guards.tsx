// src/guards.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ── Require the user to be logged in ──────────────────────────────────────────
export const RequireAuth = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

// ── Require the user to have a complete profile ───────────────────────────────
export const RequireProfile = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // If gender is missing, they haven't finished onboarding
  if (!user.gender) return <Navigate to="/profile/setup" replace />;

  return <Outlet />;
};
