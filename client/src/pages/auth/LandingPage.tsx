import { useState } from 'react';
import Logo, { Heart } from '@/components/Logo';
import { Link } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';

interface FloatHeart {
  x: string;
  y: string;
  size: number;
  color: string;
  delay: string;
  anim: string;
}

const FLOAT_HEARTS: FloatHeart[] = [
  {
    x: 'left-[58%]',
    y: 'top-[8%]',
    size: 34,
    color: 'var(--color-primary)',
    delay: '[animation-delay:0s]',
    anim: 'floatBob_3.2s_ease-in-out_infinite',
  },
  {
    x: 'left-[78%]',
    y: 'top-[5%]',
    size: 16,
    color: 'var(--color-primary-light)',
    delay: '[animation-delay:0.6s]',
    anim: 'floatBob_2.6s_ease-in-out_infinite',
  },
  {
    x: 'left-[50%]',
    y: 'top-[28%]',
    size: 22,
    color: 'var(--color-primary-light)',
    delay: '[animation-delay:1.1s]',
    anim: 'floatCute_3.4s_ease-in-out_infinite',
  },
  {
    x: 'left-[86%]',
    y: 'top-[30%]',
    size: 13,
    color: 'var(--color-primary-hover)',
    delay: '[animation-delay:1.6s]',
    anim: 'floatBob_2.8s_ease-in-out_infinite',
  },
  {
    x: 'left-[66%]',
    y: 'top-[18%]',
    size: 10,
    color: 'var(--color-primary-light)',
    delay: '[animation-delay:0.4s]',
    anim: 'floatCute_3.8s_ease-in-out_infinite',
  },
  {
    x: 'left-[72%]',
    y: 'top-[55%]',
    size: 18,
    color: 'var(--color-primary)',
    delay: '[animation-delay:2s]',
    anim: 'floatBob_3s_ease-in-out_infinite',
  },
  {
    x: 'left-[54%]',
    y: 'top-[68%]',
    size: 11,
    color: 'var(--color-primary-light)',
    delay: '[animation-delay:0.9s]',
    anim: 'floatCute_4s_ease-in-out_infinite',
  },
  {
    x: 'left-[88%]',
    y: 'top-[62%]',
    size: 9,
    color: 'var(--color-primary-hover)',
    delay: '[animation-delay:1.8s]',
    anim: 'floatBob_2.4s_ease-in-out_infinite',
  },
];

