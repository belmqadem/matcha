import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authApi, type FullUser } from '@/api/authApi';

type Status = 'loading' | 'ok' | 'unauth' | 'incomplete';

// ── Require the user to be logged in ──────────────────────────────────────────
// If not authenticated → /login
// While checking → blank screen (or swap with a spinner if you prefer)
export const RequireAuth = () => {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    authApi.me()
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'loading') return null;
  if (status === 'unauth') return <Navigate to="/login" replace />;
  return <Outlet />;
};

// ── Require the user to have a complete profile ───────────────────────────────
// If gender is null (OAuth users who haven't finished onboarding) → /profile/setup
// This also handles the case where a Google/42 user is redirected to /browse
// before completing setup.
export const RequireProfile = () => {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    authApi.me()
      .then(({ user }: { user: FullUser }) => {
        setStatus(user.birth_date ? 'ok' : 'incomplete');
      })
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'loading') return null;
  if (status === 'unauth') return <Navigate to="/login" replace />;
  if (status === 'incomplete') return <Navigate to="/profile/setup" replace />;
  return <Outlet />;
};
