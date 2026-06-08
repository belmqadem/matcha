import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock, User } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passwordVisibility = usePasswordVisibility();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError('OAuth sign-in failed. Please try again.');
    }
  }, [searchParams]);

  const handleChange = (field: 'username' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Call the context action
      const loggedInUser = await login(form);

      // 2. Handle component-level routing logic
      if (!loggedInUser.gender) {
        navigate('/profile/setup');
      } else {
        navigate('/browse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout header="Log in to find your match">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="username"
          type="text"
          label="Username"
          value={form.username}
          onChange={handleChange('username')}
          required
          icon={User}
        />

        <Input
          id="password"
          type={passwordVisibility.inputType}
          label="Password"
          value={form.password}
          onChange={handleChange('password')}
          required
          icon={Lock}
          showPasswordIcon={<ShowPasswordButton password={passwordVisibility} />}
        />

        {error && (
          <p className="text-sm font-medium text-error text-center mt-2">
            {error}
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log In'}
          </Button>
        </div>
      </form>

      <div className="text-center mt-6 space-y-3">
        <Link
          to="/forgot-password"
          className="block text-sm text-text font-medium hover:text-primary transition-colors underline hover:underline-offset-2"
        >
          Forgot your password?
        </Link>
        <p className="text-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Register
          </Link>
        </p>
      </div>

      <Divider />

      <div className="flex gap-4">
        <Button variant="google" onClick={authService.googleLogin} type="button">
          Continue with Google
        </Button>
        <Button variant="42" onClick={authService.login42} type="button">
          Continue with 42
        </Button>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
