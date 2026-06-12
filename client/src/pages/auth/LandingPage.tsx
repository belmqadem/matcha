import { Link } from 'react-router-dom';
import FloatingHearts from '@/components/FloatingHearts';
import Logo from '@/components/Logo';

// ─── Bear illustration ────────────────────────────────────────────────────────
// Local component — only ever used on this page.
// SVG fill values are hardcoded illustration colours, not design tokens.

function BearIllustration() {
  return (
    <svg
      viewBox="0 0 420 340"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 w-full max-w-[460px]"
      aria-hidden="true"
    >
      {/* Floating outline hearts above bears */}
      <g className="animate-[floatBob_2.8s_ease-in-out_infinite]">
        <path
          d="M288 52 C288 46 296 40 300 46 C304 40 312 46 312 52 C312 60 300 68 300 68 C300 68 288 60 288 52Z"
          fill="none"
          stroke="#D4537E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <g className="animate-[floatBob_2.4s_ease-in-out_0.5s_infinite]">
        <path
          d="M272 38 C272 33 278 28 281 33 C284 28 290 33 290 38 C290 44 281 50 281 50 C281 50 272 44 272 38Z"
          fill="none"
          stroke="#D4537E"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </g>
      <g className="animate-[floatBob_3s_ease-in-out_1s_infinite]">
        <path
          d="M306 30 C306 26 311 22 313 26 C315 22 320 26 320 30 C320 35 313 40 313 40 C313 40 306 35 306 30Z"
          fill="none"
          stroke="#f4a4b2"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* ── Brown bear ── */}
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

      {/* ── Heart held between bears ── */}
      <g className="animate-[heartPulse_1.8s_ease-in-out_infinite] origin-[190px_226px]">
        <path
          d="M167 210 C167 196 178 188 185 196 C192 188 203 196 203 210 C203 226 185 242 185 242 C185 242 167 226 167 210Z"
          fill="#D4537E"
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

      {/* ── White bear ── */}
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
        <ellipse cx="308" cy="187" rx="9" ry="6" fill="#D4537E" opacity="0.85" />
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
        <circle cx="272" cy="174" r="2.5" fill="#D4537E" opacity="0.4" />
        <circle cx="280" cy="176" r="2" fill="#D4537E" opacity="0.4" />
        <circle cx="336" cy="174" r="2.5" fill="#D4537E" opacity="0.4" />
        <circle cx="344" cy="176" r="2" fill="#D4537E" opacity="0.4" />
      </g>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background font-primary">
      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-5 sm:px-10 lg:px-14 py-5 sm:py-6">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-full border border-border px-4 sm:px-5 py-2 text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold text-white shadow-[0_4px_18px_rgba(212,83,126,0.38)] transition-transform hover:scale-105 active:scale-95"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="flex flex-col lg:flex-row lg:items-center px-5 sm:px-10 lg:pl-14 pb-12 lg:pb-0 lg:min-h-[calc(100vh-80px)]">
        {/* Left — copy */}
        <div className="z-10 w-full lg:w-[44%] lg:shrink-0 pt-6 sm:pt-10 lg:pt-0 animate-[slideInLeft_0.7s_cubic-bezier(.22,1,.36,1)_both]">
          <h1 className="mb-5 text-[2.2rem] xs:text-[2.6rem] sm:text-[3.2rem] lg:text-[3.8rem] xl:text-[4.2rem] font-extrabold leading-[1.08] tracking-[-1px] sm:tracking-[-1.5px] lg:tracking-[-2px] text-text">
            Find your{' '}
            <span className="inline-block text-primary font-display italic">matchy matchy</span>
          </h1>

          <p className="mb-8 sm:mb-10 max-w-[360px] text-sm sm:text-[0.96rem] leading-relaxed text-text-muted">
            Matcha matches you with people who just get it — your humor, your pace, your vibe. Real
            connections, no noise.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 sm:px-9 py-3 sm:py-3.5 text-sm sm:text-[0.95rem] font-semibold text-white shadow-[0_8px_28px_rgba(212,83,126,0.38)] transition-transform hover:scale-105 active:scale-95"
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Find my match
          </Link>
        </div>

        {/* Right — illustration */}
        <div className="relative flex flex-1 animate-[fadeIn_0.9s_ease_0.2s_both] items-center justify-center mt-8 sm:mt-10 lg:mt-0 lg:h-[calc(100vh-80px)]">
          {/* Blob background */}
          <svg
            viewBox="0 0 700 600"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fce8ed" />
                <stop offset="55%" stopColor="#f4a4b2" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#D4537E" stopOpacity="0.28" />
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
          <FloatingHearts />

          {/* Bears */}
          <div className="relative z-10 w-4/5 max-w-[480px] pt-5">
            <BearIllustration />
          </div>
        </div>
      </div>
    </main>
  );
}
