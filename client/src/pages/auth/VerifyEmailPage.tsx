// src/pages/auth/VerifyEmailPage.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import { authService } from '@/services/authService';

type Status = 'idle' | 'loading' | 'success' | 'error';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const didVerify = useRef(false);

  useEffect(() => {
    if (!token || didVerify.current) return;
    didVerify.current = true;

    setStatus('loading');
    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((err) => {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed.');
      });
  }, [token, navigate]);

  return (
    <AuthLayout header="Verify your Email">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md bg-primary/10">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
      </div>

      {status === 'loading' && (
        <p className="text-center text-sm text-text-muted mb-6">Verifying your email…</p>
      )}

      {status === 'success' && (
        <p className="text-center text-sm text-primary font-medium mb-6">
          ✓ Email verified! Redirecting to login…
        </p>
      )}

      {status === 'error' && (
        <p className="text-center text-sm text-error mb-4">{error}</p>
      )}

      {status === 'idle' && !token && (
        <p className="text-center text-sm text-text-muted mb-6 leading-relaxed">
          We've sent a verification link to your email address. Please check your inbox and click
          the link to activate your account.
        </p>
      )}

      <p className="text-center text-xs text-text-muted mt-5">
        Wrong email?{' '}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          Go back
        </Link>
      </p>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
