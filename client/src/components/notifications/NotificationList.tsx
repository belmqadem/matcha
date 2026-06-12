// src/components/notifications/NotificationList.tsx
import NotificationRow from '@/components/notifications/NotificationRow';
import { groupByDate } from '@/utils/notificationUtils';
import type { Notification } from '@/types/notification';

interface NotificationListProps {
  notifications: Notification[];
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function NotificationList({ notifications, onRead, onDelete }: NotificationListProps) {
  const groups = groupByDate(notifications);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {groups.map(({ label, items }) => (
        <div key={label}>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <span className="text-[0.65rem] sm:text-xs font-black uppercase tracking-widest text-text-muted">
              {label}
            </span>
            <div className="flex-1 h-[2px] bg-border" />
          </div>
          <div className="flex flex-col gap-2 sm:gap-3">
            {items.map((n, i) => (
              <div
                key={n.id}
                className="animate-fade-in-up [animation-delay:var(--delay)] [animation-fill-mode:both]"
                style={{ '--delay': `${i * 40}ms` } as React.CSSProperties}
              >
                <NotificationRow notification={n} onRead={onRead} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
