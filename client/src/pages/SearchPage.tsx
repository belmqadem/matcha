// src/pages/SearchPage.tsx
import { Loader2, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { useSearch } from '@/hooks/useSearch';
import { UserCard } from '@/components/search/UserCard';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ActiveChips } from '@/components/search/ActiveChips';
import { SORT_OPTIONS } from '@/types/search';
import type { SortKey } from '@/types/search';

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(true);
  const {
    users,
    total,
    loading,
    loadingMore,
    error,
    filters,
    sort,
    order,
    hasMore,
    setSort,
    setOrder,
    setError,
    updateFilter,
    applyFilters,
    clearFilters,
    removeFilter,
    loadMore,
    like,
    unlike,
  } = useSearch();

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

  return (
    <div className="min-h-[100dvh] bg-background font-primary">
      <div className="w-full max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-7 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight leading-none mb-1">
              Advanced Search
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Filter, sort, and find exactly who you're looking for
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex lg:hidden items-center gap-2 bg-surface border border-border px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-text shadow-sm active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-surface text-[0.6rem] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className={showFilters ? 'block animate-fade-in-up lg:animate-none' : 'hidden lg:block'}>
            <FilterSidebar
              filters={filters}
              activeCount={activeFilterCount}
              onChange={updateFilter}
              onSubmit={handleSubmit}
              onClear={clearFilters}
            />
          </div>

          {/* Results */}
          <div>
            {/* Sort bar */}
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
                  <ChevronDown
                    className="w-3 h-3 sm:w-4 sm:h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                </div>

                <button
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center justify-center gap-1.5 bg-background border border-border px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-text hover:bg-border/50 transition-colors active:scale-95 shrink-0"
                >
                  {order === 'asc' ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}{' '}
                  <span className="hidden sm:inline">{order === 'asc' ? 'Asc' : 'Desc'}</span>
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            <ActiveChips filters={filters} onRemove={removeFilter} />

            {/* Error */}
            {error && (
              <div className="bg-error/10 text-error text-xs sm:text-sm p-3 sm:p-4 rounded-xl mb-4 border border-error/20 flex justify-between items-center animate-fade-in-up">
                <span>⚠ {error}</span>
                <button onClick={() => setError('')} className="ml-2 hover:opacity-70 p-1">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}

            {/* States */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
                <p className="text-xs sm:text-sm text-text-muted">Finding matches…</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 bg-surface rounded-3xl border border-border text-center shadow-sm animate-fade-in-up">
                <div className="mb-4 opacity-20 text-text">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-text mb-1 sm:mb-2">No profiles found</h3>
                <p className="text-xs sm:text-sm text-text-muted max-w-xs px-4">
                  Try broadening your filters — maybe lower the fame range or increase the distance.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {users.map((user) => (
                    <div key={user.id} className="animate-fade-in-up">
                      <UserCard user={user} onLike={like} onUnlike={unlike} />
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 sm:mt-10 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl border-2 border-primary text-primary font-black text-xs sm:text-sm hover:bg-primary hover:text-surface transition-all duration-200 disabled:opacity-50 active:scale-95"
                    >
                      {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                      {loadingMore ? 'Loading…' : `Load more — ${total - users.length} remaining`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
