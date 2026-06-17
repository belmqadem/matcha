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

  const [resetKey, setResetKey] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('distance');
  const [order, setOrder] = useState<OrderKey>('asc');

  const buildParams = useCallback(
    (pageNum: number, nextSort = sort, nextOrder = order, nextFilters = filters) => {
      const p: Record<string, string | number> = {
        sort: nextSort,
        order: nextOrder,
        page: pageNum,
        limit: 20,
      };
      if (nextFilters.age_min) p.age_min = nextFilters.age_min;
      if (nextFilters.age_max) p.age_max = nextFilters.age_max;
      if (nextFilters.fame_min) p.fame_min = nextFilters.fame_min;
      if (nextFilters.fame_max) p.fame_max = nextFilters.fame_max;
      if (nextFilters.location_mode === 'km' && nextFilters.max_km) p.max_km = nextFilters.max_km;
      if (nextFilters.location_mode === 'city' && nextFilters.city) p.city = nextFilters.city;
      if (nextFilters.tags) p.tags = nextFilters.tags.replace(/#/g, '').replace(/\s+/g, '');
      return p;
    },
    [sort, order, filters],
  );

  const fetchTab = useCallback(
    (
      tab: TabValue,
      isLoadMore = false,
      nextSort = sort,
      nextOrder = order,
      nextFilters = filters,
    ) => {
      const targetPage = isLoadMore ? page + 1 : 1;
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setPage(1);
        setResetKey((k) => k + 1);
      }

      const fetchPromise = (() => {
        if (tab === 'all') {
          return userService.browseUsers(buildParams(targetPage, nextSort, nextOrder, nextFilters));
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
          setUsers((prev) => {
            if (!isLoadMore) return sanitizedUsers;
            const seen = new Set(prev.map((u) => u.id));
            return [...prev, ...sanitizedUsers.filter((u) => !seen.has(u.id))];
          });
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTab(activeTab);
  }, [activeTab, sort, order]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(
    (nextSort?: SortKey, nextOrder?: OrderKey, nextFilters?: SearchFilters) => {
      const resolvedSort = nextSort ?? sort;
      const resolvedOrder = nextOrder ?? order;
      const resolvedFilters = nextFilters ?? filters;

      setSort(resolvedSort);
      setOrder(resolvedOrder);
      setFilters(resolvedFilters);
      fetchTab(activeTab, false, resolvedSort, resolvedOrder, resolvedFilters);
    },
    [fetchTab, activeTab, sort, order, filters],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSort('distance');
    setOrder('asc');
    fetchTab(activeTab, false, 'distance', 'asc', DEFAULT_FILTERS);
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
      setTimeout(() => fetchTab(activeTab, false), 0);
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

  const fetchTabOnly = useCallback((tab: TabValue) => {
    setActiveTab(tab);
  }, []);

  return {
    users,
    resetKey,
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
