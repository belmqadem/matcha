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

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      setError('OAuth sign-in failed. Please try again.');
      return;
    }

    const checkOAuthRedirect = async () => {
      try {
        const { user } = await authApi.me();
        if (user.gender) {
          navigate('/browse');
        } else {
          navigate('/profile/setup');
        }
      } catch {
        // Not logged in, stay on login page
      }
    };

    checkOAuthRedirect();
  }, [searchParams]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleLogin = () => {
    authApi.googleLogin();
  };

  const handle42Login = () => {
    authApi.login42();
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
          className="block text-sm text-(--color-text) font-medium hover:text-(--color-primary) transition underline hover:underline-offset-2 duration-150 ease-in"
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

      <Divider />

      <div className="flex gap-4">
        <Button variant="google" onClick={handleGoogleLogin}>
          Continue with Google
        </Button>
        <Button variant="42" onClick={handle42Login}>
          Continue with 42
        </Button>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
