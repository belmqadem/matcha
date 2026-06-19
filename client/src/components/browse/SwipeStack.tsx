import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { SwipeCard } from './SwipeCard';
import { SkeletonCard } from './SkeletonCard';
import type { BrowseUser } from '@/types/user';

interface SwipeStackProps {
  users: BrowseUser[];
  resetKey: number;
  onLike: (_id: string) => Promise<{ liked: boolean; connected: boolean } | null>;
  onViewProfile: (_id: string) => void;
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

const STACK_TRANSFORMS: React.CSSProperties[] = [
  { transform: 'scale(1) translateY(0px)', opacity: 1, zIndex: 3 },
  { transform: 'scale(0.95) translateY(-10px)', opacity: 0.7, zIndex: 2 },
  { transform: 'scale(0.90) translateY(-20px)', opacity: 0.4, zIndex: 1 },
];

const CARD_HEIGHT = 560;

export function SwipeStack({
  users,
  resetKey,
  onLike,
  onViewProfile,
  onLoadMore,
  isLoading,
  hasMore,
}: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchName, setMatchName] = useState<string | null>(null);
  const [exitX, setExitX] = useState<number | null>(null);

  // Reset index only on fresh fetches (filter/sort changes), not on loadMore appends
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(0);
  }, [resetKey]);

  // Trigger load more when 3 cards remain
  useEffect(() => {
    const remaining = users.length - currentIndex;
    if (remaining <= 3 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [currentIndex, users.length, hasMore, isLoading, onLoadMore]);

  const advance = useCallback(() => {
    setExitX(null);
    setCurrentIndex((i) => i + 1);
  }, []);

  // Animate top card off-screen then advance the stack
  const dismiss = useCallback(
    (dir: 'left' | 'right') => {
      setExitX(dir === 'right' ? window.innerWidth + 300 : -(window.innerWidth + 300));
      setTimeout(advance, 350);
    },
    [advance],
  );

  const handleLike = useCallback(
    async (user: BrowseUser) => {
      const result = await onLike(user.id);
      if (!result) return;

      if (result.connected) {
        setMatchName(user.first_name);
        setTimeout(() => {
          setMatchName(null);
          dismiss('right');
        }, 1500);
      } else {
        dismiss('right');
      }
    },
    [onLike, dismiss],
  );

  const handlePass = useCallback(() => {
    dismiss('left');
  }, [dismiss]);

  if (isLoading && users.length === 0) {
    return (
      <div className="relative w-full" style={{ height: CARD_HEIGHT }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-x-0 top-0"
            style={{
              ...STACK_TRANSFORMS[i],
              transition: 'transform 0.3s ease, opacity 0.3s ease',
            }}
          >
            <SkeletonCard height={CARD_HEIGHT} />
          </div>
        ))}
      </div>
    );
  }

  const visible = users.slice(currentIndex, currentIndex + 3);

  if (visible.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
        <div className="text-6xl mb-5">🐻</div>
        <h3 className="text-xl font-extrabold text-text mb-2">You've seen everyone nearby</h3>
        <p className="text-sm font-medium text-text-muted max-w-xs leading-relaxed">
          Check back later or adjust your filters to discover more people.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full select-none" style={{ height: CARD_HEIGHT + 88 }}>
      {/* Card stack */}
      <div className="absolute inset-x-0 top-0" style={{ height: CARD_HEIGHT }}>
        {/* Render back to front so top card is last in DOM */}
        {[...visible].reverse().map((user, reversedIdx) => {
          const stackIdx = visible.length - 1 - reversedIdx;
          const isTop = stackIdx === 0;
          return (
            <div
              key={user.id}
              className="absolute inset-x-0 top-0"
              style={{
                height: CARD_HEIGHT,
                ...STACK_TRANSFORMS[stackIdx],
                transition: isTop ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
                pointerEvents: isTop ? 'auto' : 'none',
              }}
            >
              <SwipeCard
                user={user}
                isTop={isTop}
                onLike={() => handleLike(user)}
                onPass={handlePass}
                onViewProfile={() => onViewProfile(user.username)}
                exitX={isTop && exitX !== null ? exitX : undefined}
                style={{ height: '100%' }}
              />
            </div>
          );
        })}
      </div>

      {/* Match overlay */}
      {matchName && (
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-center rounded-3xl overflow-hidden animate-auth-pop-in"
          style={{ height: CARD_HEIGHT, zIndex: 20 }}
        >
          <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col items-center gap-3 text-center px-8">
            <span className="text-5xl animate-heart-beat">💛</span>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">It's a Match!</h2>
            <p className="text-white/90 font-semibold">You and {matchName} liked each other</p>
          </div>
        </div>
      )}

      {/* Action buttons area — SwipeCard renders them, but we need the space */}
      <div style={{ height: 88 }} />

      {/* Loading more indicator */}
      {isLoading && users.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-3 text-text-muted text-sm">
          <Heart className="w-4 h-4 text-primary animate-heart-beat" />
          <span>Finding more people…</span>
        </div>
      )}
    </div>
  );
}
