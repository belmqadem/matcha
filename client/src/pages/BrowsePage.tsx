// src/pages/BrowsePage.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, MapPin, Star, Sparkles, Circle } from "lucide-react";
import { userService } from "@/services/userService";
import type { BrowseUser } from "@/types/user";

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

function getPhoto(user: BrowseUser): string | null {
  if (!user.photos?.length) return null;
  const main = user.photos.find((p) => p.id === user.profile_picture_id);
  return (main ?? user.photos[0])?.url ?? null;
}

// ─── Cute UI Components ───────────────────────────────────────────────────────
function FameBadge({ rating }: { rating: number }) {
  const isHigh = rating >= 80;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-bold border rounded-full px-2.5 py-1 whitespace-nowrap shadow-sm backdrop-blur-sm ${isHigh ? 'text-primary border-primary bg-primary/10' : 'text-text-muted border-border bg-white/80'}`}>
      <Star className="w-3 h-3 fill-current" /> {rating}
    </span>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block rounded-full border-2 animate-spin flex-shrink-0 border-transparent border-t-primary"
      style={{ width: size, height: size }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm relative z-10">
      <div className="relative w-full pb-[133%] bg-background">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-white to-background bg-[length:200%_100%] animate-pulse" />
      </div>
      <div className="p-4">
        <div className="h-4 bg-background rounded-full w-[60%] mb-3" />
        <div className="h-3 bg-background rounded-full w-[40%]" />
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user }: { user: BrowseUser }) {
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
    <div className="w-full h-full flex items-center justify-center text-5xl font-extrabold text-text-muted bg-background tracking-tight transition-transform duration-700 group-hover:scale-110">
      {user.first_name?.[0] ?? "?"}{user.last_name?.[0] ?? ""}
    </div>
  );
}

// ─── UserCard ─────────────────────────────────────────────────────────────────
function UserCard({ user, onLike, onUnlike }: { user: BrowseUser; onLike: (id: number) => Promise<void>; onUnlike: (id: number) => Promise<void> }) {
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
        <button onClick={(e) => { e.stopPropagation(); navigate(`/chat/${user.id}`); }} className="flex-1 py-2.5 rounded-full bg-primary text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_8px_20px_var(--color-primary)] hover:opacity-90 active:scale-95">
          <MessageCircle className="w-4 h-4 fill-current" /> Say Hi
        </button>
      );
    }
    if (user.liked_by_me) {
      return (
        <button onClick={handleUnlikeClick} disabled={busy} className="flex-1 py-2.5 rounded-full bg-background text-primary border border-primary text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:opacity-80 active:scale-95">
          {busy ? <Spinner size={14} /> : <><Heart className="w-4 h-4 fill-current" /> Liked</>}
        </button>
      );
    }
    if (user.liked_me) {
      return (
        <button onClick={handleLikeClick} disabled={busy} className="flex-1 py-2.5 rounded-full border-2 border-primary bg-white text-primary text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:bg-primary hover:text-white active:scale-95 shadow-sm hover:shadow-md">
          {busy ? <Spinner size={14} /> : <><Heart className="w-4 h-4" /> Match</>}
        </button>
      );
    }
    return (
      <button onClick={handleLikeClick} disabled={busy} className="flex-1 py-2.5 rounded-full border-2 border-border bg-white text-text-muted text-[13px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:border-primary hover:text-primary active:scale-95">
        {busy ? <Spinner size={14} /> : <><Heart className="w-4 h-4 transition-colors" /> Like</>}
      </button>
    );
  };

  return (
    <div onClick={() => navigate(`/profile/${user.id}`)} className="relative z-10 group bg-white rounded-3xl overflow-hidden border border-border flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative aspect-[3/4] overflow-hidden bg-background rounded-t-3xl">
        <Avatar user={user} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30 shadow-sm">
          <Circle className={`w-2 h-2 fill-current ${user.is_online ? "text-primary" : "text-white"}`} />
          <span className="text-[10px] text-white font-bold uppercase tracking-wider drop-shadow-md">
            {user.is_online ? "Online" : timeAgo(user.last_seen)}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {user.is_connected && (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide bg-primary text-white rounded-full px-3 py-1 shadow-md animate-pulse">
              <Sparkles className="w-3 h-3" /> MATCH
            </span>
          )}
          {!user.is_connected && user.liked_me && (
            <span className="text-[10px] font-bold tracking-wide bg-white/95 backdrop-blur-sm text-primary rounded-full px-3 py-1 shadow-sm">
              Likes you
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="m-0 text-white text-xl font-extrabold leading-tight truncate drop-shadow-lg">
                {user.first_name}{age !== null ? <span className="font-normal opacity-90">, {age}</span> : ""}
              </p>
              {(user.distance_km != null || user.location_city) && (
                <p className="mt-1.5 text-white/80 text-xs flex items-center gap-1.5 font-medium drop-shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {user.distance_km != null && <span>{user.distance_km < 1 ? "< 1 km" : `${Number(user.distance_km).toFixed(1)} km`}</span>}
                  {user.distance_km != null && user.location_city && <span className="opacity-50">•</span>}
                  {user.location_city && <span className="truncate">{user.location_city}</span>}
                </p>
              )}
            </div>
            <FameBadge rating={user.fame_rating} />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
          {(user.tags ?? []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11px] font-bold text-text-muted bg-background border border-border rounded-full px-2.5 py-1 transition-colors group-hover:border-primary group-hover:text-primary">
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
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const abortRef = useRef<AbortController | null>(null);

  const buildParams = useCallback((pageNum: number): Record<string, string | number> => {
    return { page: pageNum, limit: 20 };
  }, []);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError(null); setPage(1);

    userService.searchUsers(buildParams(1))
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
      const data = await userService.searchUsers(buildParams(next));
      const sanitizedUsers = (data.users ?? []).map(u => ({ ...u, liked_by_me: Boolean(u.liked_by_me), liked_me: Boolean(u.liked_me), is_connected: Boolean(u.is_connected) }));
      setUsers((prev) => [...prev, ...sanitizedUsers]);
      setPage(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: true, is_connected: u.liked_me } : u));
    try {
      const res = await userService.like(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: true, is_connected: res.connected } : u));
    } catch (err) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u));
      setError((err as Error).message);
    }
  };

  const handleUnlike = async (id: number) => {
    const original = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u));
    try {
      await userService.unlike(id);
    } catch (err) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: original?.liked_by_me ?? false, is_connected: original?.is_connected ?? false } : u));
      setError((err as Error).message);
    }
  };

  const displayed = users.filter((u) => {
    if (activeTab === "liked") return u.liked_by_me;
    if (activeTab === "matches") return u.is_connected;
    return true;
  });

  const hasMore = users.length < total;

  return (
    <div className="relative bg-background font-primary min-h-screen pb-10">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-black text-text tracking-tight mb-2 flex items-center gap-2">
            Discover People <Sparkles className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-sm font-medium text-text-muted">
            {loading ? "Looking for your perfect match..." : `${total} profiles waiting for you`}
          </p>
        </div>

        {error && (
          <div className="bg-white border-2 border-error rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-3 shadow-sm">
            <span className="text-sm font-bold text-error">⚠ {error}</span>
            <button onClick={() => setError(null)} className="text-error opacity-70 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}

        <div className="mb-10 flex justify-center">
          <div className="flex gap-1 bg-white backdrop-blur-md border border-border rounded-full p-1.5 w-fit shadow-sm">
            {([ ["all", "All"], ["liked", "Liked"], ["matches", "Matches"] ] as [TabValue, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setActiveTab(val)}
                className={`px-6 py-2 rounded-full border-none text-sm font-bold cursor-pointer transition-all duration-300 ${
                  activeTab === val ? "bg-primary text-white shadow-md" : "bg-transparent text-text-muted hover:bg-background hover:text-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayed.map((user, index) => (
                <div key={user.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <UserCard user={user} onLike={handleLike} onUnlike={handleUnlike} />
                </div>
              ))}
            </div>

            {hasMore && activeTab === "all" && (
              <div className="text-center mt-12">
                <button onClick={loadMore} disabled={loadingMore} className="px-8 py-3.5 rounded-full border-2 border-border bg-white text-text text-[15px] font-black shadow-sm cursor-pointer inline-flex items-center gap-2 transition-all disabled:opacity-70 hover:border-primary hover:text-primary hover:shadow-md active:scale-95">
                  {loadingMore ? <><Spinner size={18} /> Loading...</> : `Load More (${total - users.length} remaining)`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 px-5 bg-white backdrop-blur-sm border border-border rounded-[32px] shadow-sm relative z-10">
            <div className="flex justify-center mb-6 text-primary opacity-40 animate-pulse">
              <Heart className="w-20 h-20 fill-current" />
            </div>
            <h3 className="text-2xl font-black text-text mb-3">
              {activeTab === "matches" ? "No matches yet" : activeTab === "liked" ? "You haven't liked anyone yet" : "No profiles found"}
            </h3>
            <p className="text-[15px] font-medium text-text-muted max-w-sm mx-auto leading-relaxed">
              Check back soon — new cuties join every day, or try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
