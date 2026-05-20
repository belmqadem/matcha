import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock } from 'lucide-react';
import { authApi } from '@/api/authApi';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  // const token = searchParams.get('token'); // e.g. /reset-password?token=abc123
  const { token } = useParams<{ token: string }>();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const passwordVisibility = usePasswordVisibility();
  const confirmVisibility = usePasswordVisibility();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authApi.resetPassword(token, form.password);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout header="Reset your Password">
      <form onSubmit={handleSubmit}>
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

        {error && <p className="text-xs text-(--color-error) mb-3 text-center">{error}</p>}

        <div className="mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting…' : 'Reset'}
          </Button>
        </div>
      </form>

      <p className="text-center text-xs text-(--color-text)/80 mt-5">
        Back to{' '}
        <Link to="/login" className="text-(--color-primary) font-semibold hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
