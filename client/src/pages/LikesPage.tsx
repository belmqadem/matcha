import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, ArrowLeft, Clock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Liker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  liked_at: string;
  // If your backend ever adds this, you can uncomment the badge code below!
  // is_connected?: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function handleResponse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body;
}

const api = {
  getLikedBy: () =>
    fetch('/api/profile/me/liked-by', { credentials: 'include' })
      .then(handleResponse)
      .then((d) => d.likers as Liker[]),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const COLORS = [
  '#e94057', '#f97316', '#8b5cf6', '#06b6d4',
  '#10b981', '#f59e0b', '#ec4899', '#6366f1',
];

function colorFor(id: number | string) {
  const n = typeof id === 'string' ? parseInt(id, 16) || 0 : id;
  return COLORS[n % COLORS.length];
}

// ─── Like Card ────────────────────────────────────────────────────────────────

function LikeCard({ user, onClick }: { user: Liker; onClick: () => void }) {
  const color = colorFor(user.id);
  const initials = `${user.first_name[0]}${(user.last_name?.[0] ?? '')}`.toUpperCase();

  // Change to `user.is_connected` if your backend adds that field later
  const isMutual = false;

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
        isMutual ? 'border-[1.5px] border-[#e94057]' : 'border border-gray-100'
      }`}
    >
      {/* Photo */}
      <div className="relative h-[200px] bg-gray-100 shrink-0">
        {user.profile_picture_url ? (
          <img
            src={user.profile_picture_url}
            alt={user.first_name}
            className="w-full h-full object-cover block"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <span className="text-4xl font-extrabold" style={{ color }}>
              {initials}
            </span>
          </div>
        )}

        {/* Time badge */}
        <span className="absolute bottom-2.5 right-2.5 bg-black/55 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Clock size={9} /> {timeAgo(user.liked_at)}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="text-[13px] font-bold text-gray-900 mb-0.5">
          {user.first_name} {user.last_name}
        </p>
        <p className="text-[11px] text-gray-400 mb-1.5">@{user.username}</p>
        <p className="text-[10px] text-gray-300 flex items-center gap-1">
          <Clock size={9} /> {formatDate(user.liked_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 gap-3.5">
      <div className="w-[72px] h-[72px] rounded-full bg-[#e94057]/10 flex items-center justify-center">
        <Heart size={28} className="text-[#e94057] opacity-50" />
      </div>
      <p className="text-base font-bold text-gray-800">No likes yet</p>
      <p className="text-[13px] text-gray-400 text-center max-w-[260px] leading-relaxed">
        Complete your profile and start browsing to attract likes!
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LikesPage() {
  const navigate = useNavigate();
  const [likedBy, setLikedBy] = useState<Liker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');

  useEffect(() => {
    // Only fetch what we actually have!
    api.getLikedBy()
      .then((likers) => setLikedBy(likers ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load likes.'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...likedBy].sort((a, b) => {
    const ta = new Date(a.liked_at).getTime();
    const tb = new Date(b.liked_at).getTime();
    return sort === 'recent' ? tb - ta : ta - tb;
  });

  return (
    <div className="min-h-screen bg-[#f7f4f4] font-['DM_Sans','Helvetica_Neue',sans-serif]">
      <div className="max-w-[1100px] mx-auto py-7 px-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full border-[1.5px] border-gray-200 bg-white flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-none">
                People who like you
              </h1>
              {!loading && (
                <p className="text-xs text-gray-400 mt-1">
                  {likedBy.length} {likedBy.length === 1 ? 'person likes' : 'people like'} your profile
                </p>
              )}
            </div>
          </div>

          {/* Sort control */}
          {likedBy.length > 0 && (
            <div className="flex gap-1.5 bg-white rounded-xl border border-gray-100 p-1">
              {(['recent', 'oldest'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    sort === s
                      ? 'bg-[#e94057] text-white'
                      : 'bg-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="text-[#e94057] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-400 text-[13px] bg-white rounded-2xl border border-gray-100">
            {error}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {sorted.map((user) => (
              <LikeCard
                key={user.id}
                user={user}
                onClick={() => navigate(`/profile/${user.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
