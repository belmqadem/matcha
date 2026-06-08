// src/layout/AuthLayout.tsx
import type { ReactNode } from 'react';
import MatchaLogo from '@/components/Logo';
import FloatingHearts from '@/components/FloatingHearts';

const heartPath =
  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

const Heart = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d={heartPath} />
  </svg>
);

// We keep the dynamic values (left, size, duration) inline, but map colors using our variables if possible,
// or allow specific aesthetic hexes only if they are graphic assets (like SVGs).
// Since these are brand graphics, they are acceptable as dynamic props, but UI colors must be tokens.
const DRIFT_HEARTS = [
  { left: '5%',  size: 18, color: '#f4a4b2', dur: 5.2, delay: 0 },
  { left: '15%', size: 13, color: '#EDA0B8', dur: 4.4, delay: 1.1 },
  { left: '27%', size: 16, color: '#D4537E', dur: 6.0, delay: 0.4 },
  { left: '40%', size: 11, color: '#f18ea7', dur: 5.5, delay: 2.2 },
  { left: '55%', size: 20, color: '#F4C8D0', dur: 4.8, delay: 0.7 },
  { left: '68%', size: 14, color: '#EDA0B8', dur: 5.9, delay: 1.8 },
  { left: '80%', size: 12, color: '#D4537E', dur: 4.2, delay: 0.3 },
  { left: '90%', size: 17, color: '#f4a4b2', dur: 5.3, delay: 1.5 },
  { left: '72%', size: 10, color: '#e8899a', dur: 3.9, delay: 2.8 },
  { left: '35%', size: 15, color: '#C4364A', dur: 6.5, delay: 0.9 },
];

const SPARKLES = [
  { size: 7, x: 8,  y: 12, delay: 0,   dur: 2.1 },
  { size: 5, x: 88, y: 18, delay: 0.6, dur: 1.8 },
  { size: 8, x: 15, y: 75, delay: 1.2, dur: 2.4 },
  { size: 6, x: 82, y: 70, delay: 0.3, dur: 1.6 },
  { size: 5, x: 50, y: 8,  delay: 1.8, dur: 2.0 },
  { size: 7, x: 25, y: 88, delay: 0.9, dur: 1.9 },
  { size: 6, x: 70, y: 85, delay: 2.1, dur: 2.3 },
  { size: 5, x: 92, y: 45, delay: 0.4, dur: 1.7 },
];

interface AuthLayoutProps {
  children: ReactNode;
  header: string;
}

const AuthLayout = ({ children, header }: AuthLayoutProps) => (
  // Replaced hardcoded inline background with strict Tailwind token
  <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">

    {/* Background blobs (Dynamic inline sizing is okay, but mapped to primary color opacity) */}
    <div className="pointer-events-none absolute rounded-full bg-primary/20"
      style={{ width: 300, height: 300, top: -60, right: -60 }} />
    <div className="pointer-events-none absolute rounded-full bg-primary/10"
      style={{ width: 220, height: 220, bottom: -40, left: -50 }} />
    <div className="pointer-events-none absolute rounded-full bg-primary/15"
      style={{ width: 160, height: 160, top: '40%', left: '4%' }} />

    <FloatingHearts />

    {/* Drifting hearts */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {DRIFT_HEARTS.map((h, i) => (
        <div
          key={i}
          className="absolute animate-[authDrift_var(--dur)_linear_var(--delay)_infinite]"
          style={{
            left: h.left,
            bottom: -30,
            '--dur': `${h.dur}s`,
            '--delay': `${h.delay}s`,
          } as React.CSSProperties}
        >
          <Heart size={h.size} color={h.color} />
        </div>
      ))}
    </div>

    {/* Sparkle stars */}
    {SPARKLES.map((s, i) => (
      <div
        key={i}
        className="pointer-events-none absolute text-primary/40 animate-[authTwinkle_var(--dur)_ease-in-out_var(--delay)_infinite]"
        style={{
          left: `${s.x}%`,
          top: `${s.y}%`,
          '--dur': `${s.dur}s`,
          '--delay': `${s.delay}s`,
        } as React.CSSProperties}
      >
        <svg width={s.size} height={s.size} viewBox="0 0 10 10" fill="currentColor">
          <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4" />
        </svg>
      </div>
    ))}

    {/* Auth Card */}
    <div className="relative w-full max-w-sm z-10 rounded-3xl px-8 py-8 bg-surface/90 border border-primary/20 backdrop-blur-md animate-[authPopIn_0.6s_cubic-bezier(.22,1,.36,1)_both]">
      <MatchaLogo />

      <div className="text-center mb-6">
        <p className="text-xl font-bold text-text">
          {header}
        </p>
      </div>

      {children}
    </div>

    {/* Note: Move these keyframes to your global index.css under @layer utilities */}
    <style>{`
      @keyframes authDrift {
        0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.9; }
        33%  { transform: translateY(-18px) translateX(7px) rotate(14deg); opacity: 0.7; }
        66%  { transform: translateY(-34px) translateX(-5px) rotate(-10deg); opacity: 0.35; }
        100% { transform: translateY(-55px) translateX(3px) rotate(18deg); opacity: 0; }
      }
      @keyframes authTwinkle {
        0%, 100% { opacity: 0.15; transform: scale(0.8); }
        50%       { opacity: 1;    transform: scale(1.25); }
      }
      @keyframes authPopIn {
        0%   { transform: scale(0.92) translateY(12px); opacity: 0; }
        60%  { transform: scale(1.02) translateY(-2px); }
        100% { transform: scale(1)    translateY(0);    opacity: 1; }
      }
    `}</style>
  </div>
);

export default AuthLayout;
