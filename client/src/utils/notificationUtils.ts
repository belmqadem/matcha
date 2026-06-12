// src/utils/notificationUtils.ts
import type { Notification } from '@/types/notification';

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function groupByDate(
  notifications: Notification[],
): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const now = new Date();

  for (const n of notifications) {
    const diffDays = Math.floor((now.getTime() - new Date(n.created_at).getTime()) / 86400000);
    const label =
      diffDays === 0
        ? 'Today'
        : diffDays === 1
          ? 'Yesterday'
          : diffDays < 7
            ? 'This week'
            : 'Earlier';
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return ['Today', 'Yesterday', 'This week', 'Earlier']
    .filter((l) => groups[l])
    .map((label) => ({ label, items: groups[label] }));
}
