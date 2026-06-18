// src/pages/auth/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail } from 'lucide-react';
import { authService } from '@/services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout header="Forgot your Password?">
      <div className="w-full max-w-sm md:max-w-md mx-auto px-4 sm:px-0">
        {submitted ? (
          <div className="text-center py-4 animate-fade-in-up">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 bg-primary text-surface">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <p className="text-sm sm:text-base text-text/80 mb-5 sm:mb-6">
              We have sent a reset link to your email. Please check your inbox.
            </p>
            <Link
              to="/login"
              className="text-primary text-sm sm:text-base font-semibold hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={Mail}
            />

            <div className="pt-2 sm:pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Submit'}
              </Button>
            </div>
          </form>
        )}

        {!submitted && (
          <p className="text-center text-sm sm:text-base text-text-muted mt-6 sm:mt-8">
            Remembered it?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Login
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
