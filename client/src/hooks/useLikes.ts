import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { Liker } from '@/types/user';

type SortOrder = 'recent' | 'oldest';

interface UseLikesReturn {
  likedBy: Liker[];
  sorted: Liker[];
  loading: boolean;
  error: string;
  sort: SortOrder;
  setSort: (_sort: SortOrder) => void;
}

export function useLikes(): UseLikesReturn {
  const [likedBy, setLikedBy] = useState<Liker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortOrder>('recent');

  useEffect(() => {
    userService
      .getLikedBy()
      .then((likers) => setLikedBy(likers ?? []))
      .catch((e: Error) => setError(e.message ?? 'Failed to load likes.'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...likedBy].sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    return sort === 'recent' ? tb - ta : ta - tb;
  });

  return { likedBy, sorted, loading, error, sort, setSort };
}
