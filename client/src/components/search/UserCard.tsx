import { useState } from 'react';
import { Loader2, Heart, MapPin, Flame, Sparkles, Circle } from 'lucide-react';
import { calculateAge } from '@/utils/age';
import { getPhotoUrl, getInitials } from '@/utils/user';
import type { BrowseUser } from '@/types/user';

interface UserCardProps {
  user: BrowseUser;
  onLike: (id: string) => Promise<{ connected: boolean }>;
  onUnlike: (id: string) => Promise<void>;
}

export function UserCard({ user, onLike, onUnlike }: UserCardProps) {
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
      // silent fail — server errors don't need to surface on the card
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      href={`/profile/${user.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
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
            <span className="text-4xl font-black text-text-muted select-none">{initials}</span>
          </div>
        )}

        {/* Online badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border shadow-sm ${
            user.is_online
              ? 'bg-white/90 text-primary border-primary/20'
              : 'bg-black/40 text-white/90 border-white/20'
          }`}
        >
          <Circle
            className={`w-2 h-2 fill-current ${user.is_online ? 'text-primary' : 'text-white/50'}`}
          />
          {user.is_online ? 'Online' : 'Offline'}
        </div>

        {/* Match badge */}
        {connected && (
          <div className="absolute top-3 right-3 bg-primary/95 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles size={10} /> MATCH
          </div>
        )}

        {/* Like button */}
        <button
          onClick={handleLikeToggle}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 backdrop-blur-sm ${
            liked
              ? 'bg-primary text-white scale-110'
              : 'bg-white/90 text-text-muted hover:text-primary hover:scale-110'
          }`}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          )}
        </button>

        {/* Likes you badge */}
        {user.liked_me && !connected && (
          <div className="absolute bottom-3 left-3 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20">
            Likes you ♥
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-text text-sm leading-tight truncate">
              {user.first_name}
              {age ? `, ${age}` : ''}
            </p>
            <p className="text-[11px] text-text-muted truncate">@{user.username}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
            <Flame size={11} className="text-primary" />
            <span className="text-[11px] font-bold text-primary">
              {Math.round(user.fame_rating)}
            </span>
          </div>
        </div>

        {(user.location_city || user.distance_km != null) && (
          <div className="flex items-center gap-1 text-[11px] text-text-muted mt-1">
            <MapPin size={10} />
            <span className="truncate">
              {user.location_city ?? ''}
              {user.distance_km != null ? ` · ${Math.round(user.distance_km)} km` : ''}
            </span>
          </div>
        )}

        {user.tags && user.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {user.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-background text-text-muted px-2 py-0.5 rounded-full font-medium border border-border"
              >
                #{tag}
              </span>
            ))}
            {user.tags.length > 3 && (
              <span className="text-[10px] text-text-muted">+{user.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
