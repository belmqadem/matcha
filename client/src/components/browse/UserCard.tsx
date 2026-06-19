import { useState } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { FameBadge } from './FameBadge';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import type { BrowseUser } from '@/types/user';

function calcAge(birth_date?: string): number | null {
  if (!birth_date) return null;
  return Math.floor((Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function getPhoto(user: BrowseUser): string | null {
  if (!user.photos?.length) return null;
  const main = user.photos.find((p) => p.id === user.profile_picture_id);
  return (main ?? user.photos[0])?.url ?? null;
}

interface UserCardProps {
  user: BrowseUser;
  onLike: (_id: string) => Promise<void>;
  onUnlike: (_id: string) => Promise<void>;
}

export function UserCard({ user, onLike, onUnlike }: UserCardProps) {
  const { openProfile } = useProfileDrawer();
  const [imgErr, setImgErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const age = calcAge(user.birth_date);
  const photo = getPhoto(user);
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`;

  const distanceLabel =
    user.distance_km != null
      ? user.distance_km < 1
        ? '< 1 km'
        : `${Number(user.distance_km).toFixed(1)} km`
      : null;

  const isLiked = user.liked_by_me || user.is_connected;

  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (isLiked) await onUnlike(user.id);
      else await onLike(user.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={() => openProfile(user.username)}
      className="relative rounded-3xl overflow-hidden bg-surface border border-border shadow-md cursor-pointer group select-none"
    >
      {/* Photo */}
      <div className="aspect-3/4 relative overflow-hidden">
        {photo && !imgErr ? (
          <img
            src={photo}
            alt={user.first_name}
            draggable={false}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-extrabold text-text-muted bg-background">
            {initials || '?'}
          </div>
        )}

        {/* Gradient overlay — always visible */}
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

        {/* FameBadge */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <FameBadge rating={user.fame_rating} />
        </div>

        {/* Status badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {user.is_connected && (
            <span className="text-[0.6rem] font-black tracking-wide bg-primary text-white rounded-full px-2.5 py-0.5 shadow-md">
              Match ✨
            </span>
          )}
          {!user.is_connected && user.liked_me && (
            <span className="text-[0.6rem] font-black tracking-wide bg-surface/90 backdrop-blur-sm text-primary rounded-full px-2.5 py-0.5 shadow-sm">
              Likes you ♡
            </span>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 pb-3">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Name + age + online */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-white font-extrabold text-base leading-tight drop-shadow-lg">
                  {user.first_name}
                  {age !== null && <span className="font-normal opacity-90">, {age}</span>}
                </h2>
                {user.is_online && (
                  <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_5px_#4ade80] shrink-0" />
                )}
              </div>

              {/* Location */}
              {(distanceLabel || user.location_city) && (
                <p className="text-white/75 text-xs flex items-center gap-1 mt-0.5 drop-shadow">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {distanceLabel}
                  {distanceLabel && user.location_city && (
                    <span className="opacity-50 mx-0.5">·</span>
                  )}
                  {user.location_city}
                </p>
              )}

              {/* Tags */}
              {(user.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(user.tags ?? []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.6rem] font-medium text-white/85 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Like / Unlike button */}
            <button
              onClick={handleActionClick}
              disabled={busy}
              aria-label={isLiked ? 'Unlike' : 'Like'}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-50 shadow-lg ${
                isLiked
                  ? 'bg-primary text-white'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-primary'
              }`}
            >
              {busy ? (
                <Spinner size="sm" />
              ) : (
                <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-current' : ''}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
