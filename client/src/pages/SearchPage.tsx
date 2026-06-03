import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, Search, SlidersHorizontal, MapPin, X,
  Heart, Eye, Flame, Tag, ArrowUpDown, ChevronDown, ChevronUp,
  Star, Wifi, WifiOff
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrowseUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  fame_rating: number;
  location_city?: string;
  is_online: boolean;
  last_seen: string;
  profile_picture_id?: number;
  birth_date?: string;
  distance_km?: number;
  tags?: string[];
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
}

interface SearchFilters {
  age_min: string;
  age_max: string;
  fame_min: string;
  fame_max: string;
  location_mode: 'km' | 'city';
  max_km: string;
  city: string;
  tags: string;
}

type SortKey = 'fame' | 'age' | 'distance' | 'tags';
type OrderKey = 'asc' | 'desc';

const DEFAULT_FILTERS: SearchFilters = {
  age_min: '',
  age_max: '',
  fame_min: '',
  fame_max: '',
  location_mode: 'km',
  max_km: '',
  city: '',
  tags: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAge(birth_date?: string): number | null {
  if (!birth_date) return null;
  const diff = Date.now() - new Date(birth_date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function getPhotoUrl(user: BrowseUser): string {
  // If the backend provides the photos array, find the main photo's URL
  if (user.photos && user.photos.length > 0) {
    const main = user.photos.find((p) => p.id === user.profile_picture_id);
    return (main ?? user.photos[0]).url;
  }

  return '';
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function handleResponse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body;
}

const api = {
  searchUsers: (params: Record<string, string | number>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) q.set(k, String(v));
    });
    return fetch(`/api/search?${q.toString()}`, { credentials: 'include' }).then(handleResponse);
  },
  like: (id: number) =>
    fetch(`/api/likes/${id}`, { method: 'POST', credentials: 'include' }).then(handleResponse),
  unlike: (id: number) =>
    fetch(`/api/likes/${id}`, { method: 'DELETE', credentials: 'include' }).then(handleResponse),
};

// ─── UserCard ─────────────────────────────────────────────────────────────────

interface UserCardProps {
  user: BrowseUser;
  onLike: (id: number) => Promise<void>;
  onUnlike: (id: number) => Promise<void>;
}

