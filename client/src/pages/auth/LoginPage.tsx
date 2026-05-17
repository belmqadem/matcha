import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock, User } from 'lucide-react';
import { authApi } from '@/api/authApi';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ username: '', password: '' });
  const passwordVisibility = usePasswordVisibility();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle OAuth error redirect from backend (e.g. ?error=oauth_failed)
  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError('OAuth sign-in failed. Please try again.');
    }
  }, [searchParams]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleLogin = () => {
    authApi.googleLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.username.trim() === '' || form.password.trim() === '') {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      await authApi.login({ username: form.username, password: form.password });
      const { user } = await authApi.me();
      if (!user.gender) {
        navigate('/profile/setup');
      } else {
        navigate('/browse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout header="Log in to find your match">
      <Button variant="google" onClick={() => authApi.googleLogin()}>
        Continue with Google
      </Button>
      <Button variant="42" onClick={() => authApi.login42()}>
        Continue with 42
      </Button>

      <Divider />

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange('username')}
          required
          icon={User}
        />
        <Input
          type={passwordVisibility.inputType}
          placeholder="Password"
          value={form.password}
          onChange={handleChange('password')}
          required
          icon={Lock}
          showPasswordIcon={<ShowPasswordButton password={passwordVisibility} />}
        />

        {error && <p className="text-xs text-(--color-error) mb-3 text-center">{error}</p>}

        <div className="mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </Button>
        </div>
      </form>

      <div className="text-center mt-4 space-y-2">
        <Link
          to="/forgot-password"
          className="block text-sm text-(--color-text) font-medium hover:text-(--color-primary) transition-colors"
        >
          Forgot your password?
        </Link>
        <p className="text-xs text-(--color-text)/80">
          You don't have an account?{' '}
          <Link to="/register" className="text-(--color-primary) font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
