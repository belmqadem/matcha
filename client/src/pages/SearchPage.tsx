import { useState } from 'react';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ActiveChips } from '@/components/search/ActiveChips';
import { UserCard } from '@/components/browse/UserCard';

export default function SearchPage() {
  const {
    users,
    total,
    loading,
    error,
    setError,
    filters,
    updateFilter,
    search,
    loadMore,
    removeFilter,
    clearFilters,
    hasMore,
    activeCount,
    like,
    unlike,
  } = useSearch();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(filters);
    setFiltersOpen(false);
  };

  const handleLike = async (id: string) => { await like(id); };
  const handleUnlike = async (id: string) => { await unlike(id); };

  return (
    <div className="flex flex-col flex-1 pb-12">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-text">Search</h1>
            {!loading && (
              <span className="text-xs text-text-muted">
                {total} {total === 1 ? 'profile' : 'profiles'}
              </span>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="relative md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-bold text-text-muted hover:border-primary hover:text-primary transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Filter sidebar */}
        <aside
          className={`md:w-72 shrink-0 ${filtersOpen ? 'block' : 'hidden md:block'}`}
        >
          <div className="md:sticky md:top-20">
            <FilterSidebar
              filters={filters}
              activeCount={activeCount}
              onChange={updateFilter}
              onSubmit={handleSubmit}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Active filter chips */}
          <ActiveChips filters={filters} onRemove={removeFilter} />

          {/* Error */}
          {error && (
            <div className="bg-surface border-2 border-error rounded-2xl px-4 py-3 mb-5 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-error">{error}</span>
              <button onClick={() => setError('')} className="text-error opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-text-muted">Searching…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-3xl border border-border text-center shadow-sm animate-fade-in-up">
              <p className="text-base font-black text-text mb-1">No profiles found</p>
              <p className="text-sm text-text-muted max-w-xs px-4">
                Try adjusting your filters to find more people.
              </p>
              {activeCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-2">
                {users.map((user, i) => {
                  const delayClasses = [
                    '[animation-delay:0ms]',
                    '[animation-delay:40ms]',
                    '[animation-delay:80ms]',
                    '[animation-delay:120ms]',
                    '[animation-delay:160ms]',
                    '[animation-delay:200ms]',
                    '[animation-delay:240ms]',
                    '[animation-delay:280ms]',
                  ];
                  const delay = delayClasses[Math.min(i, delayClasses.length - 1)];
                  return (
                    <div key={user.id} className={`animate-fade-in-up ${delay}`}>
                      <UserCard user={user} onLike={handleLike} onUnlike={handleUnlike} />
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-2.5 rounded-full border border-border bg-surface text-sm font-bold text-text-muted hover:border-primary hover:text-primary transition-colors active:scale-95"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
