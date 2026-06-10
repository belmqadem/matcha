import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { timeAgo, formatVisitDate, avatarColorFor } from '@/utils/visitors';
import type { Visitor } from '@/types/user';

interface VisitorCardProps {
  visitor: Visitor;
  index: number;
}

export function VisitorCard({ visitor, index }: VisitorCardProps) {
  const navigate = useNavigate();
  const initials = `${visitor.first_name[0]}${visitor.last_name[0]}`.toUpperCase();
  const color = avatarColorFor(index);

  return (
    <div
      onClick={() => navigate(`/profile/${visitor.id}`)}
      className="group flex flex-col bg-white rounded-2xl border border-border overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Photo / avatar */}
      <div className="relative h-[200px] bg-background flex-shrink-0 overflow-hidden">
        {visitor.profile_picture_url ? (
          <img
            src={visitor.profile_picture_url}
            alt={visitor.first_name}
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
          {timeAgo(visitor.visited_at)}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1">
        <p className="text-sm font-bold text-text leading-tight truncate">
          {visitor.first_name} {visitor.last_name}
        </p>
        <p className="text-[11px] text-text-muted truncate">@{visitor.username}</p>
        <p className="text-[10px] text-text-muted flex items-center gap-1 mt-1">
          <Clock size={9} />
          {formatVisitDate(visitor.visited_at)}
        </p>
      </div>
    </div>
  );
}
