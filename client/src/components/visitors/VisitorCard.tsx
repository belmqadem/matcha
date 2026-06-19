// src/components/visitors/VisitorCard.tsx
import { Clock } from 'lucide-react';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import { timeAgo, formatVisitDate } from '@/utils/visitors';
import type { Visitor } from '@/types/user';

interface VisitorCardProps {
  visitor: Visitor;
  index: number;
}

export function VisitorCard({ visitor, index }: VisitorCardProps) {
  const { openProfile } = useProfileDrawer();
  const initials = `${visitor.first_name[0]}${visitor.last_name[0]}`.toUpperCase();

  const AVATAR_STYLES = [
    { bg: 'bg-primary/15', text: 'text-primary' },
    { bg: 'bg-primary-light/15', text: 'text-primary-light' },
    { bg: 'bg-primary-accent/15', text: 'text-primary-accent' },
    { bg: 'bg-success/15', text: 'text-success' },
    { bg: 'bg-text-muted/15', text: 'text-text-muted' },
    { bg: 'bg-error/15', text: 'text-error' },
  ];
  const { bg: bgClass, text: textClass } = AVATAR_STYLES[index % AVATAR_STYLES.length];

  return (
    <div
      onClick={() => openProfile(visitor.username)}
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
          <div className={`w-full h-full flex items-center justify-center ${bgClass}`}>
            <span className={`text-3xl sm:text-4xl font-black ${textClass}`}>{initials}</span>
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
