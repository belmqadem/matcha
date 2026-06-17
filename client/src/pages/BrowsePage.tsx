import { useState, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { useBrowse } from '@/hooks/useBrowse';
import { useBrowseFilters } from '@/hooks/useBrowseFilters';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import { SwipeStack } from '@/components/browse/SwipeStack';
import { FilterDrawer } from '@/components/browse/FilterDrawer';

export default function BrowsePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { users, resetKey, loading, hasMore, loadMore, handleLike, handleUnlike, applyFilters, clearFilters } =
    useBrowse();

  const { filters, setFilters, apply, reset, activeCount } = useBrowseFilters();
  const { openProfile } = useProfileDrawer();

  const handleApply = useCallback(() => {
    apply();
    applyFilters(filters);
  }, [apply, applyFilters, filters]);

  const handleReset = useCallback(() => {
    reset();
    clearFilters();
  }, [reset, clearFilters]);

  return (
    <div className="flex flex-col flex-1 items-center bg-transparent pt-4 px-4">
      {/* Top bar */}
      <div className="w-full max-w-sm flex items-center justify-between mb-5">
        <h1 className="text-xl font-black text-text">Discover</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted hover:text-primary hover:border-primary transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Swipe stack */}
      <div className="w-full max-w-sm">
        <SwipeStack
          users={users}
          resetKey={resetKey}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onViewProfile={openProfile}
          onLoadMore={loadMore}
          isLoading={loading}
          hasMore={hasMore}
        />
      </div>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        onApply={handleApply}
        onReset={handleReset}
      />
    </div>
  );
}
