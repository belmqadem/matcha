import { Link } from 'react-router-dom';
// import { MatchaLogo, Button } from './AuthLayout';
import MatchaLogo from '@/components/Logo';
import Button from '@/components/ui/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-[#F3BBBF] to-[#F7F7F7]">
      <div className="w-full max-w-sm flex flex-col items-center">
        <MatchaLogo />

        {/* Illustration area */}
        <div className="relative w-full h-52 flex items-center justify-center my-6">
          {/* Chat bubble with heart */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg z-10"
            style={{ background: '#C4364A', rotate: '-5deg' }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>

          {/* Left hand */}
          <div
            className="absolute left-2 top-1/2 -translate-y-1/2"
            style={{ fontSize: '4rem', transform: 'translateY(-50%) scaleX(-1)' }}
          >
            👆
          </div>
          {/* Right hand */}
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ fontSize: '4rem', transform: 'translateY(-50%) rotate(180deg) scaleX(-1)' }}
          >
            👆
          </div>
        </div>

        {/* Tagline */}
        <div className="text-center mb-8">
          <p className="text-3xl font-bold leading-tight block mb-2">
            Find your <span className="text-(--color-primary)">matchy matchy</span>
          </p>
          <p className=" font-semibold text-lg">Real connections start here</p>
        </div>

        {/* CTA */}
        <div className="w-full">
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
          <p className="text-center text-sm text-(--color-text)/80 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-(--color-primary) font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
