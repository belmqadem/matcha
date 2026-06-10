import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, ArrowLeft } from 'lucide-react';
import { useVisitors } from '@/hooks/useVisitors';
import { VisitorCard } from '@/components/visitors/VisitorCard';
import { VisitorStats } from '@/components/visitors/VisitorStats';

export default function VisitorsPage() {
  const navigate = useNavigate();
  const { visitors, sorted, loading, error, sort, setSort } = useVisitors();

  return (
    <div className="min-h-screen bg-background font-primary">
      <div className="max-w-[1100px] mx-auto py-7 px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-text-muted hover:bg-background transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-black text-text leading-none">Profile visitors</h1>
              {!loading && (
                <p className="text-xs text-text-muted mt-0.5">
                  {visitors.length} {visitors.length === 1 ? 'person' : 'people'} visited your
                  profile
                </p>
              )}
            </div>
          </div>

          {/* Sort toggle */}
          {visitors.length > 0 && (
            <div className="flex gap-1.5 bg-white rounded-xl border border-border p-1">
              {(['recent', 'oldest'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    sort === s
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text'
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
            <Loader2 size={28} className="text-primary animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center py-16 text-sm text-text-muted">{error}</p>
        ) : visitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3.5">
            <div className="w-18 h-18 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye size={28} className="text-primary opacity-50" />
            </div>
            <p className="text-base font-black text-text">No visitors yet</p>
            <p className="text-sm text-text-muted text-center max-w-[260px] leading-relaxed">
              People who visit your profile will appear here. Complete your profile to attract more
              visitors!
            </p>
          </div>
        ) : (
          <>
            <VisitorStats visitors={visitors} />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {sorted.map((visitor, i) => (
                <VisitorCard key={visitor.id} visitor={visitor} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
