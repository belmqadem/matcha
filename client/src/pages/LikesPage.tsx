import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, ArrowLeft } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { LikerCard } from '@/components/likes/LikerCard';

export default function LikesPage() {
  const navigate = useNavigate();
  const { likedBy, sorted, loading, error, sort, setSort } = useLikes();

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
              <h1 className="text-xl font-black text-text leading-none">People who like you</h1>
              {!loading && (
                <p className="text-xs text-text-muted mt-1">
                  {likedBy.length} {likedBy.length === 1 ? 'person likes' : 'people like'} your
                  profile
                </p>
              )}
            </div>
          </div>

          {/* Sort toggle */}
          {likedBy.length > 0 && (
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
          <div className="text-center py-16 text-sm text-text-muted bg-white rounded-2xl border border-border">
            {error}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3.5">
            <div className="w-[72px] h-[72px] rounded-full bg-primary/10 flex items-center justify-center">
              <Heart size={28} className="text-primary opacity-50" />
            </div>
            <p className="text-base font-black text-text">No likes yet</p>
            <p className="text-sm text-text-muted text-center max-w-[260px] leading-relaxed">
              Complete your profile and start browsing to attract likes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {sorted.map((liker, i) => (
              <LikerCard key={liker.id} liker={liker} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
