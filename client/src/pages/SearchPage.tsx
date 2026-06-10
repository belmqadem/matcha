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
    <div className="min-h-screen bg-background font-primary">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-7 gap-4">
          <div>
            <h1 className="text-3xl font-black text-text tracking-tight leading-none mb-1">
              Advanced Search
            </h1>
            <p className="text-sm text-text-muted">
              Filter, sort, and find exactly who you're looking for
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex lg:hidden items-center gap-2 bg-white border border-border px-4 py-2.5 rounded-xl text-sm font-bold text-text shadow-sm"
          >
            <SlidersHorizontal size={15} /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className={showFilters ? 'block' : 'hidden lg:block'}>
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
            <div className="bg-white border border-border rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-4 shadow-sm">
              <p className="text-sm text-text-muted font-medium">
                {loading ? (
                  'Searching…'
                ) : (
                  <>
                    <span className="font-black text-text">{total}</span> profiles found
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="appearance-none bg-background border border-border text-text text-sm font-semibold rounded-xl pl-3 pr-8 py-2 outline-none cursor-pointer focus:border-primary transition-colors"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                  />
                </div>
                <button
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1.5 bg-background border border-border px-3 py-2 rounded-xl text-sm font-bold text-text hover:bg-border/50 transition-colors"
                >
                  {order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{' '}
                  {order === 'asc' ? 'Asc' : 'Desc'}
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            <ActiveChips filters={filters} onRemove={removeFilter} />

            {/* Error */}
            {error && (
              <div className="bg-error/10 text-error text-sm p-4 rounded-xl mb-4 border border-error/20 flex justify-between items-center">
                <span>⚠ {error}</span>
                <button onClick={() => setError('')} className="ml-2 hover:opacity-70">
                  <X size={15} />
                </button>
              </div>
            )}

            {/* States */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-sm text-text-muted">Finding matches…</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-border text-center">
                <div className="text-5xl mb-4 opacity-20">
                  <Search size={48} />
                </div>
                <h3 className="text-lg font-black text-text mb-1">No profiles found</h3>
                <p className="text-sm text-text-muted max-w-xs">
                  Try broadening your filters — maybe lower the fame range or increase the distance.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} onLike={like} onUnlike={unlike} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-primary text-primary font-black text-sm hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50"
                    >
                      {loadingMore && <Loader2 size={15} className="animate-spin" />}
                      {loadingMore ? 'Loading…' : `Load more · ${total - users.length} remaining`}
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
