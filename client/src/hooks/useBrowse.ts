import { useState, useEffect, useCallback, useRef } from 'react';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';
import type { BrowseFilters } from '@/types/browse';
import { DEFAULT_BROWSE_FILTERS } from '@/types/browse';
import { BROWSE_FILTERS_KEY } from './useBrowseFilters';

function loadSavedFilters(): BrowseFilters {
  try {
    const raw = localStorage.getItem(BROWSE_FILTERS_KEY);
    if (!raw) return DEFAULT_BROWSE_FILTERS;
    return { ...DEFAULT_BROWSE_FILTERS, ...(JSON.parse(raw) as Partial<BrowseFilters>) };
  } catch {
    return DEFAULT_BROWSE_FILTERS;
  }
}

const LIMIT = 20;

function buildParams(page: number, f: BrowseFilters): Record<string, string | number> {
  const p: Record<string, string | number> = {
    sort: f.sort,
    order: f.order,
    page,
    limit: LIMIT,
  };
  if (f.age_min != null) p.age_min = f.age_min;
  if (f.age_max != null) p.age_max = f.age_max;
  if (f.fame_min != null) p.fame_min = f.fame_min;
  if (f.fame_max != null) p.fame_max = f.fame_max;
  if (f.max_km != null) p.max_km = f.max_km;
  if (f.tags) p.tags = String(f.tags).replace(/#/g, '').replace(/\s+/g, '');
  return p;
}

export function useBrowse() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  // Initialise with persisted filters so loadMore continues using the right params
  const [activeFilters, setActiveFilters] = useState<BrowseFilters>(loadSavedFilters);
  const initialFilters = useRef(loadSavedFilters());

  const fetchBrowse = useCallback(
    async (filters: BrowseFilters, isLoadMore: boolean, currentPage: number) => {
      const targetPage = isLoadMore ? currentPage + 1 : 1;

      if (!isLoadMore) {
        setLoading(true);
        setError(null);
        setPage(1);
        setResetKey((k) => k + 1);
      }

      try {
        const data = await userService.browseUsers(buildParams(targetPage, filters));
        const sanitized = (data.users ?? []).map((u) => ({
          ...u,
          liked_by_me: Boolean(u.liked_by_me),
          liked_me: Boolean(u.liked_me),
          is_connected: Boolean(u.is_connected),
        }));

        setUsers((prev) => {
          if (!isLoadMore) return sanitized;
          const seen = new Set(prev.map((u) => u.id));
          return [...prev, ...sanitized.filter((u) => !seen.has(u.id))];
        });
        setTotal(data.total ?? 0);
        if (isLoadMore) setPage(targetPage);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        if (!isLoadMore) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchBrowse(initialFilters.current, false, 1);
  }, [fetchBrowse]);

  const loadMore = useCallback(() => {
    void fetchBrowse(activeFilters, true, page);
  }, [fetchBrowse, activeFilters, page]);

  const applyFilters = useCallback(
    (filters: BrowseFilters) => {
      setActiveFilters(filters);
      void fetchBrowse(filters, false, 1);
    },
    [fetchBrowse],
  );

  const clearFilters = useCallback(() => {
    setActiveFilters(DEFAULT_BROWSE_FILTERS);
    void fetchBrowse(DEFAULT_BROWSE_FILTERS, false, 1);
  }, [fetchBrowse]);

  const handleLike = async (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, liked_by_me: true, is_connected: u.liked_me } : u)),
    );
    try {
      const res = await userService.like(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, liked_by_me: true, is_connected: res.connected } : u,
        ),
      );
      return res;
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u)),
      );
      setError((err as Error).message);
      return null;
    }
  };

  const handleUnlike = async (id: string) => {
    const original = users.find((u) => u.id === id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u)),
    );
    try {
      await userService.unlike(id);
      return true;
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                liked_by_me: original?.liked_by_me ?? false,
                is_connected: original?.is_connected ?? false,
              }
            : u,
        ),
      );
      setError((err as Error).message);
      return false;
    }
  };

  return {
    users,
    resetKey,
    total,
    loading,
    error,
    hasMore: users.length < total,
    loadMore,
    handleLike,
    handleUnlike,
    applyFilters,
    clearFilters,
  };
}
