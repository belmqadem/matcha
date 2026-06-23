import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock, Mail, User } from 'lucide-react';
import { authService } from '@/services/authService';

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
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleSignup = () => {
    authService.googleLogin();
  };

  const handle42Signup = () => {
    authService.login42();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.username || !form.firstName || !form.lastName || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email: form.email,
        username: form.username,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      });
      navigate('/verify-email');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout header="Create your account and find your person">
      <form onSubmit={handleSubmit}>
        <Input
          id="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange('email')}
          required
          icon={Mail}
        />
        <Input
          id="username"
          label="Username"
          value={form.username}
          onChange={handleChange('username')}
          required
          icon={User}
        />
        <Input
          id="firstName"
          label="First Name"
          value={form.firstName}
          onChange={handleChange('firstName')}
          required
          icon={User}
        />
        <Input
          id="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={handleChange('lastName')}
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
        <Button variant="google" onClick={handleGoogleSignup}>
          Continue with Google
        </Button>
        <Button variant="42" onClick={handle42Signup}>
          Continue with 42
        </Button>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
