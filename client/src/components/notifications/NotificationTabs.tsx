// src/components/notifications/NotificationTabs.tsx
import type { Notification } from '@/types/notification';
import { NOTIFICATION_FILTERS } from './notificationConstants';

interface NotificationTabsProps {
  activeFilter: string;
  setActiveFilter: (key: string) => void;
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationTabs({
  activeFilter,
  setActiveFilter,
  notifications,
  unreadCount,
}: NotificationTabsProps) {
  return (
    <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-thin snap-x">
      {NOTIFICATION_FILTERS.map((f) => {
        const count = f.types
          ? notifications.filter((n) => f.types!.includes(n.type) && !n.is_read).length
          : unreadCount;
        const active = activeFilter === f.key;

        return (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex-shrink-0 snap-start flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black transition-all duration-150 whitespace-nowrap border active:scale-95 ${
              active
                ? 'bg-primary text-surface border-primary shadow-md shadow-primary/20'
                : 'bg-surface text-text-muted border-border hover:bg-background'
            }`}
          >
            {f.label}
            {count > 0 && (
              <span
                className={`text-[0.6rem] sm:text-[10px] font-black min-w-[1.25rem] sm:min-w-[1.5rem] h-4 sm:h-5 px-1 rounded-full flex items-center justify-center ${
                  active ? 'bg-surface/20 text-surface' : 'bg-primary text-surface'
                }`}
              >
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