function UserCard({ user, onLike, onUnlike }: UserCardProps) {
  const [liked, setLiked] = useState(user.liked_by_me);
  const [connected, setConnected] = useState(user.is_connected);
  const [loading, setLoading] = useState(false);
  const age = getAge(user.birth_date);
  const photoUrl = getPhotoUrl(user);
  const initials = getInitials(user.first_name, user.last_name);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await onUnlike(user.id);
        setLiked(false);
        setConnected(false);
      } else {
        const res = await onLike(user.id);
        setLiked(true);
        if (res?.connected) setConnected(true);
      }
    } catch {
      // silent fail — could toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      href={`/profile/${user.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Photo */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-rose-100 to-pink-50 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={user.first_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-black text-rose-300 select-none">{initials}</span>
          </div>
        )}

        {/* Online badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
          user.is_online
            ? 'bg-emerald-500/90 text-white'
            : 'bg-black/40 text-white/80'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.is_online ? 'bg-white' : 'bg-white/50'}`} />
          {user.is_online ? 'Online' : 'Offline'}
        </div>

        {/* Match badge */}
        {connected && (
          <div className="absolute top-3 right-3 bg-[#e94057]/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            ✦ MATCH
          </div>
        )}

        {/* Like button */}
        <button
          onClick={handleLikeToggle}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 backdrop-blur-sm ${
            liked
              ? 'bg-[#e94057] text-white scale-110'
              : 'bg-white/90 text-gray-400 hover:text-[#e94057] hover:scale-110'
          }`}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          )}
        </button>

        {/* Liked me indicator */}
        {user.liked_me && !connected && (
          <div className="absolute bottom-3 left-3 bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-200">
            Likes you ♥
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {user.first_name}{age ? `, ${age}` : ''}
            </p>
            <p className="text-[11px] text-gray-400">@{user.username}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Flame size={11} className="text-amber-400" />
            <span className="text-[11px] font-bold text-amber-500">{Math.round(user.fame_rating)}</span>
          </div>
        </div>

        {/* Location + Distance */}
        {(user.location_city || user.distance_km != null) && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <MapPin size={10} />
            <span className="truncate">
              {user.location_city ?? ''}
              {user.distance_km != null ? ` · ${Math.round(user.distance_km)} km` : ''}
            </span>
          </div>
        )}

        {/* Tags */}
        {user.tags && user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {user.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-full font-medium border border-rose-100">
                #{tag}
              </span>
            ))}
            {user.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{user.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  activeCount: number;
}

function FilterSidebar({ filters, onChange, onSubmit, onClear, activeCount }: FilterSidebarProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-gray-800 tracking-tight">Filters</h2>
        {activeCount > 0 && (
          <span className="bg-[#e94057] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </div>

      {/* Age Range */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
          <Eye size={10} /> Age Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number" placeholder="18" min={18} max={120}
            value={filters.age_min}
            onChange={(e) => onChange('age_min', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#e94057] focus:ring-1 focus:ring-[#e94057]/20 transition-all"
          />
          <span className="text-gray-300 text-sm">–</span>
          <input
            type="number" placeholder="99" min={18} max={120}
            value={filters.age_max}
            onChange={(e) => onChange('age_max', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#e94057] focus:ring-1 focus:ring-[#e94057]/20 transition-all"
          />
        </div>
      </div>

      {/* Fame Rating */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
          <Flame size={10} /> Fame Rating
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number" placeholder="0" min={0} max={100}
            value={filters.fame_min}
            onChange={(e) => onChange('fame_min', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#e94057] focus:ring-1 focus:ring-[#e94057]/20 transition-all"
          />
          <span className="text-gray-300 text-sm">–</span>
          <input
            type="number" placeholder="100" min={0} max={100}
            value={filters.fame_max}
            onChange={(e) => onChange('fame_max', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#e94057] focus:ring-1 focus:ring-[#e94057]/20 transition-all"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
          <MapPin size={10} /> Location
        </label>

        {/* Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-2.5 gap-1">
          {(['km', 'city'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange('location_mode', mode)}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                filters.location_mode === mode
                  ? 'bg-white shadow text-[#e94057]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode === 'km' ? '📍 Distance' : '🏙 City'}
            </button>
          ))}
        </div>

        {filters.location_mode === 'km' ? (
          <div className="relative">
            <input
              type="number" placeholder="Max km away" min={1}
              value={filters.max_km}
              onChange={(e) => onChange('max_km', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#e94057] focus:ring-1 focus:ring-[#e94057]/20 transition-all"
            />
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        ) : (
          <input
            type="text" placeholder="e.g. Paris, Berlin…"
            value={filters.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#e94057] focus:ring-1 focus:ring-[#e94057]/20 transition-all"
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
          <Tag size={10} /> Interests
        </label>
        <input
          type="text" placeholder="vegan, hiking, art…"
          value={filters.tags}
          onChange={(e) => onChange('tags', e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#e94057] focus:ring-1 focus:ring-[#e94057]/20 transition-all"
        />
        <p className="text-[10px] text-gray-400 mt-1">Comma-separated. # optional.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClear}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
        <button
          type="submit"
          className="flex-[2] py-2.5 rounded-xl bg-[#e94057] text-white text-sm font-black hover:bg-[#d6364a] transition-colors flex items-center justify-center gap-2 shadow-md shadow-rose-200"
        >
          <Search size={14} /> Search
        </button>
      </div>
    </form>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────

function ActiveChips({
  filters,
  sort,
  order,
  onRemoveFilter,
}: {
  filters: SearchFilters;
  sort: SortKey;
  order: OrderKey;
  onRemoveFilter: (key: keyof SearchFilters | 'location') => void;
}) {
  const chips: { label: string; key: keyof SearchFilters | 'location' }[] = [];

  if (filters.age_min || filters.age_max)
    chips.push({ label: `Age: ${filters.age_min || '18'}–${filters.age_max || '∞'}`, key: 'age_min' });
  if (filters.fame_min || filters.fame_max)
    chips.push({ label: `Fame: ${filters.fame_min || '0'}–${filters.fame_max || '100'}`, key: 'fame_min' });
  if (filters.location_mode === 'km' && filters.max_km)
    chips.push({ label: `≤ ${filters.max_km} km`, key: 'location' });
  if (filters.location_mode === 'city' && filters.city)
    chips.push({ label: `📍 ${filters.city}`, key: 'location' });
  if (filters.tags)
    chips.push({ label: `#${filters.tags.replace(/,\s*/g, ' #')}`, key: 'tags' });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-semibold px-3 py-1 rounded-full"
        >
          {chip.label}
          <button
            onClick={() => onRemoveFilter(chip.key)}
            className="text-rose-400 hover:text-rose-700 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('fame');
  const [order, setOrder] = useState<OrderKey>('desc');
  const [showFilters, setShowFilters] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  // Count active filters for badge
  const activeFilterCount = [
    filters.age_min || filters.age_max,
    filters.fame_min || filters.fame_max,
    (filters.location_mode === 'km' && filters.max_km) || (filters.location_mode === 'city' && filters.city),
    filters.tags,
  ].filter(Boolean).length;

  const buildParams = useCallback(
    (pageNum: number): Record<string, string | number> => {
      const p: Record<string, string | number> = { sort, order, page: pageNum, limit: 20 };
      if (filters.age_min) p.age_min = filters.age_min;
      if (filters.age_max) p.age_max = filters.age_max;
      if (filters.fame_min) p.fame_min = filters.fame_min;
      if (filters.fame_max) p.fame_max = filters.fame_max;
      if (filters.location_mode === 'km' && filters.max_km) p.max_km = filters.max_km;
      if (filters.location_mode === 'city' && filters.city) p.city = filters.city;
      if (filters.tags) p.tags = filters.tags.replace(/#/g, '').replace(/\s+/g, '');
      return p;
    },
    [sort, order, filters]
  );

  const fetchResults = useCallback(
    (isLoadMore = false) => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const targetPage = isLoadMore ? page + 1 : 1;

      if (isLoadMore) setLoadingMore(true);
      else { setLoading(true); setError(''); setPage(1); }

      api
        .searchUsers(buildParams(targetPage))
        .then((data) => {
          if (ctrl.signal.aborted) return;
          setUsers((prev) => (isLoadMore ? [...prev, ...(data.users ?? [])] : (data.users ?? [])));
          setTotal(data.total ?? 0);
          if (isLoadMore) setPage(targetPage);
        })
        .catch((err) => {
          if (!ctrl.signal.aborted) setError(err.message);
        })
        .finally(() => {
          if (!ctrl.signal.aborted) {
            setLoading(false);
            setLoadingMore(false);
          }
        });
    },
    [buildParams, page]
  );

  // Re-fetch when sort/order changes
  useEffect(() => {
    fetchResults();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, order]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
    if (window.innerWidth < 768) setShowFilters(false);
  };

  const handleUpdateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRemoveFilter = (key: keyof SearchFilters | 'location') => {
    if (key === 'location') {
      setFilters((prev) => ({ ...prev, max_km: '', city: '' }));
    } else if (key === 'age_min') {
      setFilters((prev) => ({ ...prev, age_min: '', age_max: '' }));
    } else if (key === 'fame_min') {
      setFilters((prev) => ({ ...prev, fame_min: '', fame_max: '' }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: '' }));
    }
    // trigger search after clearing
    setTimeout(() => fetchResults(), 0);
  };

  const handleLike = async (id: number) => api.like(id);
  const handleUnlike = async (id: number) => api.unlike(id);

  const hasMore = users.length < total;
  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'fame', label: '🔥 Fame' },
    { value: 'age', label: '🎂 Age' },
    { value: 'distance', label: '📍 Distance' },
    { value: 'tags', label: '🏷 Common Tags' },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f8] font-['DM_Sans','Helvetica_Neue',sans-serif]">
      <div className="max-w-[1280px] mx-auto py-8 px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-7 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">
              Advanced Search
            </h1>
            <p className="text-sm text-gray-400">Filter, sort, and find exactly who you're looking for</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex lg:hidden items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#e94057] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ── Sidebar ── */}
          <div className={showFilters ? 'block' : 'hidden lg:block'}>
            <FilterSidebar
              filters={filters}
              onChange={handleUpdateFilter}
              onSubmit={handleApplyFilters}
              onClear={() => { setFilters(DEFAULT_FILTERS); setTimeout(() => fetchResults(), 0); }}
              activeCount={activeFilterCount}
            />
          </div>

          {/* ── Results ── */}
          <div>
            {/* Sort + Count bar */}
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-4 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">
                {loading
                  ? 'Searching…'
                  : <><span className="font-black text-gray-800">{total}</span> profiles found</>
                }
              </p>

              <div className="flex items-center gap-2">
                {/* Sort select */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-sm font-semibold rounded-xl pl-3 pr-8 py-2 outline-none cursor-pointer focus:border-[#e94057] transition-colors"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Order toggle */}
                <button
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {order === 'asc' ? 'Asc' : 'Desc'}
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            <ActiveChips
              filters={filters}
              sort={sort}
              order={order}
              onRemoveFilter={handleRemoveFilter}
            />

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-4 border border-red-100 flex justify-between items-center">
                <span>⚠ {error}</span>
                <button onClick={() => setError('')} className="ml-2 hover:text-red-800">
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={32} className="text-[#e94057] animate-spin" />
                <p className="text-sm text-gray-400">Finding matches…</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
                <div className="text-5xl mb-4 opacity-20">🔍</div>
                <h3 className="text-lg font-black text-gray-800 mb-1">No profiles found</h3>
                <p className="text-sm text-gray-400 max-w-xs">Try broadening your filters — maybe lower the fame range or increase the distance.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onLike={handleLike}
                      onUnlike={handleUnlike}
                    />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => fetchResults(true)}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-[#e94057] text-[#e94057] font-black text-sm hover:bg-[#e94057] hover:text-white transition-all duration-200 disabled:opacity-50"
                    >
                      {loadingMore ? <Loader2 size={15} className="animate-spin" /> : null}
                      {loadingMore ? 'Loading…' : `Load more · ${total - users.length} remaining`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
