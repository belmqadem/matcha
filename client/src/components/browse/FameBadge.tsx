// src/components/browse/FameBadge.tsx
import { Star } from 'lucide-react';

interface FameBadgeProps {
  rating: number;
}

export function FameBadge({ rating }: FameBadgeProps) {
  const isHigh = rating >= 80;

  return (
    <span
      className={`flex items-center gap-1 text-[0.65rem] sm:text-xs font-bold border rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 whitespace-nowrap shadow-sm backdrop-blur-sm ${
        isHigh
          ? 'text-primary border-primary bg-primary/10'
          : 'text-text-muted border-border bg-surface/80'
      }`}
    >
      <Star className="w-3 h-3 fill-current" /> {Math.round(rating)}
    </span>
  );
}
