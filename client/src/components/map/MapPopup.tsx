import { X, Heart, Star, MapPin } from 'lucide-react';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import { getInitials, fmtDist } from '@/utils/map';
import type { MapUser } from '@/types/map';

interface MapPopupProps {
  user: MapUser;
  isLiked: boolean;
  onClose: () => void;
  onLike: () => void;
}

export default function MapPopup({ user, isLiked, onClose, onLike }: MapPopupProps) {
  const { openProfile } = useProfileDrawer();
  return (
    <div className="absolute bottom-0 left-0 right-0 md:bottom-6 md:left-6 z-[1000] bg-surface border-t md:border border-border rounded-t-2xl md:rounded-2xl p-4 w-full md:w-[300px] shadow-xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex gap-3 items-start">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-black bg-primary/10 text-primary border border-primary/20 overflow-hidden">
            {user.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(user.first_name, user.last_name)
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <span className="text-[15px] font-black text-text truncate">
              {user.first_name} {user.last_name}
            </span>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-primary transition-colors p-1 -mr-1 -mt-1"
            >
              <X size={16} />
            </button>
          </div>
          <div className="text-[12px] font-bold text-text-muted mt-0.5 truncate">
            @{user.username}
          </div>
          <div className="flex flex-col gap-0.5 mt-1 text-[12px] font-bold text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {user.location_city} ({fmtDist(user.distance_km)})
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} className="text-primary" /> {parseFloat(user.fame_rating).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {user.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {user.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={onLike}
          className={`flex-1 py-2.5 rounded-full text-[12px] font-bold transition-all border flex items-center justify-center gap-1.5 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
            isLiked
              ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
              : 'bg-transparent border-primary text-primary hover:bg-primary/10'
          }`}
        >
          <Heart size={14} className={isLiked ? 'fill-white text-white' : 'text-primary'} />
          {isLiked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={() => openProfile(user.id)}
          className="flex-1 py-2.5 rounded-full text-[12px] font-bold bg-text text-surface hover:bg-text/90 transition-all hover:scale-[1.03] active:scale-[0.97] text-center flex items-center justify-center shadow-md cursor-pointer"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
