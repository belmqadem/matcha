import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
    return fetch(`/api/browse?${q}`, { credentials: "include" }).then(handleResponse<BrowseResponse>);
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

// ─── Atoms ────────────────────────────────────────────────────────────────────

function FameBadge({ rating }: { rating: number }) {
  const colorClass =
    rating >= 80 ? "text-rose-500 bg-rose-50 border-rose-200" :
    rating >= 55 ? "text-amber-500 bg-amber-50 border-amber-200" :
                   "text-gray-400 bg-gray-50 border-gray-200";

  return (
    <span className={`text-[11px] font-bold border rounded-full px-2 py-0.5 whitespace-nowrap ${colorClass}`}>
      ★ {rating}
    </span>
  );
}

function Spinner({ size = 16, white = false }: { size?: number; white?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border-2 animate-spin flex-shrink-0 ${white ? "border-white/30 border-t-white" : "border-rose-200 border-t-rose-500"}`}
      style={{ width: size, height: size }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="relative w-full pb-[133%] bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.4s_infinite]" />
      </div>
      <div className="p-3">
        <div className="h-3.5 bg-gray-100 rounded-md w-[55%] mb-2" />
        <div className="h-2.5 bg-gray-100 rounded-md w-[35%]" />
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
        className="w-full h-full object-cover block"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300 bg-gray-100 tracking-[-1px]">
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
          className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
        >
          💬 Chat
        </button>
      );
    }

    if (user.liked_by_me) {
      return (
        <button
          onClick={handleUnlikeClick}
          disabled={busy}
          className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-70 hover:opacity-90"
        >
          {busy ? <Spinner white size={14} /> : "♥ Liked"}
        </button>
      );
    }

    if (user.liked_me) {
      return (
        <button
          onClick={handleLikeClick}
          disabled={busy}
          className="flex-1 py-2 rounded-xl border-[1.5px] border-rose-500 bg-rose-50 text-rose-500 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-70 hover:bg-rose-500 hover:text-white"
        >
          {busy ? <Spinner size={14} /> : "♥ Like back"}
        </button>
      );
    }

    return (
      <button
        onClick={handleLikeClick}
        disabled={busy}
        className="flex-1 py-2 rounded-xl border-[1.5px] border-rose-500 bg-transparent text-rose-500 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-70 hover:bg-rose-500 hover:text-white"
      >
        {busy ? <Spinner size={14} /> : "♡ Like"}
      </button>
    );
  };

  return (
    <div
      onClick={() => navigate(`/profile/${user.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(233,64,87,0.10)]"
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Avatar user={user} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,26,46,0.82)] via-[rgba(26,26,46,0.06)] to-transparent pointer-events-none" />

        {/* Online indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full border-2 border-white flex-shrink-0 ${user.is_online ? "bg-green-500" : "bg-gray-400"}`} />
          <span className="text-[11px] text-white font-medium drop-shadow-sm">
            {user.is_online ? "Online" : timeAgo(user.last_seen)}
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
          {user.is_connected && (
            <span className="text-[10px] font-bold tracking-wide bg-rose-500 text-white rounded-full px-2.5 py-0.5">
              MATCH
            </span>
          )}
          {!user.is_connected && user.liked_me && (
            <span className="text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/35 rounded-full px-2.5 py-0.5">
              Likes you
            </span>
          )}
        </div>

        {/* Name / location */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="m-0 text-white text-[17px] font-bold leading-tight truncate">
                {user.first_name}{age !== null ? `, ${age}` : ""}
              </p>
              {(user.distance_km != null || user.location_city) && (
                <p className="mt-1 text-white/70 text-xs flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {user.distance_km != null && (
                    <span>{user.distance_km < 1 ? "< 1 km" : `${Number(user.distance_km).toFixed(1)} km`}</span>
                  )}
                  {user.distance_km != null && user.location_city && <span>·</span>}
                  {user.location_city && <span className="truncate">{user.location_city}</span>}
                </p>
              )}
            </div>
            <FameBadge rating={user.fame_rating} />
          </div>
        </div>
      </div>

      {/* Tags + actions */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
        <div className="flex flex-wrap gap-1.5 min-h-[22px]">
          {(user.tags ?? []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
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
        setUsers(data.users ?? []);
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
      setUsers((prev) => [...prev, ...(data.users ?? [])]);
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
    <div className="bg-gray-50 font-['Fraunces',serif] min-h-full">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-6 py-7">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-1">Discover people</h1>
          <p className="text-sm text-gray-400">
            {loading ? "Loading…" : `${total} profiles match your preferences`}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-3">
            <span className="text-[13px] text-red-600">⚠ {error}</span>
            <button onClick={() => setError(null)} className="text-red-600 bg-transparent border-none cursor-pointer text-base leading-none p-0 font-[inherit]">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-5">
          <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
            {([ ["all", "All"], ["liked", "Liked"], ["matches", "Matches"] ] as [TabValue, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setActiveTab(val)}
                className={`px-4 py-1.5 rounded-lg border-none text-[13px] font-[inherit] cursor-pointer transition-all ${
                  activeTab === val
                    ? "bg-rose-500 text-white font-semibold"
                    : "bg-transparent text-gray-500 font-normal hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid / States */}
        {loading ? (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {displayed.map((user) => (
                <div key={user.id} style={{ animation: "fadeUp 0.25s ease both" }}>
                  <UserCard user={user} onLike={handleLike} onUnlike={handleUnlike} />
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && activeTab === "all" && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-9 py-2.5 rounded-xl border-[1.5px] border-rose-500 bg-transparent text-rose-500 text-sm font-semibold font-[inherit] cursor-pointer inline-flex items-center gap-2 transition-all disabled:opacity-70 hover:bg-rose-500 hover:text-white"
                >
                  {loadingMore
                    ? <><Spinner size={14} /> Loading…</>
                    : `Load more · ${total - users.length} remaining`}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-[72px] px-5">
            <div className="text-4xl mb-4 opacity-20">✦</div>
            <p className="text-lg font-bold text-gray-900 mb-2">
              {activeTab === "matches" ? "No matches yet" : activeTab === "liked" ? "You haven't liked anyone yet" : "No profiles found"}
            </p>
            <p className="text-sm text-gray-400 mb-5">
              Check back soon — new people join every day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
