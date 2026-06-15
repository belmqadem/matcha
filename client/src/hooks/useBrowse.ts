// src/hooks/useBrowse.ts
import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';
import type { SearchFilters, SortKey, OrderKey } from '@/types/search';
import { DEFAULT_FILTERS } from '@/types/search';

type TabValue = 'all' | 'liked' | 'liked-me' | 'matches';

export function useBrowse() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('fame');
  const [order, setOrder] = useState<OrderKey>('desc');

  const buildParams = useCallback(
    (pageNum: number) => {
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

  const fetchTab = useCallback(
    (tab: TabValue, isLoadMore = false) => {
      const targetPage = isLoadMore ? page + 1 : 1;
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setPage(1);
      }

      const fetchPromise = (() => {
        if (tab === 'all') {
          return userService.browseUsers(buildParams(targetPage));
        } else if (tab === 'liked') {
          return userService.getLikedUsers();
        } else if (tab === 'liked-me') {
          return userService.getLikedByUsers();
        } else {
          return userService.getMatches();
        }
      })();

      fetchPromise
        .then((data) => {
          const sanitizedUsers = (data.users ?? []).map((u) => ({
            ...u,
            liked_by_me: Boolean(u.liked_by_me),
            liked_me: Boolean(u.liked_me),
            is_connected: Boolean(u.is_connected),
          }));
          setUsers((prev) => (isLoadMore ? [...prev, ...sanitizedUsers] : sanitizedUsers));
          setTotal(data.total ?? 0);
          if (isLoadMore) setPage(targetPage);
          setLoading(false);
          setLoadingMore(false);
        })
        .catch((err: Error) => {
          setError(err.message);
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [buildParams, page],
  );

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab, sort, order]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    fetchTab(activeTab);
  }, [fetchTab, activeTab]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setTimeout(() => fetchTab(activeTab), 0);
  }, [fetchTab, activeTab]);

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
      setTimeout(() => fetchTab(activeTab), 0);
    },
    [fetchTab, activeTab],
  );

  const loadMore = useCallback(() => {
    fetchTab(activeTab, true);
  }, [fetchTab, activeTab]);

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
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u)),
      );
      setError((err as Error).message);
    }
  };

  const handleUnlike = async (id: string) => {
    const original = users.find((u) => u.id === id);

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u)),
    );

    try {
      await userService.unlike(id);
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
    }
  };

  const fetchTabOnly = useCallback((tab: TabValue) => {
    setActiveTab(tab);
  }, []);

  return {
    users,
    total,
    loading,
    loadingMore,
    error,
    setError,
    loadMore,
    handleLike,
    handleUnlike,
    activeTab,
    fetchTab: fetchTabOnly,
    filters,
    sort,
    order,
    setSort,
    setOrder,
    updateFilter,
    applyFilters,
    clearFilters,
    removeFilter,
  };
}
