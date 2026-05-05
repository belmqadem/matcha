import type { ReactNode } from 'react';
import MatchaLogo from '@/components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  header: string;
}

const AuthLayout = ({ children, header }: AuthLayoutProps) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-[#F3BBBF] to-[#F7F7F7]">
    <div className="w-full max-w-sm bg-white/60 backdrop-blur-md rounded-3xl shadow-xl px-8 py-8">
      <MatchaLogo />

      <div className="text-center mb-6">
        <p className="text-xl font-bold text-(--color-text)">{header}</p>
      </div>

      {children}
    </div>
  </div>
);

export default AuthLayout;
