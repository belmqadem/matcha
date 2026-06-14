// src/components/dates/DateTabs.tsx
import type { DateEntry } from '@/types/date';

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
    { key: 'upcoming', label: 'upcoming', count: upcomingCount },
    { key: 'pending',  label: 'pending',  count: pendingCount  },
    { key: 'past',     label: 'past'                           },
    { key: 'all',      label: 'all',      count: dates.length  },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-surface border border-border/60">
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs transition-all duration-150 ${
              active
                ? 'bg-primary text-surface shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ${
                  active ? 'bg-surface/20 text-surface' : 'bg-border text-text-muted'
                }`}
              >
                {t.count > 99 ? '99+' : t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
