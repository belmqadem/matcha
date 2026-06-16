import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Users,
  Gauge,
  PencilLine,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useBrowse } from '@/hooks/useBrowse';
import { Spinner } from '@/components/ui/Spinner';
import { SkeletonCard } from '@/components/browse/SkeletonCard';
import { UserCard } from '@/components/browse/UserCard';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ActiveChips } from '@/components/search/ActiveChips';
import { SORT_OPTIONS } from '@/types/search';
import type { SortKey } from '@/types/search';

type TabValue = 'all' | 'liked' | 'liked-me' | 'matches';

import { Heart as LogoHeart } from '@/components/Logo';

const TABS: { value: TabValue; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <LogoHeart size={14} /> },
  { value: 'liked', label: 'I Liked', icon: <LogoHeart size={14} /> },
  { value: 'liked-me', label: 'Liked Me', icon: <Users className="w-3.5 h-3.5" /> },
  { value: 'matches', label: 'Matches', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

/* ── Decorative floating sparkle ── */
function Sparkle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-primary/60 animate-auth-twinkle"
      style={style}
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

/* ── Quick filter dropdown ── */
interface QuickDropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}
function QuickDropdown({ label, icon, value, options, onSelect }: QuickDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayValue = value || 'Any';
  const isActive = Boolean(value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`flex flex-col items-start px-4 py-2 rounded-xl border transition-all duration-200 min-w-[90px] text-left ${
          isActive
            ? 'border-primary bg-primary/5 text-text'
            : 'border-border bg-transparent text-text hover:border-primary/40 hover:bg-primary/5'
        }`}
      >
        <span className="flex items-center gap-1 text-[0.6rem] font-semibold text-text-muted uppercase tracking-wider mb-0.5">
          {icon} {label}
        </span>
        <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-text-muted'}`}>
          {displayValue}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-30 bg-surface border border-border rounded-xl shadow-lg min-w-[130px] overflow-hidden animate-fade-in-up">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opt === 'Any' ? '' : opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors hover:bg-primary/10 hover:text-primary ${
                (opt === 'Any' ? !value : value === opt)
                  ? 'bg-primary/10 text-primary'
                  : 'text-text'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  const navigate = useNavigate();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    users,
    total,
    loading,
    loadingMore,
    error,
    setError,
    loadMore,
    handleLike,
    handleUnlike,
    activeTab,
    fetchTab,
    filters,
    sort,
    order,
    setSort,
    setOrder,
    updateFilter,
    applyFilters,
    clearFilters,
    removeFilter,
  } = useBrowse();

  const activeFilterCount = [
    filters.age_min || filters.age_max,
    filters.fame_min || filters.fame_max,
    (filters.location_mode === 'km' && filters.max_km) ||
      (filters.location_mode === 'city' && filters.city),
    filters.tags,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
    if (window.innerWidth < 1024) setShowAdvancedFilters(false);
  };

  /* Quick age range options */
  const ageOptions = ['Any', '18 - 25', '25 - 35', '35 - 45', '45+'];
  const distanceOptions = ['Any', '5 km', '10 km', '25 km', '50 km', '100 km'];

  /* Derive display strings */
  const ageDisplay =
    filters.age_min && filters.age_max
      ? `${filters.age_min} - ${filters.age_max}`
      : filters.age_min
        ? `${filters.age_min}+`
        : '';
  const distanceDisplay = filters.max_km ? `${filters.max_km} km` : '';

  const handleQuickAge = (v: string) => {
    if (!v) {
      updateFilter('age_min', '');
      updateFilter('age_max', '');
    } else if (v === '45+') {
      updateFilter('age_min', '45');
      updateFilter('age_max', '');
    } else {
      const [min, max] = v.split(' - ');
      updateFilter('age_min', min.trim());
      updateFilter('age_max', max.trim());
    }
    setTimeout(() => applyFilters(), 0);
  };

  const handleQuickDistance = (v: string) => {
    if (!v) {
      updateFilter('location_mode', 'km');
      updateFilter('max_km', '');
    } else {
      updateFilter('location_mode', 'km');
      updateFilter('max_km', v.replace(' km', ''));
    }
    setTimeout(() => applyFilters(), 0);
  };

  const displayed = users;
  const hasMore = users.length < total;

  return (
    <div className="relative bg-background font-primary min-h-[100dvh] pb-16">
      {/* ── Decorative blobs (overflow-hidden scoped so they don't affect dropdowns) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-60 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] translate-x-1/3" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Hero Header ── */}
        <div className="relative mb-8 flex flex-col items-center text-center select-none">
          {/* Sparkles decoration */}
          <div className="absolute -top-2 left-[20%] w-5 h-5 hidden sm:block">
            <Sparkle />
          </div>
          <div className="absolute top-4 right-[18%] w-4 h-4 hidden sm:block">
            <Sparkle style={{ animationDelay: '0.7s' }} />
          </div>
          <div className="absolute -top-1 right-[30%] w-3 h-3 hidden md:block">
            <Sparkle style={{ animationDelay: '1.4s' }} />
          </div>

          {/* Floating hearts left */}
          <div className="absolute left-4 sm:left-12 top-2 opacity-80 animate-float-slow hidden sm:block pointer-events-none">
            <svg viewBox="0 0 60 56" className="w-12 h-12 sm:w-16 sm:h-16">
              <defs>
                <linearGradient id="hg1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f9a8c4" />
                  <stop offset="100%" stopColor="#e94057" />
                </linearGradient>
              </defs>
              <path
                fill="url(#hg1)"
                d="M30 52s-28-18-28-34C2 9.3 9.3 2 18 2c5.5 0 10.4 2.8 12 7 1.6-4.2 6.5-7 12-7 8.7 0 16 7.3 16 16C58 34 30 52 30 52z"
              />
            </svg>
          </div>

          {/* Floating hearts right */}
          <div
            className="absolute right-4 sm:right-12 top-0 opacity-30 animate-float-slow hidden sm:block pointer-events-none"
            style={{ animationDelay: '1.5s' }}
          >
            <svg viewBox="0 0 60 56" className="w-8 h-8 sm:w-10 sm:h-10">
              <path
                fill="#e94057"
                d="M30 52s-28-18-28-34C2 9.3 9.3 2 18 2c5.5 0 10.4 2.8 12 7 1.6-4.2 6.5-7 12-7 8.7 0 16 7.3 16 16C58 34 30 52 30 52z"
              />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-text tracking-tight mb-2 flex items-center gap-2">
            Discover People{' '}
            <span className="inline-block animate-heart-beat">🌸</span>
          </h1>
          <p className="text-sm font-semibold text-text-muted">
            {loading ? (
              'Looking for your perfect match…'
            ) : (
              <>
                <span className="text-primary font-black">{total}</span> profiles waiting for you ✨
              </>
            )}
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-surface border-2 border-error rounded-2xl px-5 py-3 mb-6 flex items-center justify-between gap-3 shadow-sm animate-fade-in-up">
            <span className="text-sm font-bold text-error">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-error opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Inline Quick Filters ── (only on "All" tab) */}
        {activeTab === 'all' && (
          <div className="mb-6 bg-surface border border-border rounded-2xl px-4 py-3 sm:px-6 shadow-sm animate-fade-in-up relative z-20">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Left label */}
              <div className="flex items-center gap-2 mr-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-text leading-tight">
                    Find your kind of match
                  </p>
                  <p className="text-[0.65rem] text-text-muted font-medium">
                    Filter by your preferences
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-border self-center" />

              {/* Quick filters */}
              <QuickDropdown
                label="Location"
                icon={<MapPin className="w-3 h-3" />}
                value={filters.city}
                options={['Any']}
                onSelect={() => {}}
              />
              <QuickDropdown
                label="Age"
                icon={<User className="w-3 h-3" />}
                value={ageDisplay}
                options={ageOptions}
                onSelect={handleQuickAge}
              />
              <QuickDropdown
                label="Distance"
                icon={<Gauge className="w-3 h-3" />}
                value={distanceDisplay}
                options={distanceOptions}
                onSelect={handleQuickDistance}
              />

              {/* Advanced Filters toggle */}
              <button
                onClick={() => setShowAdvancedFilters((s) => !s)}
                className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 shrink-0 ${
                  showAdvancedFilters || activeFilterCount > 0
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-border text-text hover:border-primary/40'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-[0.55rem] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-1 bg-surface border border-border rounded-full p-1 w-full sm:w-fit shadow-sm">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => fetchTab(value)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 ${
                  activeTab === value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-transparent text-text-muted hover:bg-background hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort controls — only on "All" */}
          {activeTab === 'all' && (
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="w-full appearance-none bg-surface border border-border text-text text-xs font-semibold rounded-xl pl-3 pr-7 py-2 outline-none cursor-pointer focus:border-primary transition-colors"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      Sort: {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>

              <button
                onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center gap-1 bg-surface border border-border px-3 py-2 rounded-xl text-xs font-bold text-text hover:bg-border/50 transition-colors active:scale-95 shrink-0"
              >
                {order === 'asc' ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{order === 'asc' ? 'Asc' : 'Desc'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Main layout ── */}
        <div
          className={
            activeTab === 'all' && showAdvancedFilters
              ? 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start'
              : ''
          }
        >
          {/* Advanced sidebar */}
          {activeTab === 'all' && showAdvancedFilters && (
            <div className="block animate-fade-in-up">
              <FilterSidebar
                filters={filters}
                activeCount={activeFilterCount}
                onChange={updateFilter}
                onSubmit={handleSubmit}
                onClear={clearFilters}
              />
            </div>
          )}

          {/* Results column */}
          <div>
            {/* Active filter chips */}
            {activeTab === 'all' && (
              <ActiveChips filters={filters} onRemove={removeFilter} />
            )}

            {/* Grid */}
            {loading ? (
              <div className={activeTab === 'all' && showAdvancedFilters
                ? 'grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : displayed.length > 0 ? (
              <>
                <div className={activeTab === 'all' && showAdvancedFilters
                  ? 'grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }>
                  {displayed.map((user) => (
                    <div key={user.id} className="animate-fade-in-up">
                      <UserCard user={user} onLike={handleLike} onUnlike={handleUnlike} />
                    </div>
                  ))}
                </div>

                {hasMore && activeTab === 'all' && (
                  <div className="text-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 rounded-full border-2 border-border bg-surface text-text text-sm font-black shadow-sm cursor-pointer inline-flex items-center gap-2 transition-all disabled:opacity-70 hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
                    >
                      {loadingMore ? (
                        <>
                          <Spinner size="sm" /> Loading…
                        </>
                      ) : (
                        `Load More (${total - users.length} remaining)`
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 px-5 animate-fade-in-up">
                <div className="flex justify-center mb-6 text-primary opacity-40 animate-heart-pulse">
                  <Heart className="w-20 h-20 fill-current" />
                </div>
                <h3 className="text-2xl font-black text-text mb-3">
                  {activeTab === 'matches'
                    ? 'No matches yet'
                    : activeTab === 'liked'
                      ? "You haven't liked anyone yet"
                      : activeTab === 'liked-me'
                        ? 'No one has liked you yet'
                        : 'No profiles found'}
                </h3>
                <p className="text-sm font-medium text-text-muted max-w-sm mx-auto leading-relaxed">
                  Check back soon — new people join every day, or try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── "Want better matches?" footer banner ── */}
        <div className="mt-12 flex items-center justify-between gap-4 bg-surface border border-border rounded-2xl px-5 sm:px-6 py-4 shadow-sm">
          {/* Hearts illustration */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative shrink-0 w-12 h-12">
              <svg viewBox="0 0 60 56" className="w-10 h-10 absolute -left-1 top-0 opacity-90">
                <defs>
                  <linearGradient id="hg2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f9a8c4" />
                    <stop offset="100%" stopColor="#e94057" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#hg2)"
                  d="M30 52s-28-18-28-34C2 9.3 9.3 2 18 2c5.5 0 10.4 2.8 12 7 1.6-4.2 6.5-7 12-7 8.7 0 16 7.3 16 16C58 34 30 52 30 52z"
                />
              </svg>
              <svg
                viewBox="0 0 60 56"
                className="w-8 h-8 absolute left-4 top-3 opacity-60"
              >
                <path
                  fill="#f9a8c4"
                  d="M30 52s-28-18-28-34C2 9.3 9.3 2 18 2c5.5 0 10.4 2.8 12 7 1.6-4.2 6.5-7 12-7 8.7 0 16 7.3 16 16C58 34 30 52 30 52z"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black text-text leading-tight">Want better matches?</p>
              <p className="text-xs text-text-muted font-medium">
                Complete your{' '}
                <span className="text-primary font-bold">profile</span> to get more likes and
                matches!
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile/me')}
            className="shrink-0 flex items-center gap-2 bg-primary text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            <PencilLine className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
