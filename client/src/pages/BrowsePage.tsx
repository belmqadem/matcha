// src/pages/BrowsePage.tsx
import { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

import { useBrowse } from '@/hooks/useBrowse';
import { Spinner } from '@/components/ui/Spinner';
import { SkeletonCard } from '@/components/browse/SkeletonCard';
import { UserCard } from '@/components/browse/UserCard';

type TabValue = 'all' | 'liked' | 'matches';

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  // Strict separation of concerns: All API logic is abstracted to the hook
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
  } = useBrowse();

  // Pure UI filtering logic
  const displayed = users.filter((u) => {
    if (activeTab === 'liked') return u.liked_by_me;
    if (activeTab === 'matches') return u.is_connected;
    return true;
  });

  const hasMore = users.length < total;

  return (
    <div className="relative bg-background font-primary min-h-[100dvh] pb-10">
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

        {/* Tabs */}
        <div className="mb-8 sm:mb-10 flex justify-center">
          <div className="flex gap-1 bg-surface backdrop-blur-md border border-border rounded-full p-1 sm:p-1.5 w-full sm:w-fit shadow-sm">
            {(
              [
                ['all', 'All'],
                ['liked', 'Liked'],
                ['matches', 'Matches'],
              ] as [TabValue, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setActiveTab(val)}
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
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="text-center py-16 sm:py-20 px-4 sm:px-5 bg-surface backdrop-blur-sm border border-border rounded-3xl shadow-sm relative z-10 animate-fade-in-up">
            <div className="flex justify-center mb-5 sm:mb-6 text-primary opacity-40 animate-pulse">
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-current" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-text mb-2 sm:mb-3">
              {activeTab === 'matches'
                ? 'No matches yet'
                : activeTab === 'liked'
                  ? "You haven't liked anyone yet"
                  : 'No profiles found'}
            </h3>
            <p className="text-sm sm:text-base font-medium text-text-muted max-w-sm mx-auto leading-relaxed">
              Check back soon — new cuties join every day, or try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
