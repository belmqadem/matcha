import { useState, type ReactNode } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import MatchaLogo from '@/components/Logo';

const heartPath =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

const Heart = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={`fill-current ${className}`}>
    <path d={heartPath} />
  </svg>
);

// Pre-compiled Tailwind arbitrary classes to completely avoid inline styles
const DRIFT_HEARTS = [
  { size: 18, classes: 'left-[5%] animate-[authDrift_5.2s_linear_0s_infinite]' },
  { size: 13, classes: 'left-[15%] animate-[authDrift_4.4s_linear_1.1s_infinite]' },
  { size: 16, classes: 'left-[27%] animate-[authDrift_6.0s_linear_0.4s_infinite]' },
  { size: 11, classes: 'left-[40%] animate-[authDrift_5.5s_linear_2.2s_infinite]' },
  { size: 20, classes: 'left-[55%] animate-[authDrift_4.8s_linear_0.7s_infinite]' },
  { size: 14, classes: 'left-[68%] animate-[authDrift_5.9s_linear_1.8s_infinite]' },
  { size: 12, classes: 'left-[80%] animate-[authDrift_4.2s_linear_0.3s_infinite]' },
  { size: 17, classes: 'left-[90%] animate-[authDrift_5.3s_linear_1.5s_infinite]' },
  { size: 10, classes: 'left-[72%] animate-[authDrift_3.9s_linear_2.8s_infinite]' },
  { size: 15, classes: 'left-[35%] animate-[authDrift_6.5s_linear_0.9s_infinite]' },
];

const SPARKLES = [
  { size: 7, classes: 'left-[8%] top-[12%] animate-[authTwinkle_2.1s_ease-in-out_0s_infinite]' },
  { size: 5, classes: 'left-[88%] top-[18%] animate-[authTwinkle_1.8s_ease-in-out_0.6s_infinite]' },
  { size: 8, classes: 'left-[15%] top-[75%] animate-[authTwinkle_2.4s_ease-in-out_1.2s_infinite]' },
  { size: 6, classes: 'left-[82%] top-[70%] animate-[authTwinkle_1.6s_ease-in-out_0.3s_infinite]' },
  { size: 5, classes: 'left-[50%] top-[8%] animate-[authTwinkle_2.0s_ease-in-out_1.8s_infinite]' },
  { size: 7, classes: 'left-[25%] top-[88%] animate-[authTwinkle_1.9s_ease-in-out_0.9s_infinite]' },
  { size: 6, classes: 'left-[70%] top-[85%] animate-[authTwinkle_2.3s_ease-in-out_2.1s_infinite]' },
  { size: 5, classes: 'left-[92%] top-[45%] animate-[authTwinkle_1.7s_ease-in-out_0.4s_infinite]' },
];

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
      {/* Floating Theme Toggle */}
      <div className="absolute w-full top-0 left-0 z-20 flex justify-between px-4 md:px-8 lg:px-12 py-6">
        <MatchaLogo size="lg" />
        <ThemeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
      </div>

      {/* Background blobs */}
      <div className="pointer-events-none absolute rounded-full bg-primary/20 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] -top-16 -right-16 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute rounded-full bg-primary/10 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] -bottom-10 -left-12 blur-3xl animate-float-slow [animation-delay:2s]" />
      <div className="pointer-events-none absolute rounded-full bg-primary/15 w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] top-[40%] left-[4%] blur-2xl animate-float-slow [animation-delay:4s]" />

      <FloatingHearts />

      {/* Drifting hearts without inline styles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {DRIFT_HEARTS.map((h, i) => (
          <div key={i} className={`absolute -bottom-8 text-primary/40 ${h.classes}`}>
            <Heart size={h.size} />
          </div>
        ))}
      </div>

      {/* Sparkle stars without inline styles */}
      {SPARKLES.map((s, i) => (
        <div key={i} className={`pointer-events-none absolute text-primary/30 ${s.classes}`}>
          <svg width={s.size} height={s.size} viewBox="0 0 10 10" fill="currentColor">
            <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4" />
          </svg>
        </div>
      ))}

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
