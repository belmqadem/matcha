// src/hooks/useMapLikes.ts
import { useState, useCallback } from 'react';
import { mapService } from '@/services/mapService';

interface UseMapLikesReturn {
  likeStates: Record<string, boolean>;
  handleLike: (userId: string) => Promise<void>;
}

export function useMapLikes(): UseMapLikesReturn {
  const [likeStates, setLikeStates] = useState<Record<string, boolean>>({});

  const handleLike = useCallback(async (userId: string) => {
    const already = likeStates[userId] ?? false;
    // Optimistic update
    setLikeStates((prev) => ({ ...prev, [userId]: !already }));
    try {
      if (already) {
        await mapService.unlikeUser(userId);
      } else {
        await mapService.likeUser(userId);
      }
    } catch {
      // Rollback on failure
      setLikeStates((prev) => ({ ...prev, [userId]: already }));
    }
  }, [likeStates]);

  return { likeStates, handleLike };
}
