import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail } from 'lucide-react';
import { authApi } from '@/api/authApi';

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
      await authApi.forgotPassword(email);
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
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-(--color-primary) text-white">
            <Mail />
          </div>
          <p className="text-sm text-(--color-text)/80 mb-6">
            We sent a reset link to{' '}
            <span className="font-semibold text-(--color-primary)">{email}</span>. Check your inbox.
          </p>
          <Link
            to="/login"
            className="text-(--color-primary) text-sm font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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

          {error && <p className="text-xs text-(--color-error) mb-3 text-center">{error}</p>}

          <div className="mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending…' : 'Submit'}
            </Button>
          </div>
        </form>
      )}

      {!submitted && (
        <p className="text-center text-xs text-(--color-text)/80 mt-5">
          Remembered it?{' '}
          <Link to="/login" className="text-(--color-primary) font-semibold hover:underline">
            Login
          </Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
