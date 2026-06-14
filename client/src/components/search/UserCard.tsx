import { useState } from 'react';
import { Loader2, Heart, MapPin, Flame, Sparkles, Circle } from 'lucide-react';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';

import { calculateAge } from '@/utils/age';
import { getPhotoUrl, getInitials } from '@/utils/user';
import type { BrowseUser } from '@/types/user';

interface UserCardProps {
  user: BrowseUser;
  onLike: (id: string) => Promise<{ connected: boolean }>;
  onUnlike: (id: string) => Promise<void>;
}

export function UserCard({ user, onLike, onUnlike }: UserCardProps) {
  const { openProfile } = useProfileDrawer();
  const [liked, setLiked] = useState(user.liked_by_me);
  const [connected, setConnected] = useState(user.is_connected);
  const [loading, setLoading] = useState(false);

  const age = calculateAge(user.birth_date ?? '');
  const photoUrl = getPhotoUrl(user);
  const initials = getInitials(user.first_name, user.last_name ?? '');

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (liked) {
        await onUnlike(user.id);
        setLiked(false);
        setConnected(false);
      } else {
        const res = await onLike(user.id);
        setLiked(true);
        if (res?.connected) setConnected(true);
      }
    } catch {
      // silent fail serverside errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => openProfile(user.id)}
      className="group relative flex flex-col bg-surface rounded-2xl sm:rounded-3xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      {/* Photo */}
      <div className="relative aspect-[4/5] bg-background overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={user.first_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-black text-text-muted select-none">
              {initials}
            </span>
          </div>
        )}

        {/* Online badge */}
        <div
          className={`absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[0.6rem] sm:text-[0.65rem] font-bold backdrop-blur-md border shadow-sm ${
            user.is_online
              ? 'bg-surface/90 text-success border-success/20'
              : 'bg-text/40 text-surface/90 border-surface/20'
          }`}
        >
          <Circle
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 fill-current ${user.is_online ? 'text-success' : 'text-surface/50'}`}
          />
          {user.is_online ? 'Online' : 'Offline'}
        </div>

        {/* Match badge */}
        {connected && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-primary/95 backdrop-blur-sm text-surface text-[0.6rem] sm:text-[0.65rem] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> MATCH
          </div>
        )}

        {/* Like button */}
        <button
          onClick={handleLikeToggle}
          className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 backdrop-blur-sm active:scale-95 ${
            liked
              ? 'bg-primary text-surface scale-110'
              : 'bg-surface/90 text-text-muted hover:text-primary hover:scale-110'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
          ) : (
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={liked ? 'currentColor' : 'none'} />
          )}
        </button>

        {/* Likes you badge */}
        {user.liked_me && !connected && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-surface/95 text-primary text-[0.6rem] sm:text-[0.65rem] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-primary/20 shadow-sm">
            Likes you
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-text text-sm sm:text-base leading-tight truncate">
              {user.first_name}
              {age ? <span className="font-normal opacity-90">, {age}</span> : ''}
            </p>
            <p className="text-[0.65rem] sm:text-xs text-text-muted truncate">@{user.username}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-primary/20 shadow-sm">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
            <span className="text-[0.65rem] sm:text-[11px] font-bold text-primary">
              {Math.round(user.fame_rating)}
            </span>
          </div>
        </div>

        {(user.location_city || user.distance_km != null) && (
          <div className="flex items-center gap-1 text-[0.65rem] sm:text-xs text-text-muted mt-0.5 sm:mt-1 font-medium">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="truncate">
              {user.location_city ?? ''}
              {user.distance_km != null ? ` • ${Math.round(user.distance_km)} km` : ''}
            </span>
          </div>
        )}

        {user.tags && user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 sm:mt-1.5">
            {user.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[0.6rem] sm:text-[0.65rem] bg-background text-text-muted px-2 py-0.5 rounded-full font-bold border border-border"
              >
                #{tag}
              </span>
            ))}
            {user.tags.length > 3 && (
              <span className="text-[0.6rem] sm:text-[0.65rem] text-text-muted font-bold flex items-center px-1">
                +{user.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

