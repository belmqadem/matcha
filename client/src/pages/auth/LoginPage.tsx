import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  const [form, setForm] = useState({ username: '', password: '' });
  const passwordVisibility = usePasswordVisibility();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_failed') {
      toast.error('OAuth sign-in failed. Please try again.');
    }

    const checkOAuthRedirect = async () => {
      try {
        const { user } = await authService.me();
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
  }, [searchParams, navigate]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleLogin = () => {
    authService.googleLogin();
  };

  const handle42Login = () => {
    authService.login42();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.username.trim() === '' || form.password.trim() === '') {
      toast.error('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login({ username: form.username, password: form.password });
      if (!loggedInUser.gender) {
        navigate('/profile/setup');
      } else {
        navigate('/browse');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout header="Log in to find your match">
      <form onSubmit={handleSubmit}>
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
