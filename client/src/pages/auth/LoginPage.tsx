import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login payload:', form);
  };

  const handleGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-[#f9c8cc] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo Block */}
        <div className="flex flex-col items-center gap-1">
          {/* Logo Icon */}
          <div className="w-16 h-16 flex items-center justify-center">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              {/* Fingerprint-like concentric arcs */}
              <path
                d="M30 8 C18 8 9 17 9 29 C9 41 18 50 30 50 C42 50 51 41 51 29 C51 17 42 8 30 8Z"
                stroke="#C8294A"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M30 14 C21 14 14 21 14 30 C14 39 21 46 30 46 C39 46 46 39 46 30 C46 21 39 14 30 14Z"
                stroke="#C8294A"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M30 20 C24 20 19 25 19 31 C19 37 24 42 30 42 C36 42 41 37 41 31 C41 25 36 20 30 20Z"
                stroke="#C8294A"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M30 26 C27 26 24 29 24 32 C24 35 27 38 30 38 C33 38 36 35 36 32 C36 29 33 26 30 26Z"
                stroke="#C8294A"
                strokeWidth="3"
                fill="none"
              />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold text-[#C8294A] tracking-wide"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Matcha
          </h1>
          <p className="text-[#C8294A] text-sm tracking-widest uppercase">Social app</p>
        </div>

        {/* Tagline */}
        <p className="text-gray-800 text-lg italic font-medium text-center">
          Log in to find your match
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-400 bg-white/30 hover:bg-white/50 transition rounded-lg py-3 px-4 text-gray-800 font-bold tracking-widest text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-[#C8294A]/40" />
          <span className="text-[#C8294A] text-sm font-semibold">OR</span>
          <div className="flex-1 h-px bg-[#C8294A]/40" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Email */}
          <div className="flex items-center gap-3 border-b border-gray-500 pb-2">
            <User size={18} className="text-gray-600 shrink-0" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 border-b border-gray-500 pb-2">
            <Lock size={18} className="text-gray-600 shrink-0" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#E8284A] hover:bg-[#c8203e] transition text-white font-bold tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 text-sm mt-1"
          >
            LOG IN <span className="text-xs">▶</span>
          </button>
        </form>

        {/* Forgot password */}
        <button
          className="text-gray-800 font-bold underline text-sm hover:text-[#C8294A] transition"
          onClick={() => navigate('/forgot-password')}
        >
          Forgot your password?
        </button>

        {/* Switch to register */}
        <p className="text-gray-800 text-sm text-center">
          You don't have an account?{' '}
          <button
            className="text-[#C8294A] font-semibold hover:underline"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
