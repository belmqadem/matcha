import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Input from '@/components/ui/Input';
import ShowPasswordButton from '@/components/ui/ ShowPasswordButton';
import { usePasswordVisibility } from '@/hooks/usePasswordVisibility';
import { Lock, Mail, User } from 'lucide-react';

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

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleSignup = () => {
    // TODO: integrate Google OAuth
    console.log('Google signup');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.username || !form.firstName || !form.lastName || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    // TODO: call register API
    console.log('Register:', form);
    navigate('/verify-email');
  };

  return (
    <AuthLayout header="Create your account and find your person">
      <Button variant="google" onClick={handleGoogleSignup}>
        Signup with Google
      </Button>

      <Divider />

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
          <Button type="submit">Register</Button>
        </div>
      </form>

      <p className="text-xs text-(--color-text)/80 text-center mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-(--color-primary) font-semibold hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
