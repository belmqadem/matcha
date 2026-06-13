// src/components/visitors/VisitorStats.tsx
import { useMemo } from 'react';
import type { Visitor } from '@/types/user';

interface VisitorStatsProps {
  visitors: Visitor[];
}

export function VisitorStats({ visitors }: VisitorStatsProps) {
  const stats = useMemo(() => {
    const DAY_MS = 86_400_000;
    const now = Date.now();
    const today = visitors.filter(
      (v) => now - new Date(v.visited_at).getTime() < DAY_MS,
    ).length;

    const week = visitors.filter(
      (v) => now - new Date(v.visited_at).getTime() < 7 * DAY_MS,
    ).length;

    return [
      { label: 'Total visitors', value: visitors.length },
      { label: 'Last 24h', value: today },
      { label: 'Last 7 days', value: week },
    ];
  }, [visitors]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="bg-surface rounded-2xl sm:rounded-3xl border border-border px-5 sm:px-6 py-4 sm:py-5 shadow-sm"
        >
          <p className="text-xs sm:text-sm text-text-muted font-bold tracking-wide uppercase mb-1 sm:mb-2">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-primary leading-none">{value}</p>
        </div>
      ))}
    </div>
  );
}
