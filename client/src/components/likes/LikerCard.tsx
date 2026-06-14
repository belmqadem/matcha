import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timeAgo, formatVisitDate, avatarColorFor } from '@/utils/visitors';
import type { Liker } from '@/types/user';

interface LikerCardProps {
  liker: Liker;
  index: number;
}

export function LikerCard({ liker, index }: LikerCardProps) {
  const navigate = useNavigate();
  const initials = `${liker.first_name[0]}${liker.last_name?.[0] ?? ''}`.toUpperCase();
  const color = avatarColorFor(index);

  return (
    <div
      onClick={() => navigate(`/profile/${liker.id}`)}
      className="group relative flex flex-col bg-surface rounded-2xl border border-border overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Photo / avatar */}
      <div className="relative h-[200px] bg-background shrink-0 overflow-hidden">
        {liker.profile_picture_url ? (
          <img
            src={liker.profile_picture_url}
            alt={liker.first_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <span className="text-4xl font-black" style={{ color }}>
              {initials}
            </span>
          </div>
        )}

        {/* Time badge */}
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
          <Clock size={9} />
          {timeAgo(liker.created_at)}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1">
        <p className="text-sm font-bold text-text leading-tight truncate">
          {liker.first_name} {liker.last_name}
        </p>
        <p className="text-[11px] text-text-muted truncate">@{liker.username}</p>
        <p className="text-[10px] text-text-muted flex items-center gap-1 mt-1">
          <Clock size={9} />
          {formatVisitDate(liker.created_at)}
        </p>
      </div>
    </div>
  );
}
