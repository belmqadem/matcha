// src/components/notifications/NotificationTabs.tsx
import type { Notification, NotificationType } from '@/types/notification';

export const NOTIFICATION_FILTERS: { key: string; label: string; types?: NotificationType[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'social', label: 'Likes & Matches', types: ['like', 'match', 'unlike'] },
  { key: 'visits', label: 'Visitors', types: ['visit'] },
  { key: 'messages', label: 'Messages', types: ['message'] },
  { key: 'dates', label: 'Dates', types: ['date_proposed', 'date_accepted', 'date_declined', 'date_cancelled'] },
];

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
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
      {NOTIFICATION_FILTERS.map((f) => {
        // Calculate unread count specifically for this tab
        const count = f.types
          ? notifications.filter((n) => f.types!.includes(n.type) && !n.is_read).length
          : unreadCount;

        const active = activeFilter === f.key;

        return (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[12px] font-black transition-all duration-150 whitespace-nowrap border shadow-sm ${
              active
                ? 'bg-primary text-surface border-primary shadow-primary/25'
                : 'bg-surface text-text-muted border-border hover:bg-background'
            }`}
          >
            {f.label}
            {count > 0 && (
              <span className={`text-[10px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ${
                active ? 'bg-surface/25 text-surface' : 'bg-primary text-surface'
              }`}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
