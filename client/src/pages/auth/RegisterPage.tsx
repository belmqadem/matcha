import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AuthLayout, MatchaLogo, AuthInput, AuthButton, OrDivider,
  UserIcon, LockIcon, MailIcon
} from '../../components/auth/AuthLayout';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleSignup = () => {
    // TODO: integrate Google OAuth
    console.log('Google signup');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call register API
    console.log('Register:', form);
    navigate('/verify-email');
  };

  return (
    <AuthLayout>
      <MatchaLogo />

      <div className="text-center mb-5">
        <p className="text-lg font-bold text-gray-800 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
          Create your account<br />Find your person
        </p>
      </div>

      <AuthButton variant="google" onClick={handleGoogleSignup}>
        Signup with Google
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
          placeholder="Username"
          value={form.username}
          onChange={handleChange('username')}
          icon={<UserIcon />}
        />
        <AuthInput
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange('firstName')}
          icon={<UserIcon />}
        />
        <AuthInput
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange('lastName')}
          icon={<UserIcon />}
        />
        <AuthInput
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange('password')}
          icon={<LockIcon />}
        />

        <div className="mt-6">
          <AuthButton type="submit">Register</AuthButton>
        </div>
      </form>

      <p className="text-center text-xs text-gray-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-[#C4364A] font-semibold hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
