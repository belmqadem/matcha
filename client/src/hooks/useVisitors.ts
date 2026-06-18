import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import type { Visitor } from '@/types/user';

type SortOrder = 'recent' | 'oldest';

interface UseVisitorsReturn {
  visitors: Visitor[];
  sorted: Visitor[];
  loading: boolean;
  sort: SortOrder;
  setSort: (_sort: SortOrder) => void;
}

export function useVisitors(): UseVisitorsReturn {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOrder>('recent');

  useEffect(() => {
    userService
      .getVisitors()
      .then((v) => setVisitors(v ?? []))
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load visitors.'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...visitors].sort((a, b) => {
    const diff = new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
    return sort === 'recent' ? diff : -diff;
  });

  return { visitors, sorted, loading, sort, setSort };
}
