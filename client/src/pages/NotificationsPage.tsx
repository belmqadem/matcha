// src/pages/NotificationsPage.tsx
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import FloatingHearts from '@/components/FloatingHearts';
import NotificationTabs, { NOTIFICATION_FILTERS } from '@/components/notifications/NotificationTabs';
import NotificationList from '@/components/notifications/NotificationList';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markRead, deleteOne, markAllRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter derivation based on active tab
  const filterDef = NOTIFICATION_FILTERS.find((f) => f.key === activeFilter)!;
  const filtered = filterDef.types
    ? notifications.filter((n) => filterDef.types!.includes(n.type))
    : notifications;

  return (
    <div className="relative min-h-screen bg-background font-primary overflow-x-hidden">
      <FloatingHearts />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black leading-tight text-text">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[13px] mt-0.5 font-medium text-text-muted">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[12px] font-black px-4 py-2 rounded-2xl transition-all duration-150 active:scale-95 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Separated Tabs Component */}
        <NotificationTabs
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          notifications={notifications}
          unreadCount={unreadCount}
        />

        {/* Content Rendering */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[76px] rounded-2xl bg-border animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyNotifications filter={activeFilter} />
        ) : (
          <NotificationList
            notifications={filtered}
            onRead={markRead}
            onDelete={deleteOne}
          />
        )}
      </div>
    </div>
  );
}
