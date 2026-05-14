import { Link } from 'react-router-dom';
import MatchaLogo from '@/components/Logo';

const Heart = ({ size, style }: { size: number; style: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const floatingHearts = [
  { size: 14, color: '#E8899A', top: '7%',    right: '22%',  anim: 'floatA', delay: '0s' },
  { size: 9,  color: '#C4364A', top: '16%',   right: '8%',   anim: 'floatB', delay: '0.5s' },
  { size: 10, color: '#F4A4B2', top: '5%',    left:  '8%',   anim: 'floatC', delay: '0.2s' },
  { size: 9,  color: '#D4537E', bottom: '20%',left:  '5%',   anim: 'floatB', delay: '1s' },
  { size: 12, color: '#EDA0B8', top: '38%',   left:  '6%',   anim: 'floatA', delay: '0.7s', reverse: true },
  { size: 11, color: '#F4A4B2', top: '28%',   right: '5%',   anim: 'floatC', delay: '0.3s', reverse: true },
  { size: 8,  color: '#C4364A', bottom: '32%',right: '12%',  anim: 'floatB', delay: '0.9s', reverse: true },
] as const;

const LandingPage = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

        html, body, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .landing-root {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          height: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          background: #FEF0F2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: clamp(24px, 5vw, 48px) clamp(16px, 5vw, 32px);
        }

        .landing-blob {
          position: absolute;
          top: 0; right: 0;
          width: 46%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .landing-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .landing-logo-wrap {
          margin-bottom: clamp(24px, 5vh, 44px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .landing-logo-sub {
          font-size: 9px;
          letter-spacing: 3px;
          color: #9B6B74;
          font-weight: 500;
        }

        .landing-heart-badge {
          width: clamp(70px, 15vw, 90px);
          height: clamp(70px, 15vw, 90px);
          background: #C4364A;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(196,54,74,0.28);
          margin-bottom: clamp(20px, 4vh, 32px);
          animation: pulseHeart 2.6s ease-in-out infinite;
        }

        .landing-tagline {
          text-align: center;
          margin-bottom: clamp(20px, 4vh, 28px);
        }

        .landing-tagline h1 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.6rem, 5vw, 2rem);
          color: #1A0A0D;
          line-height: 1.15;
          margin-bottom: 10px;
          font-weight: 400;
        }

        .landing-tagline h1 em {
          color: #C4364A;
          font-style: italic;
        }

        .landing-tagline p {
          font-size: clamp(12px, 3vw, 13.5px);
          color: #7A4D57;
          line-height: 1.6;
        }

        .landing-cta {
          width: 100%;
        }

        .landing-btn {
          width: 100%;
          padding: 15px 0;
          background: #C4364A;
          color: white;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.2s, transform 0.15s;
        }
        .landing-btn:hover { background: #A82D3F; transform: translateY(-1px); }
        .landing-btn:active { transform: translateY(0); }

        .landing-login {
          text-align: center;
          font-size: 12.5px;
          color: #7A4D57;
          margin-top: 13px;
        }
        .landing-login a {
          color: #C4364A;
          font-weight: 600;
          text-decoration: none;
        }

        .landing-trust {
          display: flex;
          gap: clamp(12px, 4vw, 20px);
          margin-top: clamp(16px, 3vh, 22px);
          opacity: 0.6;
          flex-wrap: wrap;
          justify-content: center;
        }
        .landing-trust span {
          font-size: 11px;
          color: #7A4D57;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        @keyframes floatA {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(-12px) rotate(4deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50%       { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0) rotate(10deg); }
          50%       { transform: translateY(-14px) rotate(-6deg); }
        }
        @keyframes pulseHeart {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }
      `}</style>

      <div className="landing-root">

        {/* Blob */}
        <svg className="landing-blob" viewBox="0 0 300 600" fill="none">
          <path d="M300 0 C210 60 160 120 190 230 C220 340 130 400 170 520 C200 600 300 600 300 600 Z" fill="#F5BCC8" opacity="0.55" />
          <path d="M300 60 C240 110 210 180 240 290 C270 400 200 460 240 560 L300 600 Z" fill="#EFA0B3" opacity="0.38" />
        </svg>

        {/* Floating hearts */}
        {floatingHearts.map((h, i) => (
          <Heart
            key={i}
            size={h.size}
            style={{
              position: 'absolute',
              color: h.color,
              top: 'top' in h ? h.top : undefined,
              bottom: 'bottom' in h ? h.bottom : undefined,
              left: 'left' in h ? h.left : undefined,
              right: 'right' in h ? h.right : undefined,
              zIndex: 1,
              animation: `${h.anim} ${3.5 + i * 0.4}s ease-in-out ${h.delay} infinite ${'reverse' in h && h.reverse ? 'reverse' : ''}`,
            }}
          />
        ))}

        {/* Main content */}
        <div className="landing-content">

          <div className="landing-logo-wrap">
            <MatchaLogo />
            <span className="landing-logo-sub">SOCIAL APP</span>
          </div>

          <div className="landing-heart-badge">
            <Heart size={42} style={{ color: 'white' }} />
          </div>

          <div className="landing-tagline">
            <h1>
              Find your <em>matchy<br />matchy</em>
            </h1>
            <p>
              Valentine is coming — date your couple<br />
              with some real romantic connections!
            </p>
          </div>

          <div className="landing-cta">
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="landing-btn">Get Started</button>
            </Link>
            <p className="landing-login">
              Already have an account?{' '}
              <Link to="/login">Login</Link>
            </p>
          </div>

          <div className="landing-trust">
            {['10K+ couples', 'Safe & private', 'Free to join'].map((label) => (
              <span key={label}>
                <Heart size={8} style={{ color: '#C4364A' }} />
                {label}
              </span>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default LandingPage;