const BearIllustration = () => (
  <svg
    viewBox="0 0 420 340"
    xmlns="http://www.w3.org/2000/svg"
    className="relative z-10 w-full max-w-115 drop-shadow-xl"
  >
    {/* Floating hearts above white bear */}
    <g className="animate-float-bob">
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
    <g className="animate-bear-bob">
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

    {/* ── Heart being held ── */}
    <g className="animate-heart-pulse origin-[190px_226px]">
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
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleThemeToggle = () => {
    toggleTheme();
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent text-text font-primary">
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,700&display=swap"
        rel="stylesheet"
      />

      {/* NAVBAR */}
      <nav className="relative z-20 flex items-center justify-between px-4 md:px-8 lg:px-12 py-6">
        <Logo />
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface text-text-muted hover:text-primary hover:border-primary/20 hover:bg-background transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={17} strokeWidth={1.8} />
            ) : (
              <Moon size={17} strokeWidth={1.8} />
            )}
          </button>
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
        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface p-2.5 text-text-muted transition-colors hover:border-primary/20 hover:text-primary md:hidden"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
        </button>

        {isMenuOpen ? (
          <div className="absolute right-4 top-[calc(100%+0.5rem)] z-30 w-64 rounded-3xl border border-border bg-surface p-3 shadow-premium md:hidden">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleThemeToggle}
                className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-text transition-colors hover:border-primary/20 hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun size={16} strokeWidth={1.9} /> : <Moon size={16} strokeWidth={1.9} />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </span>
              </button>
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-premium transition-transform hover:scale-[1.01]"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : null}
      </nav>

      {/* HERO */}
      <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-stretch gap-8 px-4 md:flex-row-reverse md:items-center md:gap-0 md:pl-8 lg:pl-14">
        {/* RIGHT */}
        <div className="relative order-1 flex h-[46vh] min-h-75 w-full items-center justify-end md:order-0 md:h-[calc(100vh-80px)] md:flex-1 md:justify-center md:self-auto">
          {/* Blob — rounder, more organic */}
          <svg
            viewBox="0 0 700 600"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-background)" />
                <stop offset="55%" stopColor="var(--color-primary-light)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.22" />
              </linearGradient>
            </defs>
            {/* Rounder, wobblier blob */}
            <path
              d="M700 0 C640 0 560 30 490 90 C410 158 400 260 370 360 C340 460 270 530 240 580 C220 600 700 600 700 600 Z"
              fill="url(#blobGrad)"
            />
            <path
              d="M700 0 C660 20 600 80 560 170 C520 265 545 370 510 468 C490 530 440 575 470 600 L700 600 Z"
              fill="rgba(244,164,178,0.18)"
            />
            {/* Extra soft circle accent */}
            <circle cx="580" cy="300" r="180" fill="var(--color-primary)" opacity="0.04" />
          </svg>

          {/* Floating hearts — more spread out */}
          {FLOAT_HEARTS.map((h, i) => (
            <div
              key={i}
              className={`pointer-events-none absolute z-10 animate-[${h.anim}] ${h.x} ${h.y} ${h.delay}`}
            >
              <Heart size={h.size} color={h.color} />
            </div>
          ))}

          {/* Bears */}
          <div className="relative z-10 w-[78vw] max-w-90 pt-5 animate-float-slow md:w-4/5 md:max-w-120">
            <BearIllustration />

            {/* Cute speech bubble */}
            <div className="absolute -top-2 left-[18%] animate-[fadeInUp_0.6s_0.8s_ease_both] opacity-0 [animation-fill-mode:forwards]">
              <div className="relative rounded-2xl rounded-bl-none border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text shadow-premium">
                We found each other! 🥺
                <div className="absolute -bottom-2 left-3 h-2 w-3 overflow-hidden">
                  <div className="h-3 w-3 rotate-45 border-b border-l border-border bg-surface" />
                </div>
              </div>
            </div>

            {/* Match badge */}
            <div className="absolute -right-2 top-[30%] animate-[fadeInUp_0.6s_1.1s_ease_both] opacity-0 [animation-fill-mode:forwards]">
              <div className="flex flex-col items-center gap-1 rounded-2xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-center shadow-premium">
                <span className="text-xl leading-none">💛</span>
                <span className="text-[10px] font-bold text-primary leading-tight">
                  It's a<br />
                  Match!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT */}
        <div className="z-10 order-2 mt-auto ml-4 flex w-full shrink-0 flex-col items-start pb-8 pt-4 animate-slide-in-left md:order-0 md:mt-0 md:w-[46%] md:pt-0">
          <h1 className="mb-4 text-[3.2rem] md:text-[3.8rem] font-extrabold leading-[1.05] tracking-[-2px] text-text">
            Find your{' '}
            <span className="relative inline-block">
              <span className="text-primary italic font-primary">matchy matchy</span>
              {/* Squiggly underline */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 5 Q25 1 50 5 Q75 9 100 5 Q125 1 150 5 Q175 9 200 5"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </span>
          </h1>

          <p className="mb-8 max-w-90 text-[0.97rem] leading-relaxed text-text-muted">
            Matcha matches you with people who just{' '}
            <span className="text-text font-medium italic">get it</span> — your humor, your pace,
            your vibe. Real connections, no noise.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-[0.95rem] font-semibold text-white shadow-premium transition-all hover:scale-105 hover:shadow-glow active:scale-100"
            >
              <Heart size={15} color="white" />
              Find my match
            </Link>
          </div>

          {/* Stat pills */}
          {/* <div className="flex flex-wrap gap-2.5">
            {STAT_PILLS.map((pill) => (
              <div
                key={pill.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted"
              >
                <span>{pill.emoji}</span>
                {pill.label}
              </div>
            ))}
          </div> */}
        </div>

      </div>
    </main>
  );
};

export default LandingPage;
