import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { Visitor } from '@/types/user';

type SortOrder = 'recent' | 'oldest';

interface UseVisitorsReturn {
  visitors: Visitor[];
  sorted: Visitor[];
  loading: boolean;
  error: string;
  sort: SortOrder;
  setSort: (sort: SortOrder) => void;
}

export function useVisitors(): UseVisitorsReturn {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortOrder>('recent');

  useEffect(() => {
    userService
      .getVisitors()
      .then((v) => setVisitors(v ?? []))
      .catch((e: Error) => setError(e.message ?? 'Failed to load visitors.'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...visitors].sort((a, b) => {
    const diff = new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
    return sort === 'recent' ? diff : -diff;
  });

  return { visitors, sorted, loading, error, sort, setSort };
}
