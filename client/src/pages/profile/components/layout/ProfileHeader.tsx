import { Star } from 'lucide-react';
import type { UserProfile } from '../../types';

interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const mainPhoto =
    user.photos?.find((p) => p.id === user.profile_picture_id) ?? user.photos?.[0];
  const initials =
    `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-5 px-5 pb-5 pt-6">
      <div className="flex items-end gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-(--color-background) flex-shrink-0 shadow-md border border-(--color-border)">
            {mainPhoto ? (
              <img src={mainPhoto.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-(--color-primary) text-xl font-bold">
                {initials}
              </div>
            )}
          </div>
          {user.is_online && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
          )}
        </div>

        {/* Name + fame */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-(--color-text) leading-tight">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-xs text-(--color-text-muted) mt-0.5">@{user.username}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star size={10} className="text-(--color-primary)" />
            <span className="text-xs font-semibold text-(--color-primary)">
              {user.fame_rating} fame
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
