import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, MapPin, Star, Sparkles, Circle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Photo {
  id: number;
  url: string;
}

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  birth_date?: string;
  photos?: Photo[];
  profile_picture_id?: number;
  is_online: boolean;
  last_seen?: string;
  distance_km?: number;
  location_city?: string;
  fame_rating: number;
  tags?: string[];
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
}

interface BrowseResponse {
  users: User[];
  total: number;
}

interface LikeResponse {
  connected: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

const browseApi = {
  getUsers: (params: Record<string, string | number>): Promise<BrowseResponse> => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) q.set(k, String(v));
    });
    // /api/search guarantees the liked_by_me and liked_me booleans so it survives refreshes!
    return fetch(`/api/search?${q}`, { credentials: "include" }).then(handleResponse<BrowseResponse>);
  },
  like: (id: number): Promise<LikeResponse> =>
    fetch(`/api/likes/${id}`, { method: "POST", credentials: "include" }).then(handleResponse<LikeResponse>),
  unlike: (id: number): Promise<void> =>
    fetch(`/api/likes/${id}`, { method: "DELETE", credentials: "include" }).then(handleResponse<void>),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso?: string): string {
  if (!iso) return "Offline";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function calcAge(birth_date?: string): number | null {
  if (!birth_date) return null;
  return Math.floor((Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function getPhoto(user: User): string | null {
  if (!user.photos?.length) return null;
  const main = user.photos.find((p) => p.id === user.profile_picture_id);
  return (main ?? user.photos[0])?.url ?? null;
}

// ─── Cute UI Components ───────────────────────────────────────────────────────

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 25 }).map((_, i) => {
        const size = Math.random() * 30 + 12; // Sizes from 12px to 42px
        const left = Math.random() * 100; // Spread horizontally 0% to 100%
        const duration = Math.random() * 15 + 15; // Slow, varying speeds (15s to 30s)
        const delay = -(Math.random() * 30); // NEGATIVE DELAY: Instantly scatters them everywhere on load!

        return (
          <div
            key={i}
            className="absolute text-[var(--color-primary)] drop-shadow-sm"
            style={{
              top: 0,
              left: `${left}%`,
              fontSize: `${size}px`,
              opacity: 0, // Opacity is handled entirely by the keyframe
              animation: `float-cute ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            ♥
          </div>
        );
      })}
    </div>
  );
}

function FameBadge({ rating }: { rating: number }) {
  const isHigh = rating >= 80;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold border rounded-full px-2.5 py-1 whitespace-nowrap shadow-sm backdrop-blur-sm ${isHigh ? 'text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)] border-[var(--color-border)] bg-white/80'}`}>
      <Star className="w-3 h-3 fill-current" /> {rating}
    </span>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block rounded-full border-2 animate-spin flex-shrink-0 border-transparent border-t-[var(--color-primary)]"
      style={{ width: size, height: size }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[24px] border border-[var(--color-border)] overflow-hidden shadow-sm relative z-10">
      <div className="relative w-full pb-[133%] bg-[var(--color-background)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)] via-white to-[var(--color-background)] bg-[length:200%_100%] animate-[shimmer_1.4s_infinite]" />
      </div>
      <div className="p-4">
        <div className="h-4 bg-[var(--color-background)] rounded-full w-[60%] mb-3" />
        <div className="h-3 bg-[var(--color-background)] rounded-full w-[40%]" />
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user }: { user: User }) {
  const [err, setErr] = useState(false);
  const photo = getPhoto(user);

  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={user.first_name}
        onError={() => setErr(true)}
        className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-110"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-5xl font-extrabold text-[var(--color-text-muted)] bg-[var(--color-background)] tracking-tight transition-transform duration-700 group-hover:scale-110">
      {user.first_name?.[0] ?? "?"}{user.last_name?.[0] ?? ""}
    </div>
  );
}

// ─── UserCard ─────────────────────────────────────────────────────────────────

function UserCard({ user, onLike, onUnlike }: { user: User; onLike: (id: number) => Promise<void>; onUnlike: (id: number) => Promise<void> }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const age = calcAge(user.birth_date);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try { await onLike(user.id); } finally { setBusy(false); }
  };

  const handleUnlikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try { await onUnlike(user.id); } finally { setBusy(false); }
  };

  const renderActionButton = () => {
    if (user.is_connected) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/chat/${user.id}`); }}
          className="flex-1 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_8px_20px_var(--color-primary)] hover:opacity-90 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-current" /> Say Hi
        </button>
      );
    }

    if (user.liked_by_me) {
      return (
        <button
          onClick={handleUnlikeClick}
          disabled={busy}
          className="flex-1 py-2.5 rounded-full bg-[var(--color-background)] text-[var(--color-primary)] border border-[var(--color-primary)] text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:opacity-80 active:scale-95"
        >
          {busy ? <Spinner size={14} /> : <><Heart className="w-4 h-4 fill-current" /> Liked</>}
        </button>
      );
    }

    if (user.liked_me) {
      return (
        <button
          onClick={handleLikeClick}
          disabled={busy}
          className="flex-1 py-2.5 rounded-full border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)] text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:bg-[var(--color-primary)] hover:text-white active:scale-95 shadow-sm hover:shadow-md"
        >
          {busy ? <Spinner size={14} /> : <><Heart className="w-4 h-4" /> Match</>}
        </button>
      );
    }

    return (
      <button
        onClick={handleLikeClick}
        disabled={busy}
        className="flex-1 py-2.5 rounded-full border-2 border-[var(--color-border)] bg-white text-[var(--color-text-muted)] text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-95"
      >
        {busy ? <Spinner size={14} /> : <><Heart className="w-4 h-4 transition-colors" /> Like</>}
      </button>
    );
  };

  return (
    <div
      onClick={() => navigate(`/profile/${user.id}`)}
      className="relative z-10 group bg-white rounded-[24px] overflow-hidden border border-[var(--color-border)] flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
    >
      {/* Photo Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-background)] rounded-t-[24px]">
        <Avatar user={user} />

        {/* Deep Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Online / Last Seen Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30 shadow-sm">
          <Circle className={`w-2 h-2 fill-current ${user.is_online ? "text-[var(--color-primary)]" : "text-white"}`} />
          <span className="text-[10px] text-white font-bold uppercase tracking-wider drop-shadow-md">
            {user.is_online ? "Online" : timeAgo(user.last_seen)}
          </span>
        </div>

        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {user.is_connected && (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide bg-[var(--color-primary)] text-white rounded-full px-3 py-1 shadow-md animate-pulse">
              <Sparkles className="w-3 h-3" /> MATCH
            </span>
          )}
          {!user.is_connected && user.liked_me && (
            <span className="text-[10px] font-bold tracking-wide bg-white/95 backdrop-blur-sm text-[var(--color-primary)] rounded-full px-3 py-1 shadow-sm">
              Likes you
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="m-0 text-white text-[20px] font-extrabold leading-tight truncate drop-shadow-lg">
                {user.first_name}{age !== null ? <span className="font-normal opacity-90">, {age}</span> : ""}
              </p>
              {(user.distance_km != null || user.location_city) && (
                <p className="mt-1.5 text-white/80 text-xs flex items-center gap-1.5 font-medium drop-shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  {user.distance_km != null && (
                    <span>{user.distance_km < 1 ? "< 1 km" : `${Number(user.distance_km).toFixed(1)} km`}</span>
                  )}
                  {user.distance_km != null && user.location_city && <span className="opacity-50">•</span>}
                  {user.location_city && <span className="truncate">{user.location_city}</span>}
                </p>
              )}
            </div>
            <FameBadge rating={user.fame_rating} />
          </div>
        </div>
      </div>

      {/* Tags + Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
          {(user.tags ?? []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] font-bold text-[var(--color-text-muted)] bg-[var(--color-background)] border border-[var(--color-border)] rounded-full px-2.5 py-1 transition-colors group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)]">
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
}

// ─── BrowsePage ───────────────────────────────────────────────────────────────

type TabValue = "all" | "liked" | "matches";

export default function BrowsePage() {
  const [users, setUsers]             = useState<User[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<TabValue>("all");
  const abortRef = useRef<AbortController | null>(null);

  const buildParams = useCallback((pageNum: number): Record<string, string | number> => {
    return { page: pageNum, limit: 20 };
  }, []);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setPage(1);

    browseApi.getUsers(buildParams(1))
      .then((data) => {
        if (ctrl.signal.aborted) return;

        const sanitizedUsers = (data.users ?? []).map(u => ({
          ...u,
          liked_by_me: Boolean(u.liked_by_me),
          liked_me: Boolean(u.liked_me),
          is_connected: Boolean(u.is_connected)
        }));

        setUsers(sanitizedUsers);
        setTotal(data.total ?? 0);
      })
      .catch((err: Error) => { if (!ctrl.signal.aborted) setError(err.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });

    return () => ctrl.abort();
  }, [buildParams]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const data = await browseApi.getUsers(buildParams(next));

      const sanitizedUsers = (data.users ?? []).map(u => ({
        ...u,
        liked_by_me: Boolean(u.liked_by_me),
        liked_me: Boolean(u.liked_me),
        is_connected: Boolean(u.is_connected)
      }));

      setUsers((prev) => [...prev, ...sanitizedUsers]);
      setPage(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (id: number) => {
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, liked_by_me: true, is_connected: u.liked_me } : u
    ));
    try {
      const res = await browseApi.like(id);
      setUsers((prev) => prev.map((u) =>
        u.id === id ? { ...u, liked_by_me: true, is_connected: res.connected } : u
      ));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setUsers((prev) => prev.map((u) =>
          u.id === id ? { ...u, liked_by_me: true, is_connected: u.liked_me } : u
        ));
        return;
      }
      setUsers((prev) => prev.map((u) =>
        u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u
      ));
      setError((err as Error).message);
    }
  };

  const handleUnlike = async (id: number) => {
    const original = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u
    ));
    try {
      await browseApi.unlike(id);
    } catch (err) {
      setUsers((prev) => prev.map((u) =>
        u.id === id
          ? { ...u, liked_by_me: original?.liked_by_me ?? false, is_connected: original?.is_connected ?? false }
          : u
      ));
      setError((err as Error).message);
    }
  };

  const displayed = users.filter((u) => {
    if (activeTab === "liked")   return u.liked_by_me;
    if (activeTab === "matches") return u.is_connected;
    return true;
  });

  const hasMore = users.length < total;

  return (
    <div className="relative bg-[var(--color-background)] font-[var(--font-primary)] min-h-screen pb-10">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }

        /* The Cute Swaying Heart Animation */
        @keyframes float-cute {
          0%   { transform: translateY(110vh) translateX(-15px) rotate(-15deg) scale(0.8); opacity: 0; }
          10%  { opacity: 0.25; }
          25%  { transform: translateY(75vh) translateX(20px) rotate(10deg) scale(1.1); }
          50%  { transform: translateY(40vh) translateX(-20px) rotate(-10deg) scale(0.9); }
          75%  { transform: translateY(10vh) translateX(15px) rotate(15deg) scale(1.2); }
          90%  { opacity: 0.25; }
          100% { transform: translateY(-20vh) translateX(-10px) rotate(-15deg) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* Decorative Floating Hearts */}
      <FloatingHearts />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-10">

        {/* Page title */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-[32px] font-black text-[var(--color-text)] tracking-tight mb-2 flex items-center gap-2">
            Discover People <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />
          </h1>
          <p className="text-[15px] font-medium text-[var(--color-text-muted)]">
            {loading ? "Looking for your perfect match..." : `${total} profiles waiting for you`}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-white border-2 border-[var(--color-error)] rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-3 shadow-sm">
            <span className="text-sm font-bold text-[var(--color-error)]">⚠ {error}</span>
            <button onClick={() => setError(null)} className="text-[var(--color-error)] opacity-70 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-10 flex justify-center">
          <div className="flex gap-1 bg-white backdrop-blur-md border border-[var(--color-border)] rounded-full p-1.5 w-fit shadow-sm">
            {([ ["all", "All"], ["liked", "Liked"], ["matches", "Matches"] ] as [TabValue, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setActiveTab(val)}
                className={`px-6 py-2 rounded-full border-none text-[14px] font-bold cursor-pointer transition-all duration-300 ${
                  activeTab === val
                    ? "bg-[var(--color-primary)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                    : "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid / States */}
        {loading ? (
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
              {displayed.map((user, index) => (
                <div key={user.id} style={{ animation: `fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both ${index * 0.05}s` }}>
                  <UserCard user={user} onLike={handleLike} onUnlike={handleUnlike} />
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && activeTab === "all" && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3.5 rounded-full border-2 border-[var(--color-border)] bg-white text-[var(--color-text)] text-[15px] font-black shadow-sm cursor-pointer inline-flex items-center gap-2 transition-all disabled:opacity-70 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md active:scale-95"
                >
                  {loadingMore
                    ? <><Spinner size={18} /> Loading...</>
                    : `Load More (${total - users.length} remaining)`}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-20 px-5 bg-white backdrop-blur-sm border border-[var(--color-border)] rounded-[32px] shadow-sm relative z-10">
            <div className="flex justify-center mb-6 text-[var(--color-primary)] opacity-40 animate-pulse">
              <Heart className="w-20 h-20 fill-current" />
            </div>
            <h3 className="text-2xl font-black text-[var(--color-text)] mb-3">
              {activeTab === "matches" ? "No matches yet" : activeTab === "liked" ? "You haven't liked anyone yet" : "No profiles found"}
            </h3>
            <p className="text-[15px] font-medium text-[var(--color-text-muted)] max-w-sm mx-auto leading-relaxed">
              Check back soon — new cuties join every day, or try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
