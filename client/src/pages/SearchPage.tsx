// src/pages/SearchPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2, Search, SlidersHorizontal, MapPin, X,
  Heart, Eye, Flame, Tag, ArrowUpDown, ChevronDown, ChevronUp,
  Star, Sparkles, Circle
} from 'lucide-react';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';

// ─── Types ────────────────────────────────────────────────────────────────────
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
  age_min: '', age_max: '', fame_min: '', fame_max: '',
  location_mode: 'km', max_km: '', city: '', tags: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAge(birth_date?: string): number | null {
  if (!birth_date) return null;
  const diff = Date.now() - new Date(birth_date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function getPhotoUrl(user: BrowseUser): string {
  if (user.photos && user.photos.length > 0) {
    const main = user.photos.find((p) => p.id === user.profile_picture_id);
    return (main ?? user.photos[0]).url;
  }
  return '';
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

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
  const initials = getInitials(user.first_name, user.last_name || '');

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
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <a href={`/profile/${user.id}`} className="group relative flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <div className="relative aspect-[4/5] bg-background overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={user.first_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-black text-text-muted select-none">{initials}</span>
          </div>
        )}

        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border shadow-sm ${
          user.is_online ? 'bg-white/90 text-primary border-primary/20' : 'bg-black/40 text-white/90 border-white/20'
        }`}>
          <Circle className={`w-2 h-2 fill-current ${user.is_online ? 'text-primary' : 'text-white/50'}`} />
          {user.is_online ? 'Online' : 'Offline'}
        </div>

        {connected && (
          <div className="absolute top-3 right-3 bg-primary/95 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles size={10} /> MATCH
          </div>
        )}

        <button
          onClick={handleLikeToggle}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 backdrop-blur-sm ${
            liked ? 'bg-primary text-white scale-110' : 'bg-white/90 text-text-muted hover:text-primary hover:scale-110'
          }`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} fill={liked ? 'currentColor' : 'none'} />}
        </button>

        {user.liked_me && !connected && (
          <div className="absolute bottom-3 left-3 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20">
            Likes you ♥
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-text text-sm leading-tight truncate">
              {user.first_name}{age ? `, ${age}` : ''}
            </p>
            <p className="text-[11px] text-text-muted truncate">@{user.username}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
            <Flame size={11} className="text-primary" />
            <span className="text-[11px] font-bold text-primary">{Math.round(user.fame_rating)}</span>
          </div>
        </div>

        {(user.location_city || user.distance_km != null) && (
          <div className="flex items-center gap-1 text-[11px] text-text-muted mt-1">
            <MapPin size={10} />
            <span className="truncate">
              {user.location_city ?? ''}
              {user.distance_km != null ? ` · ${Math.round(user.distance_km)} km` : ''}
            </span>
          </div>
        )}

        {user.tags && user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {user.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-background text-text-muted px-2 py-0.5 rounded-full font-medium border border-border">
                #{tag}
              </span>
            ))}
            {user.tags.length > 3 && <span className="text-[10px] text-text-muted">+{user.tags.length - 3}</span>}
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
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-border p-5 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-text tracking-tight">Filters</h2>
        {activeCount > 0 && (
          <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2.5">
          <Eye size={10} /> Age Range
        </label>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="18" min={18} max={120} value={filters.age_min} onChange={(e) => onChange('age_min', e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-text" />
          <span className="text-text-muted text-sm">–</span>
          <input type="number" placeholder="99" min={18} max={120} value={filters.age_max} onChange={(e) => onChange('age_max', e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-text" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2.5">
          <Flame size={10} /> Fame Rating
        </label>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="0" min={0} max={100} value={filters.fame_min} onChange={(e) => onChange('fame_min', e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-text" />
          <span className="text-text-muted text-sm">–</span>
          <input type="number" placeholder="100" min={0} max={100} value={filters.fame_max} onChange={(e) => onChange('fame_max', e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-text" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2.5">
          <MapPin size={10} /> Location
        </label>
        <div className="flex bg-background p-1 rounded-xl mb-2.5 gap-1 border border-border">
          {(['km', 'city'] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => onChange('location_mode', mode)} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${filters.location_mode === mode ? 'bg-white shadow text-primary border border-border' : 'text-text-muted hover:text-text'}`}>
              {mode === 'km' ? '📍 Distance' : '🏙 City'}
            </button>
          ))}
        </div>
        {filters.location_mode === 'km' ? (
          <div className="relative">
            <input type="number" placeholder="Max km away" min={1} value={filters.max_km} onChange={(e) => onChange('max_km', e.target.value)} className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-text" />
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        ) : (
          <input type="text" placeholder="e.g. Paris, Berlin…" value={filters.city} onChange={(e) => onChange('city', e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-text" />
        )}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest mb-2.5">
          <Tag size={10} /> Interests
        </label>
        <input type="text" placeholder="vegan, hiking, art…" value={filters.tags} onChange={(e) => onChange('tags', e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-all text-text" />
        <p className="text-[10px] text-text-muted mt-1">Comma-separated. # optional.</p>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClear} className="flex-1 py-2.5 rounded-xl border border-border text-text-muted text-sm font-bold hover:bg-background transition-colors">Clear</button>
        <button type="submit" className="flex-[2] py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm">
          <Search size={14} /> Search
        </button>
      </div>
    </form>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────
function ActiveChips({ filters, onRemoveFilter }: { filters: SearchFilters; onRemoveFilter: (key: keyof SearchFilters | 'location') => void; }) {
  const chips: { label: string; key: keyof SearchFilters | 'location' }[] = [];
  if (filters.age_min || filters.age_max) chips.push({ label: `Age: ${filters.age_min || '18'}–${filters.age_max || '∞'}`, key: 'age_min' });
  if (filters.fame_min || filters.fame_max) chips.push({ label: `Fame: ${filters.fame_min || '0'}–${filters.fame_max || '100'}`, key: 'fame_min' });
  if (filters.location_mode === 'km' && filters.max_km) chips.push({ label: `≤ ${filters.max_km} km`, key: 'location' });
  if (filters.location_mode === 'city' && filters.city) chips.push({ label: `📍 ${filters.city}`, key: 'location' });
  if (filters.tags) chips.push({ label: `#${filters.tags.replace(/,\s*/g, ' #')}`, key: 'tags' });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span key={chip.key} className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-3 py-1 rounded-full">
          {chip.label}
          <button onClick={() => onRemoveFilter(chip.key)} className="text-primary hover:opacity-70 transition-opacity"><X size={11} /></button>
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

  const activeFilterCount = [
    filters.age_min || filters.age_max,
    filters.fame_min || filters.fame_max,
    (filters.location_mode === 'km' && filters.max_km) || (filters.location_mode === 'city' && filters.city),
    filters.tags,
  ].filter(Boolean).length;

  const buildParams = useCallback((pageNum: number): Record<string, string | number> => {
    const p: Record<string, string | number> = { sort, order, page: pageNum, limit: 20 };
    if (filters.age_min) p.age_min = filters.age_min;
    if (filters.age_max) p.age_max = filters.age_max;
    if (filters.fame_min) p.fame_min = filters.fame_min;
    if (filters.fame_max) p.fame_max = filters.fame_max;
    if (filters.location_mode === 'km' && filters.max_km) p.max_km = filters.max_km;
    if (filters.location_mode === 'city' && filters.city) p.city = filters.city;
    if (filters.tags) p.tags = filters.tags.replace(/#/g, '').replace(/\s+/g, '');
    return p;
  }, [sort, order, filters]);

  const fetchResults = useCallback((isLoadMore = false) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const targetPage = isLoadMore ? page + 1 : 1;

    if (isLoadMore) setLoadingMore(true);
    else { setLoading(true); setError(''); setPage(1); }

    userService.searchUsers(buildParams(targetPage))
      .then((data) => {
        if (ctrl.signal.aborted) return;
        setUsers((prev) => (isLoadMore ? [...prev, ...(data.users ?? [])] : (data.users ?? [])));
        setTotal(data.total ?? 0);
        if (isLoadMore) setPage(targetPage);
      })
      .catch((err) => { if (!ctrl.signal.aborted) setError(err.message); })
      .finally(() => {
        if (!ctrl.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      });
  }, [buildParams, page]);

  useEffect(() => {
    fetchResults();
    return () => abortRef.current?.abort();
  }, [sort, order, fetchResults]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
    if (window.innerWidth < 1024) setShowFilters(false);
  };

  const handleUpdateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRemoveFilter = (key: keyof SearchFilters | 'location') => {
    if (key === 'location') setFilters((prev) => ({ ...prev, max_km: '', city: '' }));
    else if (key === 'age_min') setFilters((prev) => ({ ...prev, age_min: '', age_max: '' }));
    else if (key === 'fame_min') setFilters((prev) => ({ ...prev, fame_min: '', fame_max: '' }));
    else setFilters((prev) => ({ ...prev, [key]: '' }));
    setTimeout(() => fetchResults(), 0);
  };

  const handleLike = async (id: number) => { await userService.like(id); };
  const handleUnlike = async (id: number) => { await userService.unlike(id); };

  const hasMore = users.length < total;
  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'fame', label: '🔥 Fame' },
    { value: 'age', label: '🎂 Age' },
    { value: 'distance', label: '📍 Distance' },
    { value: 'tags', label: '🏷 Common Tags' },
  ];

  return (
    <div className="min-h-screen bg-background font-primary">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

        <div className="flex items-end justify-between mb-7 gap-4">
          <div>
            <h1 className="text-3xl font-black text-text tracking-tight leading-none mb-1">Advanced Search</h1>
            <p className="text-sm text-text-muted">Filter, sort, and find exactly who you're looking for</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex lg:hidden items-center gap-2 bg-white border border-border px-4 py-2.5 rounded-xl text-sm font-bold text-text shadow-sm">
            <SlidersHorizontal size={15} /> Filters
            {activeFilterCount > 0 && <span className="bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <div className={showFilters ? 'block' : 'hidden lg:block'}>
            <FilterSidebar filters={filters} onChange={handleUpdateFilter} onSubmit={handleApplyFilters} onClear={() => { setFilters(DEFAULT_FILTERS); setTimeout(() => fetchResults(), 0); }} activeCount={activeFilterCount} />
          </div>

          <div>
            <div className="bg-white border border-border rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-4 shadow-sm">
              <p className="text-sm text-text-muted font-medium">
                {loading ? 'Searching…' : <><span className="font-black text-text">{total}</span> profiles found</>}
              </p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="appearance-none bg-background border border-border text-text text-sm font-semibold rounded-xl pl-3 pr-8 py-2 outline-none cursor-pointer focus:border-primary transition-colors">
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
                <button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1.5 bg-background border border-border px-3 py-2 rounded-xl text-sm font-bold text-text hover:bg-border/50 transition-colors">
                  {order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {order === 'asc' ? 'Asc' : 'Desc'}
                </button>
              </div>
            </div>

            <ActiveChips filters={filters} onRemoveFilter={handleRemoveFilter} />

            {error && (
              <div className="bg-error/10 text-error text-sm p-4 rounded-xl mb-4 border border-error/20 flex justify-between items-center">
                <span>⚠ {error}</span>
                <button onClick={() => setError('')} className="ml-2 hover:opacity-70"><X size={15} /></button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-sm text-text-muted">Finding matches…</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-border text-center">
                <div className="text-5xl mb-4 opacity-20">🔍</div>
                <h3 className="text-lg font-black text-text mb-1">No profiles found</h3>
                <p className="text-sm text-text-muted max-w-xs">Try broadening your filters — maybe lower the fame range or increase the distance.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {users.map((user) => <UserCard key={user.id} user={user} onLike={handleLike} onUnlike={handleUnlike} />)}
                </div>
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button onClick={() => fetchResults(true)} disabled={loadingMore} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-primary text-primary font-black text-sm hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50">
                      {loadingMore && <Loader2 size={15} className="animate-spin" />}
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
