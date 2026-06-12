// src/pages/auth/RegisterPage.tsx
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

  const handleChange =
    (field: keyof RegisterPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError('');
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.username || !form.first_name || !form.last_name || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.register(form);
      setSuccessMessage(res.message || 'Verification email sent. Please check your inbox.');
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout header="Check your inbox">
        <div className="w-full max-w-sm md:max-w-md mx-auto px-4 sm:px-0 text-center space-y-5 sm:space-y-6">
          <div className="bg-primary/10 text-primary p-4 sm:p-5 rounded-2xl flex justify-center w-max mx-auto animate-fade-in-up">
            <Mail className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <p className="text-text text-base sm:text-lg font-medium">{successMessage}</p>
          <p className="text-sm sm:text-base text-text-muted">
            We've sent a verification link to{' '}
            <span className="font-bold text-text break-all">{form.email}</span>.
          </p>
          <div className="pt-4 sm:pt-6">
            <Link to="/login" className="block">
              <Button type="button">Go to Login</Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout header="Create your account">
      <div className="w-full max-w-sm md:max-w-md mx-auto px-4 sm:px-0">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
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
            <p className="text-xs sm:text-sm font-medium text-error text-center mt-2 animate-fade-in-up">
              {error}
            </p>
          )}

          <div className="pt-2 sm:pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Register'}
            </Button>
          </div>
        </form>

        <div className="text-center mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>

        <div className="my-6 sm:my-8">
          <Divider />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            variant="google"
            onClick={authService.googleLogin}
            type="button"
            withArrow={false}
          >
            Continue with Google
          </Button>
          <Button variant="42" onClick={authService.login42} type="button" withArrow={false}>
            Continue with 42
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
