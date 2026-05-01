import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const MatchaLogo = () => (
  <div className="flex flex-col items-center mb-2">
    <div className="w-14 h-14 mb-2">
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="28" fill="#E8A0A8" fillOpacity="0.2" />
        {/* Fingerprint-style spiral icon */}
        <g transform="translate(10, 10)">
          <path d="M18 4C10.268 4 4 10.268 4 18C4 25.732 10.268 32 18 32C25.732 32 32 25.732 32 18" stroke="#C4364A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M18 8C12.477 8 8 12.477 8 18C8 23.523 12.477 28 18 28C23.523 28 28 23.523 28 18" stroke="#C4364A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M18 12C14.686 12 12 14.686 12 18C12 21.314 14.686 24 18 24C21.314 24 24 21.314 24 18" stroke="#C4364A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M18 16C16.343 16 15 17.343 15 19C15 20.657 16.343 22 18 22" stroke="#C4364A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M22 8C25.866 9.866 28 13.686 28 18C28 20 27.5 21.866 26.586 23.5" stroke="#C4364A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M26 4C30.418 6.418 33 11.0 33 16" stroke="#C4364A" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        </g>
      </svg>
    </div>
    <h1 className="text-2xl font-bold text-[#C4364A]" style={{ fontFamily: "'Playfair Display', serif" }}>
      Matcha
    </h1>
    <p className="text-xs tracking-widest text-[#C4364A] uppercase opacity-70 mt-0.5">Social app</p>
  </div>
);

interface AuthLayoutProps {
  children: ReactNode;
  fullHeight?: boolean;
}

export const AuthLayout = ({ children, fullHeight = false }: AuthLayoutProps) => (
  <div
    className="min-h-screen flex items-center justify-center p-4"
    style={{
      background: 'linear-gradient(160deg, #f9d0d8 0%, #fce8ec 40%, #fff5f6 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <div
      className="w-full max-w-sm bg-white/60 backdrop-blur-md rounded-3xl shadow-xl px-8 py-8"
      style={{ border: '1px solid rgba(196,54,74,0.1)' }}
    >
      {children}
    </div>
  </div>
);

interface AuthInputProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
}

export const AuthInput = ({ type = 'text', placeholder, value, onChange, icon }: AuthInputProps) => (
  <div className="relative flex items-center border-b border-[#e0b0b8] mb-4 pb-1 focus-within:border-[#C4364A] transition-colors">
    {icon && <span className="text-[#C4364A] opacity-60 mr-2 text-sm">{icon}</span>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-transparent text-sm text-gray-700 placeholder-[#d09098] outline-none py-1"
    />
  </div>
);

interface AuthButtonProps {
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'google';
  className?: string;
}

export const AuthButton = ({ onClick, children, type = 'button', variant = 'primary', className = '' }: AuthButtonProps) => {
  if (variant === 'google') {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-2 border-2 border-gray-800 rounded-full py-3 text-sm font-semibold text-gray-800 tracking-wider uppercase hover:bg-gray-50 transition-colors ${className}`}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold tracking-wider uppercase text-white transition-all hover:opacity-90 active:scale-95 ${className}`}
      style={{ background: 'linear-gradient(90deg, #C4364A, #e05570)' }}
    >
      {children}
      <span>▶</span>
    </button>
  );
};

export const OrDivider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-[#e0b0b8]" />
    <span className="text-xs text-[#C4364A] font-semibold tracking-widest">OR</span>
    <div className="flex-1 h-px bg-[#e0b0b8]" />
  </div>
);

// Icon components
export const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
export const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
export const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
