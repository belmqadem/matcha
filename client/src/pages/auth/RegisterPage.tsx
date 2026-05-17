import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock, Mail, User } from 'lucide-react';
import { authApi } from '@/api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const passwordVisibility = usePasswordVisibility();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleSignup = () => {
    authApi.googleLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.username || !form.firstName || !form.lastName || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email: form.email,
        username: form.username,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      });
      navigate('/verify-email');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: Record<string, string | string[]> } };
        const data = axiosErr.response?.data;

        if (data) {
          const firstValue = Object.values(data)[0];
          const message = Array.isArray(firstValue) ? firstValue[0] : firstValue;
          setError(typeof message === 'string' ? message : 'Registration failed.');
        } else {
          setError('Registration failed.');
        }
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout header="Create your account and find your person">
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange('email')}
          required
          icon={Mail}
        />
        <Input
          placeholder="Username"
          value={form.username}
          onChange={handleChange('username')}
          required
          icon={User}
        />
        <Input
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange('firstName')}
          required
          icon={User}
        />
        <Input
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange('lastName')}
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
            {loading ? 'Registering…' : 'Register'}
          </Button>
        </div>
      </form>

      <p className="text-xs text-(--color-text)/80 text-center mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-(--color-primary) font-semibold hover:underline">
          Login
        </Link>
      </p>

      <Divider />

      <div className="flex gap-4">
        <Button variant="google" onClick={() => authApi.googleLogin()}>
          Continue with Google
        </Button>
        <Button variant="42" onClick={() => authApi.login42()}>
          Continue with 42
        </Button>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
