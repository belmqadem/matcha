import { Link } from 'react-router-dom';
import { type CSSProperties } from 'react';
import { Heart as LucideHeart } from 'lucide-react';
import MatchaLogo from '@/components/Logo';
import FloatingHearts from '@/components/FloatingHearts';

const Heart = ({ size, style }: { size: number; style: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LandingPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-background)] px-6 py-10 sm:px-10 lg:px-14">
      <div className="pointer-events-none absolute -right-20 top-8 hidden h-72 w-72 rounded-full bg-[var(--color-primary)]/20 blur-3xl lg:block" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#f4a4b2]/20 blur-3xl" />

      <FloatingHearts />

      <section className="relative mx-auto flex w-full max-w-[1160px] items-center justify-center">
        <div className="grid w-full gap-10 rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-8 shadow-[0_30px_70px_rgba(35,19,39,0.08)] backdrop-blur-xl sm:p-10 lg:grid-cols-[1.4fr_0.9fr] lg:p-12">
          <div className="space-y-8">
            <div className="max-w-md">
              <MatchaLogo />
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
                Find meaningful connections with people who feel like{' '}
                <span className="text-[var(--color-primary)]">real chemistry</span>.
              </h1>
              <p className="max-w-xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">
                Matcha helps you discover compatible profiles, start conversations instantly, and
                meet safely in a community built for modern dating.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--color-primary)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]/90"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="inline-flex h-14 items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-7 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
              >
                Log in
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {['10K+ couples', 'Safe & private', 'Free to join'].map((label) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text-muted)]"
                >
                  <LucideHeart className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center h-full">
            <div className="relative">
              <Heart
                size={120}
                style={{ color: 'var(--color-primary)', animation: 'heartbeat 1.5s infinite' }}
              />
              <Heart
                size={24}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '-40px',
                  color: '#f4a4b2',
                  animation: 'floatUp 4s infinite',
                }}
              />
              <Heart
                size={18}
                style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  color: '#EDA0B8',
                  animation: 'bounce 3s infinite 0.5s',
                }}
              />
              <Heart
                size={22}
                style={{
                  position: 'absolute',
                  bottom: '-35px',
                  left: '-35px',
                  color: '#D4537E',
                  animation: 'floatUp 5s infinite 1s',
                }}
              />
              <Heart
                size={16}
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  right: '-25px',
                  color: '#C4364A',
                  animation: 'spin 4s linear infinite 0.8s',
                }}
              />
              <Heart
                size={20}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '-50px',
                  transform: 'translateY(-50%)',
                  color: '#f18ea7',
                  animation: 'bounce 2.5s infinite 1.2s',
                }}
              />
              <Heart
                size={14}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-45px',
                  transform: 'translateY(-50%)',
                  color: '#d14a65',
                  animation: 'floatUp 3.5s infinite 0.3s',
                }}
              />
              <Heart
                size={26}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '-55px',
                  transform: 'translateX(-50%)',
                  color: '#E8899A',
                  animation: 'spin 5s linear infinite reverse 0.6s',
                }}
              />
              <Heart
                size={19}
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '-50px',
                  transform: 'translateX(-50%)',
                  color: '#F4A4B2',
                  animation: 'bounce 4s infinite 1.5s',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.8; }
          100% { transform: translateY(-40px) scale(0.9); opacity: 0; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-7px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes heartbeat {
          0%, 50%, 100% { transform: scale(1); }
          25%, 75% { transform: scale(1.2); }
        }
      `}</style>
    </main>
  );
};

export default LandingPage;
