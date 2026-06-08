// src/pages/auth/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail } from 'lucide-react';
import { authService } from '@/services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout header="Forgot your Password?">
      {submitted ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary text-white">
            <Mail />
          </div>
          <p className="text-sm text-text/80 mb-6">
            We sent a reset link to{' '}
            <span className="font-semibold text-primary">{email}</span>. Check your inbox.
          </p>
          <Link
            to="/login"
            className="text-primary text-sm font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
            icon={Mail}
          />

          {error && <p className="text-sm font-medium text-error mb-3 text-center">{error}</p>}

          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending…' : 'Submit'}
            </Button>
          </div>
        </form>
      )}

      {!submitted && (
        <p className="text-center text-sm text-text-muted mt-6">
          Remembered it?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login
          </Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
