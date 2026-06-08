import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock, Mail, User, Type } from 'lucide-react';

import { authService } from '@/services/authService';
import type { RegisterPayload } from '@/types/auth';

const RegisterPage = () => {
  const passwordVisibility = usePasswordVisibility();

  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (field: keyof RegisterPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(''); // Clear error on typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.username || !form.first_name || !form.last_name || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // API call delegated to the service layer
      const res = await authService.register(form);
      setSuccessMessage(res.message || 'Verification email sent. Please check your inbox.');
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  // ── Success State View ──────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <AuthLayout header="Check your inbox">
        <div className="text-center space-y-6">
          <div className="bg-primary/10 text-primary p-4 rounded-xl flex justify-center">
            <Mail className="h-10 w-10" />
          </div>
          <p className="text-text font-medium">{successMessage}</p>
          <p className="text-sm text-text-muted">
            We've sent a verification link to <span className="font-bold text-text">{form.email}</span>.
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button type="button">Go to Login</Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ── Registration Form View ──────────────────────────────────────────────────
  return (
    <AuthLayout header="Create your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Input
            id="first_name"
            type="text"
            label="First Name"
            value={form.first_name}
            onChange={handleChange('first_name')}
            required
            icon={Type}
          />
          <Input
            id="last_name"
            type="text"
            label="Last Name"
            value={form.last_name}
            onChange={handleChange('last_name')}
            required
            icon={Type}
          />
        </div>

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
          id="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange('email')}
          required
          icon={Mail}
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
            {isSubmitting ? 'Creating account…' : 'Register'}
          </Button>
        </div>
      </form>

      <div className="text-center mt-6 space-y-3">
        <p className="text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log In
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

export default RegisterPage;
