import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AuthLayout, MatchaLogo, AuthInput, AuthButton, OrDivider,
  LockIcon, MailIcon
} from '../../components/auth/AuthLayout';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleLogin = () => {
    // TODO: integrate Google OAuth
    console.log('Google login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call login API
    console.log('Login:', form);
    navigate('/browse');
  };

  return (
    <AuthLayout>
      <MatchaLogo />

      <div className="text-center mb-6">
        <p className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          Log in to find your match
        </p>
      </div>

      <AuthButton variant="google" onClick={handleGoogleLogin}>
        Continue with Google
      </AuthButton>

      <OrDivider />

      <form onSubmit={handleSubmit}>
        <AuthInput
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange('email')}
          icon={<MailIcon />}
        />
        <AuthInput
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange('password')}
          icon={<LockIcon />}
        />

        <div className="mt-6">
          <AuthButton type="submit">Log In</AuthButton>
        </div>
      </form>

      <div className="text-center mt-4 space-y-1">
        <Link to="/forgot-password" className="block text-sm text-gray-700 font-medium hover:text-[#C4364A] transition-colors">
          Forgot your password?
        </Link>
        <p className="text-xs text-gray-500">
          You don't have an account?{' '}
          <Link to="/register" className="text-[#C4364A] font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
