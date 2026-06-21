import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';
import type { SearchFilters } from '@/types/search';
import { DEFAULT_FILTERS } from '@/types/search';

const LIMIT = 20;

function buildSearchParams(f: SearchFilters, page: number): Record<string, string | number> {
  const p: Record<string, string | number> = {
    sort: f.sort ?? 'fame',
    order: f.order ?? 'desc',
    page,
    limit: LIMIT,
  };
  if (f.age_min) p.age_min = f.age_min;
  if (f.age_max) p.age_max = f.age_max;
  if (f.fame_min) p.fame_min = f.fame_min;
  if (f.fame_max) p.fame_max = f.fame_max;
  if (f.location_mode === 'km' && f.max_km) p.max_km = f.max_km;
  if (f.location_mode === 'city' && f.city) p.city = f.city;
  if (f.tags) p.tags = f.tags.replace(/#/g, '').replace(/\s+/g, '');
  return p;
}

export function useSearch() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const fetchSearch = useCallback(
    async (searchFilters: SearchFilters, targetPage: number, isLoadMore: boolean) => {
      if (!isLoadMore) {
        setLoading(true);
        setPage(1);
      }

      try {
        const params = buildSearchParams(searchFilters, targetPage);
        const data = await userService.searchUsers(params);
        const sanitized = (data.users ?? []).map((u) => ({
          ...u,
          liked_by_me: Boolean(u.liked_by_me),
          liked_me: Boolean(u.liked_me),
          is_connected: Boolean(u.is_connected),
        }));

        if (isLoadMore) {
          setUsers((prev) => {
            const seen = new Set(prev.map((u) => u.id));
            return [...prev, ...sanitized.filter((u) => !seen.has(u.id))];
          });
        } else {
          setUsers(sanitized);
        }
        setTotal(data.total ?? 0);
        if (isLoadMore) setPage(targetPage);
      } catch (err) {
        toast.error((err as Error).message ?? 'Search failed.');
      } finally {
        if (!isLoadMore) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSearch(DEFAULT_FILTERS, 1, false);
  }, [fetchSearch]);

  const search = useCallback(
    (searchFilters: SearchFilters) => {
      setFilters(searchFilters);
      setActiveFilters(searchFilters);
      void fetchSearch(searchFilters, 1, false);
    },
    [fetchSearch],
  );

  const loadMore = useCallback(() => {
    void fetchSearch(activeFilters, page + 1, true);
  }, [fetchSearch, activeFilters, page]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback(
    (key: keyof SearchFilters | 'location') => {
      setFilters((prev) => {
        const next = { ...prev };
        if (key === 'location') {
          next.max_km = '';
          next.city = '';
        } else if (key === 'age_min') {
          next.age_min = '';
          next.age_max = '';
        } else if (key === 'fame_min') {
          next.fame_min = '';
          next.fame_max = '';
        } else if (key !== 'location_mode' && key !== 'sort' && key !== 'order') {
          next[key] = '';
        }
        setActiveFilters(next);
        void fetchSearch(next, 1, false);
        return next;
      });
    },
    [fetchSearch],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
    void fetchSearch(DEFAULT_FILTERS, 1, false);
  }, [fetchSearch]);

  const like = useCallback(async (id: string) => {
    const res = await userService.like(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, liked_by_me: true, is_connected: res.connected } : u)),
    );
    return { connected: res.connected };
  }, []);

  const unlike = useCallback(async (id: string) => {
    await userService.unlike(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u)),
    );
  }, []);

  const activeCount = [
    filters.age_min || filters.age_max,
    filters.fame_min || filters.fame_max,
    filters.location_mode === 'km' ? filters.max_km : filters.city,
    filters.tags,
  ].filter(Boolean).length;

  return {
    users,
    total,
    loading,
    filters,
    updateFilter,
    search,
    loadMore,
    removeFilter,
    clearFilters,
    hasMore: users.length < total,
    activeCount,
    like,
    unlike,
  };
}
