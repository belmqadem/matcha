// src/hooks/useBrowse.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';

export function useBrowse() {
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const buildParams = useCallback((pageNum: number) => {
    return { page: pageNum, limit: 20 };
  }, []);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    setPage(1);

    userService
      .browseUsers(buildParams(1))
      .then((data) => {
        if (ctrl.signal.aborted) return;
        const sanitizedUsers = (data.users ?? []).map((u) => ({
          ...u,
          liked_by_me: Boolean(u.liked_by_me),
          liked_me: Boolean(u.liked_me),
          is_connected: Boolean(u.is_connected),
        }));
        setUsers(sanitizedUsers);
        setTotal(data.total ?? 0);
      })
      .catch((err: Error) => {
        if (!ctrl.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [buildParams]);

  const loadMore = async () => {
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
  };
}
