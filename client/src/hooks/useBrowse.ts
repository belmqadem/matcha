// src/hooks/useBrowse.ts
import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';

type TabValue = 'all' | 'liked' | 'liked-me' | 'matches';

export function useBrowse() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  const buildParams = useCallback((pageNum: number) => {
    return { page: pageNum, limit: 20 };
  }, []);

  const fetchTab = useCallback((tab: TabValue) => {
    setLoading(true);
    setError(null);
    setPage(1);
    setActiveTab(tab);

    const fetchPromise = (() => {
      if (tab === 'all') {
        return userService.browseUsers(buildParams(1));
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
        setUsers(sanitizedUsers);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [buildParams]);

  useEffect(() => {
    let active = true;
    userService.browseUsers({ page: 1, limit: 20 })
      .then((data) => {
        if (!active) return;
        const sanitizedUsers = (data.users ?? []).map((u) => ({
          ...u,
          liked_by_me: Boolean(u.liked_by_me),
          liked_me: Boolean(u.liked_me),
          is_connected: Boolean(u.is_connected),
        }));
        setUsers(sanitizedUsers);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const loadMore = async () => {
    if (activeTab !== 'all') return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const data = await userService.browseUsers(buildParams(next));
      const sanitizedUsers = (data.users ?? []).map((u) => ({
        ...u,
        liked_by_me: Boolean(u.liked_by_me),
        liked_me: Boolean(u.liked_me),
        is_connected: Boolean(u.is_connected),
      }));
      setUsers((prev) => [...prev, ...sanitizedUsers]);
      setPage(next);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

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

    if (activeTab === 'liked' || activeTab === 'matches') {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u)),
      );
    }

    try {
      await userService.unlike(id);
    } catch (err) {
      if (activeTab === 'liked' || activeTab === 'matches') {
        if (original) {
          setUsers((prev) => [...prev, original]);
          setTotal((prev) => prev + 1);
        }
      } else {
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
      }
      setError((err as Error).message);
    }
  };

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
    fetchTab,
  };
}
