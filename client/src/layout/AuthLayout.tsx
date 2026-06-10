import type { ReactNode } from 'react';
import MatchaLogo from '@/components/Logo';
import FloatingHearts from '@/components/FloatingHearts';

const heartPath =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

const Heart = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={`fill-current ${className}`}>
    <path d={heartPath} />
  </svg>
);

const DRIFT_HEARTS = [
  { left: '5%',   size: 18, delay: '0s',    dur: '5.2s' },
  { left: '15%',  size: 13, delay: '1.1s',  dur: '4.4s' },
  { left: '27%',  size: 16, delay: '0.4s',  dur: '6.0s' },
  { left: '40%',  size: 11, delay: '2.2s',  dur: '5.5s' },
  { left: '55%',  size: 20, delay: '0.7s',  dur: '4.8s' },
  { left: '68%',  size: 14, delay: '1.8s',  dur: '5.9s' },
  { left: '80%',  size: 12, delay: '0.3s',  dur: '4.2s' },
  { left: '90%',  size: 17, delay: '1.5s',  dur: '5.3s' },
  { left: '72%',  size: 10, delay: '2.8s',  dur: '3.9s' },
  { left: '35%',  size: 15, delay: '0.9s',  dur: '6.5s' },
];

const SPARKLES = [
  { size: 7, x: '8%',  y: '12%', delay: '0s',   dur: '2.1s' },
  { size: 5, x: '88%', y: '18%', delay: '0.6s', dur: '1.8s' },
  { size: 8, x: '15%', y: '75%', delay: '1.2s', dur: '2.4s' },
  { size: 6, x: '82%', y: '70%', delay: '0.3s', dur: '1.6s' },
  { size: 5, x: '50%', y: '8%',  delay: '1.8s', dur: '2.0s' },
  { size: 7, x: '25%', y: '88%', delay: '0.9s', dur: '1.9s' },
  { size: 6, x: '70%', y: '85%', delay: '2.1s', dur: '2.3s' },
  { size: 5, x: '92%', y: '45%', delay: '0.4s', dur: '1.7s' },
];

interface AuthLayoutProps {
  children: ReactNode;
  header: string;
}

const AuthLayout = ({ children, header }: AuthLayoutProps) => (
  <div className="relative min-h-[100dvh] flex items-center justify-center p-4 overflow-hidden bg-background">

    {/* Background blobs (Replaced hardcoded rgba with Tailwind blur and design tokens) */}
    <div className="pointer-events-none absolute rounded-full bg-primary/20 w-[300px] h-[300px] -top-16 -right-16 blur-3xl" />
    <div className="pointer-events-none absolute rounded-full bg-primary/10 w-[220px] h-[220px] -bottom-10 -left-12 blur-3xl" />
    <div className="pointer-events-none absolute rounded-full bg-primary/15 w-[160px] h-[160px] top-[40%] left-[4%] blur-2xl" />

    {/* Original floating hearts */}
    <FloatingHearts />

    {/* Drifting hearts */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {DRIFT_HEARTS.map((h, i) => (
        <div
          key={i}
          className="absolute -bottom-8 text-primary/40"
          style={{
            left: h.left,
            animation: `authDrift ${h.dur} linear ${h.delay} infinite`,
          }}
        >
          <Heart size={h.size} />
        </div>
      ))}
    </div>

    {/* Sparkle stars */}
    {SPARKLES.map((s, i) => (
      <div
        key={i}
        className="pointer-events-none absolute text-primary/30"
        style={{
          left: s.x,
          top: s.y,
          animation: `authTwinkle ${s.dur} ease-in-out ${s.delay} infinite`,
        }}
      >
        <svg width={s.size} height={s.size} viewBox="0 0 10 10" fill="currentColor">
          <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4" />
        </svg>
      </div>
    ))}

    {/* Card (Replaced inline styles with pure Tailwind classes) */}
    <div className="relative w-full max-w-sm z-10 rounded-3xl px-8 py-8 bg-surface/90 border border-primary/20 backdrop-blur-xl shadow-xl animate-[authPopIn_0.6s_cubic-bezier(0.22,1,0.36,1)_both] flex flex-col items-center">

      <MatchaLogo size="md" className="mb-4" />

      <div className="text-center mb-6 w-full">
        <p className="text-xl font-bold text-text">
          {header}
        </p>
      </div>

      <div className="w-full">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
