// src/components/notifications/notificationConstants.ts
import type { NotificationType } from '@/types/notification';

export const NOTIFICATION_FILTERS: { key: string; label: string; types?: NotificationType[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'social', label: 'Likes & Matches', types: ['like', 'match', 'unlike'] },
  { key: 'visits', label: 'Visitors', types: ['visit'] },
  { key: 'messages', label: 'Messages', types: ['message'] },
  {
    key: 'dates',
    label: 'Dates',
    types: ['date_proposed', 'date_accepted', 'date_declined', 'date_cancelled'],
  },
];
