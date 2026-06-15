import Logo, { Heart } from '@/components/Logo';
import { Link } from 'react-router-dom';

interface FloatHeart {
  x: string;
  y: string;
  size: number;
  color: string;
  delay: string;
}

const FLOAT_HEARTS: FloatHeart[] = [
  {
    x: 'left-[60%]',
    y: 'top-[10%]',
    size: 32,
    color: 'var(--color-primary)',
    delay: '[animation-delay:0s]',
  },
  {
    x: 'left-[76%]',
    y: 'top-[6%]',
    size: 16,
    color: 'var(--color-primary-light)',
    delay: '[animation-delay:0.5s]',
  },
  {
    x: 'left-[53%]',
    y: 'top-[26%]',
    size: 20,
    color: 'var(--color-primary-light)',
    delay: '[animation-delay:1s]',
  },
  {
    x: 'left-[84%]',
    y: 'top-[32%]',
    size: 13,
    color: 'var(--color-primary-hover)',
    delay: '[animation-delay:1.4s]',
  },
  {
    x: 'left-[68%]',
    y: 'top-[20%]',
    size: 10,
    color: 'var(--color-primary-light)',
    delay: '[animation-delay:0.3s]',
  },
];

const BearIllustration = () => (
  <svg
    viewBox="0 0 420 340"
    xmlns="http://www.w3.org/2000/svg"
    className="relative z-10 w-full max-w-[460px]"
  >
    {/* Floating hearts above white bear */}
    <g className="animate-[floatBob_2.8s_ease-in-out_infinite]">
      <path
        d="M288 52 C288 46 296 40 300 46 C304 40 312 46 312 52 C312 60 300 68 300 68 C300 68 288 60 288 52Z"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </g>
    <g className="animate-[floatBob_2.4s_ease-in-out_0.5s_infinite]">
      <path
        d="M272 38 C272 33 278 28 281 33 C284 28 290 33 290 38 C290 44 281 50 281 50 C281 50 272 44 272 38Z"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </g>
    <g className="animate-[floatBob_3s_ease-in-out_1s_infinite]">
      <path
        d="M306 30 C306 26 311 22 313 26 C315 22 320 26 320 30 C320 35 313 40 313 40 C313 40 306 35 306 30Z"
        fill="none"
        stroke="var(--color-primary-light)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>

    {/* ── BROWN BEAR ── */}
    <g className="animate-[bearBob_3s_ease-in-out_infinite]">
      <ellipse cx="108" cy="318" rx="62" ry="10" fill="#d4a8a8" opacity="0.4" />
      <ellipse cx="108" cy="240" rx="66" ry="72" fill="#c8924a" />
      <ellipse cx="108" cy="256" rx="40" ry="46" fill="#e8b87a" />
      <ellipse cx="50" cy="238" rx="20" ry="34" fill="#c8924a" transform="rotate(-15 50 238)" />
      <ellipse cx="166" cy="224" rx="20" ry="34" fill="#c8924a" transform="rotate(25 166 224)" />
      <ellipse cx="82" cy="298" rx="26" ry="20" fill="#c8924a" />
      <ellipse cx="134" cy="298" rx="26" ry="20" fill="#c8924a" />
      <ellipse cx="80" cy="312" rx="22" ry="12" fill="#b07838" />
      <ellipse cx="136" cy="312" rx="22" ry="12" fill="#b07838" />
      <circle cx="70" cy="316" r="3.5" fill="#9a6228" />
      <circle cx="80" cy="319" r="3.5" fill="#9a6228" />
      <circle cx="90" cy="316" r="3.5" fill="#9a6228" />
      <circle cx="126" cy="316" r="3.5" fill="#9a6228" />
      <circle cx="136" cy="319" r="3.5" fill="#9a6228" />
      <circle cx="146" cy="316" r="3.5" fill="#9a6228" />
      {/* head */}
      <ellipse cx="108" cy="158" rx="60" ry="56" fill="#c8924a" />
      <circle cx="58" cy="112" r="24" fill="#c8924a" />
      <circle cx="58" cy="112" r="14" fill="#e8b47a" />
      <circle cx="158" cy="112" r="24" fill="#c8924a" />
      <circle cx="158" cy="112" r="14" fill="#e8b47a" />
      <ellipse cx="108" cy="174" rx="30" ry="22" fill="#e8b87a" />
      <ellipse cx="108" cy="164" rx="11" ry="7.5" fill="#5a3018" />
      <path
        d="M98 178 Q108 188 118 178"
        fill="none"
        stroke="#5a3018"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="90" cy="148" r="9" fill="#2a1a08" />
      <circle cx="126" cy="148" r="9" fill="#2a1a08" />
      <circle cx="92" cy="146" r="3" fill="white" />
      <circle cx="128" cy="146" r="3" fill="white" />
      <ellipse cx="76" cy="170" rx="12" ry="7" fill="#e8899a" opacity="0.45" />
      <ellipse cx="140" cy="170" rx="12" ry="7" fill="#e8899a" opacity="0.45" />
    </g>

    {/* ── Heart being held ── */}
    <g className="animate-[heartPulse_1.8s_ease-in-out_infinite] origin-[190px_226px]">
      <path
        d="M167 210 C167 196 178 188 185 196 C192 188 203 196 203 210 C203 226 185 242 185 242 C185 242 167 226 167 210Z"
        fill="var(--color-primary)"
        stroke="#c0305a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse
        cx="178"
        cy="204"
        rx="5"
        ry="8"
        fill="white"
        opacity="0.35"
        transform="rotate(-20 178 204)"
      />
    </g>

    {/* ── WHITE BEAR ── */}
    <g className="animate-[bearBob_3s_ease-in-out_0.6s_infinite]">
      <ellipse cx="308" cy="318" rx="62" ry="10" fill="#d4a8a8" opacity="0.4" />
      <ellipse cx="308" cy="240" rx="66" ry="72" fill="#f0ece8" />
      <ellipse cx="308" cy="256" rx="40" ry="46" fill="#fff8f4" />
      <ellipse cx="250" cy="210" rx="20" ry="34" fill="#f0ece8" transform="rotate(30 250 210)" />
      <ellipse cx="366" cy="232" rx="20" ry="34" fill="#f0ece8" transform="rotate(-10 366 232)" />
      <ellipse cx="282" cy="298" rx="26" ry="20" fill="#f0ece8" />
      <ellipse cx="334" cy="298" rx="26" ry="20" fill="#f0ece8" />
      <ellipse cx="280" cy="312" rx="22" ry="12" fill="#d8d0c8" />
      <ellipse cx="336" cy="312" rx="22" ry="12" fill="#d8d0c8" />
      <circle cx="270" cy="316" r="3.5" fill="#c0b8b0" />
      <circle cx="280" cy="319" r="3.5" fill="#c0b8b0" />
      <circle cx="290" cy="316" r="3.5" fill="#c0b8b0" />
      <circle cx="326" cy="316" r="3.5" fill="#c0b8b0" />
      <circle cx="336" cy="319" r="3.5" fill="#c0b8b0" />
      <circle cx="346" cy="316" r="3.5" fill="#c0b8b0" />
      {/* head */}
      <ellipse cx="308" cy="158" rx="60" ry="56" fill="#f0ece8" />
      <circle cx="258" cy="112" r="24" fill="#f0ece8" />
      <circle cx="258" cy="112" r="14" fill="#e8d8d0" />
      <circle cx="358" cy="112" r="24" fill="#f0ece8" />
      <circle cx="358" cy="112" r="14" fill="#e8d8d0" />
      <ellipse cx="308" cy="174" rx="30" ry="22" fill="#fff8f4" />
      <ellipse cx="308" cy="164" rx="11" ry="7.5" fill="#3a2818" />
      <path
        d="M294 178 Q308 194 322 178"
        fill="none"
        stroke="#3a2818"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="308" cy="187" rx="9" ry="6" fill="var(--color-primary)" opacity="0.85" />
      <path
        d="M292 144 Q300 136 308 144"
        fill="none"
        stroke="#2a1a08"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M318 144 Q326 136 334 144"
        fill="none"
        stroke="#2a1a08"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="276" cy="172" rx="14" ry="8" fill="#e8899a" opacity="0.5" />
      <ellipse cx="340" cy="172" rx="14" ry="8" fill="#e8899a" opacity="0.5" />
      <circle cx="272" cy="174" r="2.5" fill="var(--color-primary)" opacity="0.4" />
      <circle cx="280" cy="176" r="2" fill="var(--color-primary)" opacity="0.4" />
      <circle cx="336" cy="174" r="2.5" fill="var(--color-primary)" opacity="0.4" />
      <circle cx="344" cy="176" r="2" fill="var(--color-primary)" opacity="0.4" />
    </g>
  </svg>
);

const LandingPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white ">
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,700&display=swap"
        rel="stylesheet"
      />

      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-4 md:px-8 lg:px-12 py-6">
        <Logo />

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-premium transition-transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="flex items-center pl-4 md:pl-8 lg:pl-14 min-h-[calc(100vh-80px)]">
        {/* LEFT */}
        <div className="z-10 w-[44%] shrink-0 animate-slide-in-left">
          <h1 className="mb-5 text-[3.8rem] font-extrabold leading-[1.08] tracking-[-2px] text-text">
            Find your <span className="inline-block text-primary italic">matchy matchy</span>
          </h1>

          <p className="mb-10 max-w-[360px] text-[0.96rem] leading-relaxed text-text-muted">
            Matcha matches you with people who just get it — your humor, your pace, your vibe. Real
            connections, no noise.
          </p>

          <div className="flex items-center gap-5">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-9 py-3.5 text-[0.95rem] font-semibold text-white shadow-premium transition-transform hover:scale-105"
            >
              <Heart size={15} color="white" />
              Find my match
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex flex-1 animate-fade-in [animation-delay:0.2s] items-center justify-center h-[calc(100vh-80px)]">
          {/* Blob */}
          <svg
            viewBox="0 0 700 600"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-background)" />
                <stop offset="55%" stopColor="var(--color-primary-light)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <path
              d="M 700 0 C 590 0 470 50 390 130 C 310 210 330 310 295 410 C 260 510 175 565 195 600 L 700 600 Z"
              fill="url(#blobGrad)"
            />
            <path
              d="M 700 0 C 575 25 495 105 455 205 C 415 305 438 405 398 505 C 378 565 318 592 355 600 L 700 600 Z"
              fill="rgba(244,164,178,0.22)"
            />
          </svg>

          {/* Floating hearts */}
          {FLOAT_HEARTS.map((h: FloatHeart, i: number) => (
            <div
              key={i}
              className={`pointer-events-none absolute z-10 animate-[floatBob_3.2s_ease-in-out_infinite] ${h.x} ${h.y} ${h.delay}`}
            >
              <Heart size={h.size} color={h.color} />
            </div>
          ))}

          {/* Bears */}
          <div className="relative z-10 w-4/5 max-w-[480px] pt-5">
            <BearIllustration />
          </div>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
