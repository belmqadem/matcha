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
    <div className="flex flex-col gap-6">
      {groups.map(({ label, items }) => (
        <div key={label}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-text-muted">
              {label}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex flex-col gap-2">
            {items.map((n, i) => (
              <div key={n.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
                <NotificationRow notification={n} onRead={onRead} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
