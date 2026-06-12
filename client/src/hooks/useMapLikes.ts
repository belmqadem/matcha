// src/hooks/useMapLikes.ts
import { useState, useCallback } from 'react';
import { mapService } from '@/services/mapService';
import { userService } from '@/services/userService';

interface UseMapLikesReturn {
  likeStates: Record<string, boolean>;
  handleLike: (userId: string) => Promise<void>;
  checkLikeStatus: (userId: string) => Promise<void>;
}

export function useMapLikes(): UseMapLikesReturn {
  const [likeStates, setLikeStates] = useState<Record<string, boolean>>({});

  const handleLike = useCallback(
    async (userId: string) => {
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
    },
    [likeStates],
  );

  const checkLikeStatus = useCallback(
    async (userId: string) => {
      if (userId in likeStates) return;
      try {
        const profile = await userService.getPublicProfile(userId);
        const isLiked = profile.liked_by_me ?? false;
        setLikeStates((prev) => ({ ...prev, [userId]: isLiked }));
      } catch {
        // ignore error
      }
    },
    [likeStates],
  );

  return { likeStates, handleLike, checkLikeStatus };
}
