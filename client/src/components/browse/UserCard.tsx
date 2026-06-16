// src/components/browse/UserCard.tsx
import { useState } from 'react';
import { Heart, MapPin, Sparkles } from 'lucide-react';

import { Spinner } from '@/components/ui/Spinner';
import { FameBadge } from './FameBadge';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import type { BrowseUser } from '@/types/user';

/* --- Local Helpers --- */

function calcAge(birth_date?: string): number | null {
  if (!birth_date) return null;
  return Math.floor((Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function getPhoto(user: BrowseUser): string | null {
  if (!user.photos?.length) return null;
  const main = user.photos.find((p) => p.id === user.profile_picture_id);
  return (main ?? user.photos[0])?.url ?? null;
}

/* --- Avatar Component --- */
function Avatar({ user, isHovered }: { user: BrowseUser; isHovered: boolean }) {
  const [err, setErr] = useState(false);
  const photo = getPhoto(user);

  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={user.first_name}
        onError={() => setErr(true)}
        className={`w-full h-full object-cover block transition-transform duration-700 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
      />
    );
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-extrabold text-text-muted bg-background tracking-tight transition-transform duration-700 ${
        isHovered ? 'scale-110' : 'scale-100'
      }`}
    >
      {user.first_name?.[0] ?? '?'}
      {user.last_name?.[0] ?? ''}
    </div>
  );
}

/* --- Main Card Component --- */
interface UserCardProps {
  user: BrowseUser;
  onLike: (_id: string) => Promise<void>;
  onUnlike: (_id: string) => Promise<void>;
}

export function UserCard({ user, onLike, onUnlike }: UserCardProps) {
  const { openProfile } = useProfileDrawer();
  const [busy, setBusy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const age = calcAge(user.birth_date);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await onLike(user.id);
    } finally {
      setBusy(false);
    }
  };

  const handleUnlikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await onUnlike(user.id);
    } finally {
      setBusy(false);
    }
  };

  const renderActionButton = () => {
    if (user.is_connected) {
      return (
        <button
          onClick={handleUnlikeClick}
          disabled={busy}
          className="flex-1 py-2 sm:py-2.5 rounded-full bg-background text-error border border-error text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:bg-error/10 active:scale-95"
        >
          {busy ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> Unmatch
            </>
          )}
        </button>
      );
    }
    if (user.liked_by_me) {
      return (
        <button
          onClick={handleUnlikeClick}
          disabled={busy}
          className="flex-1 py-2 sm:py-2.5 rounded-full bg-background text-primary border border-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:opacity-80 active:scale-95"
        >
          {busy ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> Unlike
            </>
          )}
        </button>
      );
    }
    return (
      <button
        onClick={handleLikeClick}
        disabled={busy}
        className="flex-1 py-2 sm:py-2.5 rounded-full border-2 border-border bg-primary text-surface text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:border-primary hover:text-surface active:scale-95"
      >
        {busy ? (
          <Spinner size="sm" />
        ) : (
          <>
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors" /> Like
          </>
        )}
      </button>
    );
  };

  return (
    <div
      onClick={() => openProfile(user.id)}
      className="relative z-0 hover:z-10 group bg-surface rounded-3xl overflow-hidden border border-border flex flex-col cursor-pointer transition-all duration-500 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_12px_28px_rgba(233,64,87,0.18)]"
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative aspect-[3/4] overflow-hidden rounded-t-3xl"
      >
        <Avatar user={user} isHovered={isHovered} />

        {/* Overlay (only shows when hovered) */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent pointer-events-none transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Badges (only shows when hovered) */}
        {isHovered && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end animate-fade-in">
            {user.is_connected && (
              <span className="flex items-center gap-1 text-[0.6rem] sm:text-[0.65rem] font-bold tracking-wide bg-primary text-surface rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 shadow-md animate-heart-beat">
                <Sparkles className="w-3 h-3" /> MATCH
              </span>
            )}
            {!user.is_connected && user.liked_me && (
              <span className="text-[0.6rem] sm:text-[0.65rem] font-bold tracking-wide bg-surface/95 backdrop-blur-sm text-primary rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 shadow-sm animate-float-cute">
                Likes you
              </span>
            )}
          </div>
        )}

        {/* Info Overlay (only shows when hovered) */}
        {isHovered && (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 animate-fade-in-up">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="m-0 text-white text-lg sm:text-xl font-extrabold leading-tight truncate drop-shadow-lg">
                  {user.first_name}
                  {age !== null ? <span className="font-normal opacity-90">, {age}</span> : ''}
                </p>
                {(user.distance_km != null || user.location_city) && (
                  <p className="mt-1 sm:mt-1.5 text-white/85 text-[0.65rem] sm:text-xs flex items-center gap-1 sm:gap-1.5 font-medium drop-shadow-md">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                    {user.distance_km != null && (
                      <span>
                        {user.distance_km < 1
                          ? '< 1 km'
                          : `${Number(user.distance_km).toFixed(1)} km`}
                      </span>
                    )}
                    {user.distance_km != null && user.location_city && (
                      <span className="opacity-50">•</span>
                    )}
                    {user.location_city && <span className="truncate">{user.location_city}</span>}
                  </p>
                )}
              </div>
              <FameBadge rating={user.fame_rating} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
        {/* <div className="flex flex-wrap gap-1 sm:gap-1.5 min-h-[24px]">
          {(user.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[0.6rem] sm:text-[0.65rem] font-bold text-text-muted bg-background border border-border rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 transition-colors group-hover:text-primary/80"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div> */}
        <div className="flex gap-2">{renderActionButton()}</div>
      </div>
    </div>
  );
}
