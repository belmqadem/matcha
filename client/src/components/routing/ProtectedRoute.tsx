import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ── Require the user to be logged in ──────────────────────────────────────────
export const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // You can replace this with a full-page <Spinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
};

// ── Require the user to have a complete profile ───────────────────────────────
export const RequireProfile = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Note: Using gender as the flag based on your original code.
  // Alternatively, your API contract specifies `is_profile_complete`.
  if (!user.gender) return <Navigate to="/profile/setup" replace />;

  return <Outlet />;
};
