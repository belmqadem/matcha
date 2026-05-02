import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resent, setResent] = useState(false);

  const handleResend = () => {
    // TODO: call resend-verification API
    console.log('Resend verification email');
    setResent(true);
  };

  const handleVerify = () => {
    // TODO: call verify-email API with token
    console.log('Verifying token:', token);
    navigate('/browse');
  };

  return (
    <AuthLayout header="Verify your Email">
      {/* Email illustration */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg, #f9d0d8, #fce8ec)' }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C4364A"
            strokeWidth="1.8"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
        We've sent a verification link to your email address. Please check your inbox and click the
        link to activate your account.
      </p>

      {token ? (
        <Button onClick={handleVerify}>Verify Email</Button>
      ) : (
        <div className="space-y-3">
          {resent ? (
            <p className="text-center text-sm text-(--color-primary) font-medium">
              ✓ Verification email resent!
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="w-full text-sm text-(--color-primary) font-semibold py-2 hover:underline transition-colors"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      <p className="text-center text-xs text-gray-500 mt-5">
        Wrong email?{' '}
        <Link to="/register" className="text-(--color-primary) font-semibold hover:underline">
          Go back
        </Link>
      </p>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
