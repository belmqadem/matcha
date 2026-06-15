// src/hooks/useSearch.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService } from '@/services/userService';
import type { BrowseUser } from '@/types/user';

export function useSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQ = searchParams.get('q') || '';

  const [allUsers, setAllUsers] = useState<BrowseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(urlQ);

  // Sync state if URL param changes (e.g. from navbar search submission)
  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  // Update URL param when local state changes
  const handleSetQ = useCallback((val: string) => {
    setQ(val);
    setSearchParams((prev) => {
      if (val) prev.set('q', val);
      else prev.delete('q');
      return prev;
    });
  }, [setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const fetchAll = async () => {
      try {
        const usersList = await userService.getSearchAll();
        if (active) {
          setAllUsers(usersList);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return allUsers;
    return allUsers.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(query) ||
        u.last_name?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query)
    );
  }, [allUsers, q]);

  const like = useCallback(async (id: string) => {
    const res = await userService.like(id);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, liked_by_me: true, is_connected: res.connected } : u))
    );
    return { connected: res.connected };
  }, []);

  const unlike = useCallback(async (id: string) => {
    await userService.unlike(id);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u))
    );
  }, []);

  return {
    users: filteredUsers,
    total: filteredUsers.length,
    loading,
    error,
    setError,
    q,
    setQ: handleSetQ,
    like,
    unlike,
  };
}
