import { useState, type ReactNode } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import MatchaLogo from '@/components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  header: string;
}

const AuthLayout = ({ children, header }: AuthLayoutProps) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-background">
      <FloatingHearts />

      <div className="absolute w-full top-0 left-0 z-20 flex justify-between px-4 md:px-8 lg:px-12 py-6">
        <MatchaLogo size="lg" />
        <ThemeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-[95%] sm:max-w-md z-10 rounded-3xl px-6 py-8 sm:px-10 sm:py-10 bg-surface/50 border border-primary/20 backdrop-blur-xl shadow-xl animate-[authPopIn_0.6s_cubic-bezier(0.22,1,0.36,1)_both] flex flex-col items-center">
        <div className="text-center mb-6 sm:mb-8 w-full">
          <p className="text-lg sm:text-xl font-bold text-text">{header}</p>
        </div>

        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
