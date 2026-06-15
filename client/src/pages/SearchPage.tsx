import { Loader2, Search, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { UserCard } from '@/components/browse/UserCard';

export default function SearchPage() {
  const {
    users,
    total,
    loading,
    error,
    setError,
    q,
    setQ,
    like,
    unlike,
  } = useSearch();

  const handleLike = async (id: string) => {
    await like(id);
  };

  const handleUnlike = async (id: string) => {
    await unlike(id);
  };

  return (
    <div className="min-h-[100dvh] bg-background font-primary pb-12">
      <div className="w-full max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight mb-2 flex items-center gap-2">
            Search People <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </h1>
          <p className="text-xs sm:text-sm font-medium text-text-muted">
            Find matches instantly by their name or username
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative flex items-center bg-surface border border-border rounded-full px-5 py-3.5 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
            <Search className="w-5 h-5 text-text-muted shrink-0 mr-3" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type a name or username..."
              className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-text placeholder-text-muted font-medium"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="p-1 rounded-full text-text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="max-w-xl mx-auto bg-surface border-2 border-error rounded-2xl px-4 py-3 mb-6 flex items-center justify-between gap-3 shadow-sm animate-fade-in-up">
            <span className="text-xs sm:text-sm font-bold text-error">{error}</span>
            <button
              onClick={() => setError('')}
              className="text-error opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
            <p className="text-xs sm:text-sm text-text-muted">Loading profiles…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 bg-surface rounded-3xl border border-border text-center shadow-sm max-w-2xl mx-auto animate-fade-in-up">
            <div className="mb-4 opacity-25 text-text">
              <Search className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-text mb-1 sm:mb-2">
              No profiles found
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-xs px-4">
              Try searching for a different name or username!
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-xs sm:text-sm text-text-muted font-medium">
                Showing <span className="font-black text-text">{total}</span> matching profiles
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {users.map((user) => (
                <div key={user.id} className="animate-fade-in-up">
                  <UserCard user={user} onLike={handleLike} onUnlike={handleUnlike} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
