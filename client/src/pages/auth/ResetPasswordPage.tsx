// src/pages/auth/ResetPasswordPage.tsx
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock } from 'lucide-react';
import { authService } from '@/services/authService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);

  const passwordVisibility = usePasswordVisibility();
  const confirmVisibility = usePasswordVisibility();

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout header="Reset your Password">
      <div className="w-full max-w-sm md:max-w-md mx-auto px-4 sm:px-0">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <Input
            id="password"
            type={passwordVisibility.inputType}
            label="New Password"
            value={form.password}
            onChange={handleChange('password')}
            required
            icon={Lock}
            showPasswordIcon={<ShowPasswordButton password={passwordVisibility} />}
          />
          <Input
            id="confirm"
            type={confirmVisibility.inputType}
            label="Confirm Password"
            value={form.confirm}
            onChange={handleChange('confirm')}
            required
            icon={Lock}
            showPasswordIcon={<ShowPasswordButton password={confirmVisibility} />}
          />

          <div className="pt-2 sm:pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Resetting…' : 'Reset'}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm sm:text-base text-text-muted mt-6 sm:mt-8">
          Back to{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
