// src/pages/VisitorsPage.tsx
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, ArrowLeft } from 'lucide-react';
import { useVisitors } from '@/hooks/useVisitors';
import { VisitorCard } from '@/components/visitors/VisitorCard';
import { VisitorStats } from '@/components/visitors/VisitorStats';

export default function VisitorsPage() {
  const navigate = useNavigate();
  const { visitors, sorted, loading, error, sort, setSort } = useVisitors();

  return (
    <div className="min-h-[100dvh] bg-background font-primary pb-10">
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-border bg-surface flex items-center justify-center text-text-muted hover:bg-background transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text leading-none">
                Profile visitors
              </h1>
              {!loading && (
                <p className="text-xs sm:text-sm text-text-muted mt-1 sm:mt-1.5">
                  {visitors.length} {visitors.length === 1 ? 'person' : 'people'} visited your
                  profile
                </p>
              )}
            </div>
          </div>

          {/* Sort toggle */}
          {visitors.length > 0 && (
            <div className="hidden sm:flex gap-1.5 bg-surface rounded-xl border border-border p-1 shadow-sm">
              {(['recent', 'oldest'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    sort === s ? 'bg-primary text-surface' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center py-16 text-sm sm:text-base text-text-muted bg-surface rounded-3xl border border-border shadow-sm animate-fade-in-up">
            {error}
          </p>
        ) : visitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 sm:gap-4 animate-fade-in-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50" />
            </div>
            <p className="text-base sm:text-lg font-black text-text">No visitors yet</p>
            <p className="text-sm sm:text-base text-text-muted text-center max-w-xs leading-relaxed">
              People who visit your profile will appear here. Complete your profile to attract more
              visitors!
            </p>
          </div>
        ) : (
          <>
            <div className="animate-fade-in-up">
              <VisitorStats visitors={visitors} />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-5 mt-4 sm:mt-6">
              {sorted.map((visitor, i) => {
                const delayClasses = [
                  '[animation-delay:0ms]',
                  '[animation-delay:50ms]',
                  '[animation-delay:100ms]',
                  '[animation-delay:150ms]',
                  '[animation-delay:200ms]',
                  '[animation-delay:250ms]',
                  '[animation-delay:300ms]',
                  '[animation-delay:350ms]',
                  '[animation-delay:400ms]',
                  '[animation-delay:450ms]',
                ];
                const delayClass = delayClasses[Math.min(i, delayClasses.length - 1)];
                return (
                  <div key={visitor.id} className={`animate-fade-in-up ${delayClass}`}>
                    <VisitorCard visitor={visitor} index={i} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
