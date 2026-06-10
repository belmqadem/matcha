// src/components/dates/DateTabs.tsx
import type { DateEntry } from '@/types/date';
import { isPast } from '@/utils/dateUtils';

export type TabFilter = 'upcoming' | 'pending' | 'past' | 'all';

interface DateTabsProps {
  tab: TabFilter;
  setTab: (t: TabFilter) => void;
  dates: DateEntry[];
  upcomingCount: number;
}

export default function DateTabs({ tab, setTab, dates, upcomingCount }: DateTabsProps) {
  const pendingCount = dates.filter((d) => d.status === 'pending').length;

  const TABS: { key: TabFilter; label: string; count?: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All', count: dates.length },
  ];

  return (
    <div className="flex gap-2 border-b border-border bg-surface px-6 pt-4 mt-3">
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl border-b-2 text-[13px] font-medium transition-all ${
              active
                ? 'bg-background border-primary text-primary font-bold'
                : 'bg-transparent border-transparent text-text-muted hover:text-text'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-primary text-surface' : 'bg-border text-text-muted'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
