// src/components/visitors/VisitorCard.tsx
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
      className="group flex flex-col bg-surface rounded-2xl sm:rounded-3xl border border-border overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative aspect-[4/5] bg-background flex-shrink-0 overflow-hidden">
        {visitor.profile_picture_url ? (
          <img
            src={visitor.profile_picture_url}
            alt={visitor.first_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-[color-mix(in_srgb,var(--avatar-color)_15%,transparent)]"
            style={{ '--avatar-color': color } as React.CSSProperties}
          >
            <span
              className="text-3xl sm:text-4xl font-black text-[var(--avatar-color)]"
              style={{ '--avatar-color': color } as React.CSSProperties}
            >
              {initials}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-text/50 via-transparent to-transparent pointer-events-none" />

        <span className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1 bg-surface/90 backdrop-blur-sm text-text text-[0.65rem] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {timeAgo(visitor.visited_at)}
        </span>
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5">
        <p className="text-sm sm:text-base font-bold text-text leading-tight truncate">
          {visitor.first_name} {visitor.last_name}
        </p>
        <p className="text-[0.65rem] sm:text-xs text-text-muted truncate">@{visitor.username}</p>
        <p className="text-[0.65rem] sm:text-[11px] text-text-muted flex items-center gap-1 mt-1 font-medium">
          <Clock className="w-3 h-3" />
          {formatVisitDate(visitor.visited_at)}
        </p>
      </div>
    </div>
  );
}
