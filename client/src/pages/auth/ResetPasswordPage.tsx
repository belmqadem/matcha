import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // e.g. /reset-password?token=abc123

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const passwordVisibility = usePasswordVisibility();
  const confirmVisibility = usePasswordVisibility();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    // TODO: call reset-password API with token + new password
    console.log('Reset password:', { token, password: form.password });
    navigate('/login');
  };

  return (
    <AuthLayout header="Reset your Password">
      <form onSubmit={handleSubmit}>
        <Input
          type={passwordVisibility.inputType}
          placeholder="New Password"
          value={form.password}
          onChange={handleChange('password')}
          required
          icon={Lock}
          showPasswordIcon={<ShowPasswordButton password={passwordVisibility} />}
        />
        <Input
          type={confirmVisibility.inputType}
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handleChange('confirm')}
          required
          icon={Lock}
          showPasswordIcon={<ShowPasswordButton password={confirmVisibility} />}
        />

        {error && <p className="text-xs text-(--color-error) mb-3 text-center">{error}</p>}

        <div className="mt-6">
          <Button type="submit">Reset</Button>
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
