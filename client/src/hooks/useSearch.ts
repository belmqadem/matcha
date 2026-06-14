import { useState, useCallback, useRef, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';
import type { SearchFilters, SortKey, OrderKey } from '@/types/search';
import { DEFAULT_FILTERS } from '@/types/search';

interface UseSearchReturn {
  users: BrowseUser[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string;
  filters: SearchFilters;
  sort: SortKey;
  order: OrderKey;
  hasMore: boolean;
  setSort: (sort: SortKey) => void;
  setOrder: (order: OrderKey) => void;
  setError: (msg: string) => void;
  updateFilter: (key: keyof SearchFilters, value: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  removeFilter: (key: keyof SearchFilters | 'location') => void;
  loadMore: () => void;
  like: (id: string) => Promise<{ connected: boolean }>;
  unlike: (id: string) => Promise<void>;
}

export function useSearch(): UseSearchReturn {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('fame');
  const [order, setOrder] = useState<OrderKey>('desc');

  const abortRef = useRef<AbortController | null>(null);

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
    [sort, order, filters],
  );

  const fetchResults = useCallback(
    (isLoadMore = false) => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const targetPage = isLoadMore ? page + 1 : 1;

      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
        setError('');
        setPage(1);
      }

      userService
        .searchUsers(buildParams(targetPage))
        .then((data) => {
          if (ctrl.signal.aborted) return;
          setUsers((prev) => (isLoadMore ? [...prev, ...(data.users ?? [])] : (data.users ?? [])));
          setTotal(data.total ?? 0);
          if (isLoadMore) setPage(targetPage);
        })
        .catch((err: Error) => {
          if (!ctrl.signal.aborted) setError(err.message);
        })
        .finally(() => {
          if (!ctrl.signal.aborted) {
            setLoading(false);
            setLoadingMore(false);
          }
        });
    },
    [buildParams, page],
  );

  // Re-fetch when sort or order changes
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchResults();
    });
    return () => abortRef.current?.abort();
  }, [sort, order]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    fetchResults();
  }, [fetchResults]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    // defer so state is flushed before re-fetch
    setTimeout(() => fetchResults(), 0);
  }, [fetchResults]);

  const removeFilter = useCallback(
    (key: keyof SearchFilters | 'location') => {
      if (key === 'location') {
        setFilters((prev) => ({ ...prev, max_km: '', city: '' }));
      } else if (key === 'age_min') {
        setFilters((prev) => ({ ...prev, age_min: '', age_max: '' }));
      } else if (key === 'fame_min') {
        setFilters((prev) => ({ ...prev, fame_min: '', fame_max: '' }));
      } else {
        setFilters((prev) => ({ ...prev, [key]: '' }));
      }
      setTimeout(() => fetchResults(), 0);
    },
    [fetchResults],
  );

  const loadMore = useCallback(() => {
    fetchResults(true);
  }, [fetchResults]);

  const like = useCallback(async (id: string): Promise<{ connected: boolean }> => {
    const res = await userService.like(id);
    return { connected: res.connected };
  }, []);

  const unlike = useCallback(async (id: string): Promise<void> => {
    await userService.unlike(id);
  }, []);

  return {
    users,
    total,
    loading,
    loadingMore,
    error,
    filters,
    sort,
    order,
    hasMore: users.length < total,
    setSort,
    setOrder,
    setError,
    updateFilter,
    applyFilters,
    clearFilters,
    removeFilter,
    loadMore,
    like,
    unlike,
  };
}
