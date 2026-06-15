// src/pages/NotificationsPage.tsx
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

import NotificationTabs from '@/components/notifications/NotificationTabs';
import { NOTIFICATION_FILTERS } from '@/components/notifications/notificationConstants';
import NotificationList from '@/components/notifications/NotificationList';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markRead, deleteOne, markAllRead } =
    useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');

  const filterDef = NOTIFICATION_FILTERS.find((f) => f.key === activeFilter)!;
  const filtered = filterDef.types
    ? notifications.filter((n) => filterDef.types!.includes(n.type))
    : notifications;

  return (
    <div className="relative min-h-[100dvh] bg-background font-primary overflow-x-hidden pb-10">
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight text-text tracking-tight">
              Notifications
            </h1>
            {/* {unreadCount > 0 && (
              <p className="text-xs sm:text-sm mt-1 font-medium text-text-muted">
                {unreadCount} unread
              </p>
            )} */}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[0.65rem] sm:text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-150 active:scale-95 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 uppercase tracking-wider"
            >
              Mark all read
            </button>
          )}
        </div>

        <NotificationTabs
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          notifications={notifications}
          unreadCount={unreadCount}
        />

        {loading ? (
          <div className="flex flex-col gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => {
              const delayClasses = [
                '[animation-delay:0ms]',
                '[animation-delay:60ms]',
                '[animation-delay:120ms]',
                '[animation-delay:180ms]',
                '[animation-delay:240ms]',
                '[animation-delay:300ms]',
              ];
              const delayClass = delayClasses[Math.min(i, delayClasses.length - 1)];
              return (
                <div
                  key={i}
                  className={`h-[72px] sm:h-[84px] rounded-2xl sm:rounded-3xl bg-surface border border-border animate-pulse ${delayClass}`}
                />
              );
            })}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in-up">
            <EmptyNotifications filter={activeFilter} />
          </div>
        ) : (
          <NotificationList notifications={filtered} onRead={markRead} onDelete={deleteOne} />
        )}
      </div>
    </div>
  );
}
