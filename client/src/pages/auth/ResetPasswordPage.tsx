import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AuthLayout, MatchaLogo, AuthInput, AuthButton, LockIcon
} from '../../components/auth/AuthLayout';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // e.g. /reset-password?token=abc123

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
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
    <AuthLayout>
      <MatchaLogo />

      <div className="text-center mb-8">
        <p className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <AuthInput
          type="password"
          placeholder="New Password"
          value={form.password}
          onChange={handleChange('password')}
          icon={<LockIcon />}
        />
        <AuthInput
          type="password"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handleChange('confirm')}
          icon={<LockIcon />}
        />

        {error && (
          <p className="text-xs text-[#C4364A] mb-3 text-center">{error}</p>
        )}

        <div className="mt-6">
          <AuthButton type="submit">Reset</AuthButton>
        </div>
      </form>

      <p className="text-center text-xs text-gray-500 mt-5">
        Back to{' '}
        <Link to="/login" className="text-[#C4364A] font-semibold hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
