import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const heartPath = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

const Heart = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d={heartPath} />
  </svg>
);

const ORBIT_HEARTS = [
  { size: 16, color: '#f4a4b2', anim: 'orbit1 4s linear infinite' },
  { size: 12, color: '#EDA0B8', anim: 'orbit2 5s linear infinite' },
  { size: 14, color: '#D4537E', anim: 'orbit3 3.5s linear infinite' },
  { size: 10, color: '#F4A4B2', anim: 'orbit4 6s linear infinite' },
  { size: 13, color: '#e8899a', anim: 'orbit5 4.5s linear infinite' },
];

const FLOAT_HEARTS = [
  { left: '8%',  size: 20, color: '#f4a4b2', dur: 5.2, delay: 0 },
  { left: '18%', size: 14, color: '#EDA0B8', dur: 4.4, delay: 1.1 },
  { left: '30%', size: 18, color: '#D4537E', dur: 6.0, delay: 0.4 },
  { left: '45%', size: 12, color: '#f18ea7', dur: 5.5, delay: 2.2 },
  { left: '58%', size: 22, color: '#F4C8D0', dur: 4.8, delay: 0.7 },
  { left: '70%', size: 16, color: '#EDA0B8', dur: 5.9, delay: 1.8 },
  { left: '82%', size: 13, color: '#D4537E', dur: 4.2, delay: 0.3 },
  { left: '92%', size: 19, color: '#f4a4b2', dur: 5.3, delay: 1.5 },
  { left: '3%',  size: 11, color: '#e8899a', dur: 3.9, delay: 2.8 },
  { left: '53%', size: 17, color: '#C4364A', dur: 6.5, delay: 0.9 },
];

const SPARKLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: 6 + (i * 3.7) % 8,
  x: 5 + (i * 13.7) % 90,
  y: 5 + (i * 17.3) % 90,
  delay: (i * 0.43) % 3,
  dur: 1.5 + (i * 0.31) % 2,
}));

const LandingPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8"
      style={{ background: '#fdf6f8' }}>

      {/* Background blobs */}
      <div className="pointer-events-none absolute rounded-full"
        style={{ width: 320, height: 320, background: 'rgba(244,164,178,0.18)', top: -60, right: -80 }} />
      <div className="pointer-events-none absolute rounded-full"
        style={{ width: 240, height: 240, background: 'rgba(212,83,126,0.10)', bottom: -40, left: -60 }} />
      <div className="pointer-events-none absolute rounded-full"
        style={{ width: 180, height: 180, background: 'rgba(244,164,178,0.12)', top: '40%', left: '5%' }} />

      {/* Floating hearts layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOAT_HEARTS.map((h, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: h.left,
              bottom: -30,
              color: h.color,
              animation: `floatSide ${h.dur}s linear ${h.delay}s infinite`,
            }}
          >
            <Heart size={h.size} color={h.color} />
          </div>
        ))}
      </div>

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center text-center rounded-[2rem] px-8 py-12 w-full"
        style={{
          maxWidth: 640,
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid #f0dce4',
          backdropFilter: 'blur(12px)',
          animation: 'popIn 0.7s cubic-bezier(.22,1,.36,1) both',
        }}
      >
        {/* Sparkles */}
        {SPARKLES.map((s) => (
          <div
            key={s.id}
            className="absolute pointer-events-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              color: '#f4a4b2',
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          >
            <svg width={s.size} height={s.size} viewBox="0 0 10 10" fill="currentColor">
              <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4" />
            </svg>
          </div>
        ))}

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6" style={{ color: '#D4537E', fontSize: 22, fontWeight: 500 }}>
          <Heart size={20} color="#D4537E" />
          matcha
        </div>

        {/* Heart cluster */}
        <div className="relative flex items-center justify-center mb-7" style={{ width: 130, height: 130 }}>
          {/* Pulse rings */}
          <div className="absolute rounded-full"
            style={{ width: 90, height: 90, top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              border: '2px solid rgba(212,83,126,0.4)', animation: 'pulseRing 2.4s ease-out infinite' }} />
          <div className="absolute rounded-full"
            style={{ width: 115, height: 115, top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              border: '2px solid rgba(212,83,126,0.25)', animation: 'pulseRing 2.4s ease-out 0.8s infinite' }} />

          {/* Main heart */}
          <div style={{ animation: 'heartbeat 2s ease-in-out infinite', filter: 'drop-shadow(0 0 12px rgba(212,83,126,0.3))' }}>
            <Heart size={80} color="#D4537E" />
          </div>

          {/* Orbiting hearts */}
          {ORBIT_HEARTS.map((h, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                marginTop: -h.size / 2,
                marginLeft: -h.size / 2,
                animation: h.anim,
              }}
            >
              <Heart size={h.size} color={h.color} />
            </div>
          ))}
        </div>

        {/* Heading */}
        <h1 className="mb-3" style={{ fontSize: '2.4rem', fontWeight: 500, color: '#2d1a24', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
          find your{' '}
          <span style={{ color: '#D4537E', display: 'inline-block', animation: 'wiggle 2.5s ease-in-out infinite', transformOrigin: 'center' }}>
            matchy matchy
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-8" style={{ fontSize: '1rem', lineHeight: 1.65, color: '#9a6b7c', maxWidth: 440 }}>
          Matcha helps you discover compatible profiles, start conversations instantly, and
          meet safely in a community built for modern dating.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 transition-transform hover:scale-105"
            style={{
              height: 52,
              padding: '0 2rem',
              borderRadius: 100,
              background: '#D4537E',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <Heart size={16} color="white" />
            Get started
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center transition-transform hover:scale-105"
            style={{
              height: 52,
              padding: '0 2rem',
              borderRadius: 100,
              background: 'white',
              color: '#2d1a24',
              fontSize: '0.9rem',
              fontWeight: 500,
              border: '1px solid #f0dce4',
              textDecoration: 'none',
            }}
          >
            Log in
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes floatSide {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.9; }
          33%  { transform: translateY(-15px) translateX(8px) rotate(15deg); opacity: 0.7; }
          66%  { transform: translateY(-28px) translateX(-5px) rotate(-10deg); opacity: 0.4; }
          100% { transform: translateY(-50px) translateX(3px) rotate(20deg); opacity: 0; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14%  { transform: scale(1.22); }
          28%  { transform: scale(1); }
          42%  { transform: scale(1.18); }
          70%  { transform: scale(1); }
        }
        @keyframes orbit1 {
          from { transform: rotate(0deg)   translateX(70px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(120deg) translateX(85px) rotate(-120deg); }
          to   { transform: rotate(480deg) translateX(85px) rotate(-480deg); }
        }
        @keyframes orbit3 {
          from { transform: rotate(240deg) translateX(60px) rotate(-240deg); }
          to   { transform: rotate(600deg) translateX(60px) rotate(-600deg); }
        }
        @keyframes orbit4 {
          from { transform: rotate(60deg)  translateX(95px) rotate(-60deg); }
          to   { transform: rotate(420deg) translateX(95px) rotate(-420deg); }
        }
        @keyframes orbit5 {
          from { transform: rotate(180deg) translateX(50px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(50px) rotate(-540deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-8deg); }
          50%       { transform: rotate(8deg); }
        }
        @keyframes pulseRing {
          0%   { transform: translate(-50%,-50%) scale(0.9); opacity: 0.6; }
          50%  { transform: translate(-50%,-50%) scale(1.3); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(0.9); opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </main>
  );
};

export default LandingPage;
