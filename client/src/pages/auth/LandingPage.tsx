import { Link } from 'react-router-dom';
import {
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Heart,
  Compass,
  ArrowRight,
  Zap,
} from 'lucide-react';
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
      <g className="animate-float-bob">
        <path
          d="M288 52 C288 46 296 40 300 46 C304 40 312 46 312 52 C312 60 300 68 300 68 C300 68 288 60 288 52Z"
          fill="none"
          stroke="#D4537E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <g className="animate-float-bob [animation-delay:0.5s]">
        <path
          d="M272 38 C272 33 278 28 281 33 C284 28 290 33 290 38 C290 44 281 50 281 50 C281 50 272 44 272 38Z"
          fill="none"
          stroke="#D4537E"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </g>
      <g className="animate-float-bob [animation-delay:1s]">
        <path
          d="M306 30 C306 26 311 22 313 26 C315 22 320 26 320 30 C320 35 313 40 313 40 C313 40 306 35 306 30Z"
          fill="none"
          stroke="#f4a4b2"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* ── Brown bear ── */}
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
        <circle cx="158" cy="112" r="14" fill="#e8d8d0" />
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
      <g className="animate-heart-pulse origin-[190px_226px]">
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
      <g className="animate-bear-bob [animation-delay:0.6s]">
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
    <main className="relative min-h-screen overflow-x-hidden bg-background font-primary select-none pb-20">
      {/* Background radial glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-primary-accent/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Floating background hearts */}
      <FloatingHearts />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 w-full px-5 sm:px-10 lg:px-14 py-4 sm:py-5 bg-background/60 backdrop-blur-md border-b border-border/40 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-border/80 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-text-muted transition-all hover:border-primary hover:text-primary active:scale-95 cursor-pointer"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-primary px-5 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_4px_18px_rgba(233,64,87,0.3)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_4px_22px_rgba(233,64,87,0.5)] cursor-pointer"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 pt-8 sm:pt-16 pb-16 flex flex-col lg:flex-row lg:items-center gap-12 lg:min-h-[calc(100vh-80px)] z-10">
        {/* Left Side — Copy */}
        <div className="w-full lg:w-[48%] flex flex-col items-start text-left animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary">
              Reinventing Modern Connections
            </span>
          </div>

          <h1 className="mb-6 text-[2.6rem] xs:text-[3.2rem] sm:text-[4.2rem] lg:text-[4.6rem] xl:text-[5.2rem] font-black leading-[1.05] tracking-tight text-text">
            Find your{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-primary-accent italic">
              matchy matchy
              <span className="absolute bottom-1 left-0 w-full h-[4px] bg-gradient-to-r from-primary to-primary-accent rounded-full opacity-60" />
            </span>
          </h1>

          <p className="mb-8 max-w-[480px] text-sm sm:text-base md:text-lg leading-relaxed text-text-muted font-medium">
            Matcha brings you closer to the people who truly resonate with your vibe, interests, and style.
            No superficial noise. Pure, authentic interactions.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-3.5 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(233,64,87,0.38)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_8px_32px_rgba(233,64,87,0.55)] cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current shrink-0" />
              Find my match
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/40 backdrop-blur-md px-8 py-3.5 sm:py-4 text-sm sm:text-base font-black uppercase tracking-wider text-text transition-all hover:border-primary/50 hover:bg-surface/75 active:scale-95 cursor-pointer"
            >
              Explore Map
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Side — Illustration */}
        <div className="relative flex flex-1 items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-0">
          {/* Animated Glow Rings behind illustration */}
          <div className="absolute w-[80%] aspect-square rounded-full border border-primary/10 animate-[pulseSlow_6s_ease-in-out_infinite] pointer-events-none" />
          <div className="absolute w-[60%] aspect-square rounded-full border border-primary-accent/10 animate-[pulseSlow_4s_ease-in-out_infinite] [animation-delay:1.5s] pointer-events-none" />

          {/* SVG Illustration Container */}
          <div className="relative z-10 w-full max-w-[480px] transform hover:scale-102 transition-transform duration-500">
            <BearIllustration />
          </div>
        </div>
      </section>

      {/* ── Stats section ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-surface/40 backdrop-blur-xl border border-border/50 shadow-premium animate-fade-in-up">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-3xl sm:text-4xl font-black text-primary">500+</span>
            <span className="text-xs sm:text-sm font-bold text-text-muted mt-1 uppercase tracking-wider">
              Verified Profiles
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-border/30">
            <span className="text-3xl sm:text-4xl font-black text-primary">10K+</span>
            <span className="text-xs sm:text-sm font-bold text-text-muted mt-1 uppercase tracking-wider">
              Matches Connected
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-border/30">
            <span className="text-3xl sm:text-4xl font-black text-primary">150+</span>
            <span className="text-xs sm:text-sm font-bold text-text-muted mt-1 uppercase tracking-wider">
              Cities Represented
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-border/30">
            <span className="text-3xl sm:text-4xl font-black text-primary">99.8%</span>
            <span className="text-xs sm:text-sm font-bold text-text-muted mt-1 uppercase tracking-wider">
              Real Humans Only
            </span>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-black text-text mb-4">
            Designed for Genuine Connections
          </h2>
          <p className="text-sm sm:text-base text-text-muted font-medium">
            Matcha leaves behind the generic, superficial matchmaking elements. Here is how we make it
            meaningful and tailored.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="group bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(233,64,87,0.12)]">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-text mb-2">Smart Discovery</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-medium">
              Filter and search by age gap, geographic distance, common tags, and Fame Rating to find
              matches that perfectly fit your lifestyle.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(233,64,87,0.12)]">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-text mb-2">Interactive Map</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-medium">
              Explore potential connections visually in your neighborhood. Discover real-time location-based
              profiles with privacy-first coordinates.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(233,64,87,0.12)]">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-text mb-2">Real-time Interaction</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-medium">
              Instant notification updates, likes tracking, visitors tracking, and real-time chat powered by
              WebSockets make sure you never miss a beat.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group bg-surface/50 border border-border/50 rounded-3xl p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(233,64,87,0.12)]">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-text mb-2">Authenticity First</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-medium">
              Matcha enforces safety with blocklists, profile reporting, and a dynamic Fame Rating system
              calculated from profile popularity.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works section ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-black text-text mb-4">How Matcha Works</h2>
          <p className="text-sm sm:text-base text-text-muted font-medium">
            Three simple steps to transition from matches to memorable experiences.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative font-medium">
          {/* Connector line on md screens */}
          <div className="hidden md:block absolute top-[2rem] left-[15%] right-[15%] h-[2px] bg-border/40 z-0" />

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary flex items-center justify-center text-lg font-black text-text mb-4 shadow-md">
              01
            </div>
            <h3 className="text-lg font-black text-text mb-2">Complete Profile</h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-[260px] leading-relaxed">
              Verify your email, upload up to 5 photos, share your interests, and verify your location.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-border/80 flex items-center justify-center text-lg font-black text-text mb-4 shadow-md">
              02
            </div>
            <h3 className="text-lg font-black text-text mb-2">Explore & Match</h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-[260px] leading-relaxed">
              Explore personalized recommendations on the browse feed, search using filters, or find people
              on the map.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-border/80 flex items-center justify-center text-lg font-black text-text mb-4 shadow-md">
              03
            </div>
            <h3 className="text-lg font-black text-text mb-2">Chat & Connect</h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-[260px] leading-relaxed">
              When both of you like each other, it is a Match. Chat instantly, schedule dates, and enjoy.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA bottom section ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-surface/80 to-surface/40 border border-primary/20 p-8 sm:p-12 lg:p-16 text-center shadow-premium backdrop-blur-xl">
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-primary/10 rounded-full blur-[40px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <Zap className="w-8 h-8 text-primary mb-6 animate-pulse-slow animate-bounce" />
            <h2 className="text-2xl sm:text-4xl font-black text-text mb-4">Ready to find your match?</h2>
            <p className="text-xs sm:text-sm md:text-base text-text-muted mb-8 leading-relaxed font-medium">
              Join thousands of single professionals who have registered on Matcha. Start matching, talking
              and planning dates today.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(233,64,87,0.3)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_6px_25px_rgba(233,64,87,0.5)] cursor-pointer"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
