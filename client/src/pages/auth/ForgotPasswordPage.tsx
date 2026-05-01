import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AuthLayout, MatchaLogo, AuthInput, AuthButton, MailIcon
} from '../../components/auth/AuthLayout';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call forgot-password API
    console.log('Forgot password for:', email);
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <MatchaLogo />

      <div className="text-center mb-8">
        <p className="text-lg font-bold text-gray-800 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
          Forgot your Password?
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fce8ec' }}>
            <MailIcon />
          </div>
          <p className="text-sm text-gray-600 mb-6">
            We sent a reset link to <span className="font-semibold text-[#C4364A]">{email}</span>. Check your inbox.
          </p>
          <Link to="/login" className="text-[#C4364A] text-sm font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AuthInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<MailIcon />}
          />

          <div className="mt-8">
            <AuthButton type="submit">Submit</AuthButton>
          </div>
        </form>
      )}

      {!submitted && (
        <p className="text-center text-xs text-gray-500 mt-5">
          Remembered it?{' '}
          <Link to="/login" className="text-[#C4364A] font-semibold hover:underline">
            Login
          </Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
