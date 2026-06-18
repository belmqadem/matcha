// src/pages/NotificationsPage.tsx
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NOTIFICATION_FILTERS } from '@/components/notifications/notificationConstants';
import NotificationTabs from '@/components/notifications/NotificationTabs';
import NotificationList from '@/components/notifications/NotificationList';
import EmptyNotifications from '@/components/notifications/EmptyNotifications';

const DELAY_CLASSES = [
  '[animation-delay:0ms]',
  '[animation-delay:60ms]',
  '[animation-delay:120ms]',
  '[animation-delay:180ms]',
  '[animation-delay:240ms]',
  '[animation-delay:300ms]',
];

export default function NotificationsPage() {
  const { notifications, loading, error, unreadCount, markOneAsRead, deleteOne, markAllRead } =
    useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');

  const activeFilterDef = NOTIFICATION_FILTERS.find((f) => f.key === activeFilter);
  const filtered = activeFilterDef?.types
    ? notifications.filter((n) => activeFilterDef.types!.includes(n.type))
    : notifications;

  return (
    <div className="flex flex-col flex-1 relative overflow-x-hidden pb-10">
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight text-text tracking-tight">
              Notifications
            </h1>
            {!loading && !error && (
              <p className="text-sm text-text-muted mt-1">
                {notifications.length === 0
                  ? 'Nothing here yet'
                  : `${notifications.length} total`}
              </p>
            )}
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

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-error/10 border border-error/20 text-sm font-medium text-error animate-fade-in-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && notifications.length > 0 && (
          <NotificationTabs
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            notifications={notifications}
            unreadCount={unreadCount}
          />
        )}

        {/* Body */}
        {loading ? (
          <div className="flex flex-col gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-[72px] sm:h-[84px] rounded-2xl sm:rounded-3xl bg-surface border border-border animate-pulse ${DELAY_CLASSES[i]}`}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in-up">
            <EmptyNotifications filter={activeFilter} />
          </div>
        ) : (
          <NotificationList
            notifications={filtered}
            onRead={markOneAsRead}
            onDelete={deleteOne}
          />
        )}
      </div>
    </div>
  );
}
