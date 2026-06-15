import { useState } from 'react';
import { Sparkles, Heart, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

import { useBrowse } from '@/hooks/useBrowse';
import { Spinner } from '@/components/ui/Spinner';
import { SkeletonCard } from '@/components/browse/SkeletonCard';
import { UserCard } from '@/components/browse/UserCard';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ActiveChips } from '@/components/search/ActiveChips';
import { SORT_OPTIONS } from '@/types/search';
import type { SortKey } from '@/types/search';

type TabValue = 'all' | 'liked' | 'liked-me' | 'matches';

export default function BrowsePage() {
  const [showFilters, setShowFilters] = useState(false);
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
    if (window.innerWidth < 1024) setShowFilters(false);
  };

  const displayed = users;
  const hasMore = users.length < total;

  return (
    <div className="relative bg-background font-primary min-h-[100dvh] pb-10 overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-80 right-20 w-80 h-80 bg-primary-light/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight mb-2 flex items-center gap-2">
            Discover People <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </h1>
          <p className="text-xs sm:text-sm font-medium text-text-muted">
            {loading ? 'Looking for your perfect match...' : `${total} profiles waiting for you`}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-surface border-2 border-error rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-6 flex items-center justify-between gap-3 shadow-sm animate-fade-in-up">
            <span className="text-xs sm:text-sm font-bold text-error">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-error opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs + Filter Toggle */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-1 bg-surface backdrop-blur-md border border-border rounded-full p-1 sm:p-1.5 w-full sm:w-fit shadow-sm">
            {(
              [
                ['all', 'All'],
                ['liked', 'I Liked'],
                ['liked-me', 'Liked Me'],
                ['matches', 'Matches'],
              ] as [TabValue, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => fetchTab(val)}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full border-none text-xs sm:text-sm font-bold cursor-pointer transition-all duration-300 ${
                  activeTab === val
                    ? 'bg-primary text-surface shadow-md'
                    : 'bg-transparent text-text-muted hover:bg-background hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'all' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 active:scale-95 cursor-pointer w-full sm:w-auto ${
                showFilters
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface border-border text-text hover:bg-background hover:border-primary/20'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-surface text-[0.6rem] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Main layout */}
        <div className={activeTab === 'all' && showFilters ? 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start' : ''}>
          {/* Sidebar */}
          {activeTab === 'all' && showFilters && (
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

          {/* Results Column */}
          <div>
            {/* Sort bar */}
            {activeTab === 'all' && (
              <div className="bg-surface border border-border rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-4 shadow-sm">
                <p className="text-xs sm:text-sm text-text-muted font-medium">
                  {loading ? (
                    'Searching…'
                  ) : (
                    <>
                      <span className="font-black text-text">{total}</span> profiles found
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="w-full appearance-none bg-background border border-border text-text text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-8 py-2 outline-none cursor-pointer focus:border-primary transition-colors"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>

                  <button
                    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center justify-center gap-1.5 bg-background border border-border px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-text hover:bg-border/50 transition-colors active:scale-95 shrink-0"
                  >
                    {order === 'asc' ? (
                      <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}{' '}
                    <span className="hidden sm:inline">{order === 'asc' ? 'Asc' : 'Desc'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active filter chips */}
            {activeTab === 'all' && (
              <ActiveChips filters={filters} onRemove={removeFilter} />
            )}

            {/* Content Grid */}
            {loading ? (
              <div className={activeTab === 'all' && showFilters
                ? 'grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : displayed.length > 0 ? (
              <>
                <div className={activeTab === 'all' && showFilters
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
                  <div className="text-center mt-8 sm:mt-12">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border-2 border-border bg-surface text-text text-sm sm:text-base font-black shadow-sm cursor-pointer inline-flex items-center gap-2 transition-all disabled:opacity-70 hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
                    >
                      {loadingMore ? (
                        <>
                          <Spinner size="sm" /> Loading...
                        </>
                      ) : (
                        `Load More (${total - users.length} remaining)`
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 sm:py-20 px-4 sm:px-5 relative z-10 animate-fade-in-up">
                <div className="flex justify-center mb-5 sm:mb-6 text-primary opacity-40 animate-pulse">
                  <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-current" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-text mb-2 sm:mb-3">
                  {activeTab === 'matches'
                    ? 'No matches yet'
                    : activeTab === 'liked'
                      ? "You haven't liked anyone yet"
                      : activeTab === 'liked-me'
                        ? 'No one has liked you yet'
                        : 'No profiles found'}
                </h3>
                <p className="text-sm sm:text-base font-medium text-text-muted max-w-sm mx-auto leading-relaxed">
                  Check back soon — new cuties join every day, or try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
