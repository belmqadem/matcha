import { useState, useRef } from 'react';
import { Heart, X, MapPin } from 'lucide-react';
import { FameBadge } from './FameBadge';
import { Spinner } from '@/components/ui/Spinner';
import { useSwipe } from '@/hooks/useSwipe';
import type { BrowseUser } from '@/types/user';

interface SwipeCardProps {
  user: BrowseUser;
  onLike: () => Promise<unknown> | unknown;
  onPass: () => void;
  onUnlike: () => Promise<unknown> | unknown;
  onViewProfile?: () => void;
  /** Pixels to translate for a button-triggered exit animation (set by SwipeStack). */
  exitX?: number;
  style?: React.CSSProperties;
  isTop: boolean;
}

function calcAge(birth_date?: string): number | null {
  if (!birth_date) return null;
  return Math.floor((Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function getPhoto(user: BrowseUser): string | null {
  if (!user.photos?.length) return null;
  const main = user.photos.find((p) => p.id === user.profile_picture_id);
  return (main ?? user.photos[0])?.url ?? null;
}

export function SwipeCard({ user, onLike, onPass, onUnlike, onViewProfile, exitX, style, isTop }: SwipeCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const clickStartX = useRef(0);

  const age = calcAge(user.birth_date);
  const photo = getPhoto(user);
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`;

  // Gesture swipe is disabled while a button-triggered exit is in flight
  const { dragX, dragY, isDragging, handlers } = useSwipe({
    onSwipeRight: onLike,
    onSwipeLeft: onPass,
    enabled: isTop && exitX === undefined,
  });

  // Button-triggered exitX takes priority over the gesture drag value
  const tx = exitX !== undefined ? exitX : dragX;
  const ty = exitX !== undefined ? 0 : dragY;
  const rot = tx * 0.08;

  const likeOpacity = dragX > 15 ? Math.min(1, (dragX - 15) / 70) : 0;
  const passOpacity = dragX < -15 ? Math.min(1, (-dragX - 15) / 70) : 0;

  const distanceLabel =
    user.distance_km != null
      ? user.distance_km < 1
        ? '< 1 km'
        : `${Number(user.distance_km).toFixed(1)} km`
      : null;

  const handleLike = () => {
    if (busy) return;
    setBusy(true);
    Promise.resolve(onLike()).finally(() => setBusy(false));
  };

  const handlePass = () => {
    if (busy) return;
    onPass();
  };

  const handleUnlike = () => {
    if (busy) return;
    setBusy(true);
    Promise.resolve(onUnlike()).finally(() => setBusy(false));
  };

  return (
    <div className="flex flex-col gap-4" style={style}>
      {/* ── Card ── */}
      <div
        className="relative w-full rounded-3xl overflow-hidden bg-surface border border-border shadow-2xl select-none"
        style={{
          height: '100%',
          transform: isTop
            ? `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`
            : undefined,
          // Always animate when exiting via button; no transition while dragging
          transition:
            exitX !== undefined
              ? 'transform 0.35s ease'
              : isDragging
                ? 'none'
                : 'transform 0.35s ease',
          cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default',
          willChange: 'transform',
        }}
        {...(isTop
          ? {
              onMouseDown: (e: React.MouseEvent) => {
                clickStartX.current = e.clientX;
                handlers.onMouseDown(e);
              },
              onTouchStart: (e: React.TouchEvent) => {
                clickStartX.current = e.touches[0].clientX;
                handlers.onTouchStart(e);
              },
              onClick: (e: React.MouseEvent) => {
                if (Math.abs(e.clientX - clickStartX.current) < 10 && exitX === undefined) {
                  onViewProfile?.();
                }
              },
            }
          : {})}
      >
        {/* Photo */}
        <div className="absolute inset-0">
          {photo && !imgErr ? (
            <img
              src={photo}
              alt={user.first_name}
              draggable={false}
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl font-extrabold text-text-muted bg-background">
              {initials || '?'}
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

        {/* FameBadge */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <FameBadge rating={user.fame_rating} />
        </div>

        {/* LIKE badge */}
        {likeOpacity > 0 && (
          <div
            className="absolute top-12 left-5 -rotate-12 pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            <span className="text-2xl font-black text-green-400 border-4 border-green-400 px-4 py-1 rounded-xl tracking-widest">
              YES
            </span>
          </div>
        )}

        {/* PASS badge */}
        {passOpacity > 0 && (
          <div
            className="absolute top-12 right-5 rotate-12 pointer-events-none"
            style={{ opacity: passOpacity }}
          >
            <span className="text-2xl font-black text-error border-4 border-error px-4 py-1 rounded-xl tracking-widest">
              NOPE
            </span>
          </div>
        )}

        {/* Info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 pb-6 pointer-events-none">
          <div className="flex items-end gap-2 mb-1.5">
            <h2 className="text-2xl font-extrabold text-white drop-shadow-lg leading-tight">
              {user.first_name}
              {age !== null && <span className="font-normal opacity-90">, {age}</span>}
            </h2>
            {user.is_online && (
              <span className="mb-1 w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] shrink-0" />
            )}
          </div>

          {(distanceLabel || user.location_city) && (
            <p className="text-white/80 text-sm flex items-center gap-1 mb-3 drop-shadow">
              <MapPin className="w-4 h-4 shrink-0" />
              {distanceLabel}
              {distanceLabel && user.location_city && <span className="opacity-50 mx-0.5">·</span>}
              {user.location_city}
            </p>
          )}

          {!!user.tags?.length && (
            <div className="flex flex-wrap gap-1.5">
              {user.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons (top card only) ── */}
      {isTop && (
        <div className="mt-4 flex items-center justify-center gap-4 sm:gap-8">
          {/* Pass */}
          <button
            onClick={handlePass}
            disabled={busy}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-surface text-text-muted shadow-md transition-all hover:border-primary hover:text-primary active:scale-95 disabled:opacity-50"
            aria-label="Pass"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Like / Unlike */}
          <button
            onClick={user.liked_by_me ? handleUnlike : handleLike}
            disabled={busy}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_20px_rgba(233,64,87,0.45)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            aria-label={user.liked_by_me ? 'Unlike' : 'Like'}
          >
            {busy ? (
              <Spinner size="sm" />
            ) : (
              <Heart className={`w-6 h-6 ${user.liked_by_me ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
