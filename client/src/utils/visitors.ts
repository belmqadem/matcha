const AVATAR_COLORS = [
  '#e94057',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
];

/**
 * Returns a deterministic avatar color from the avatar color palette
 * based on a numeric seed (e.g. index in a list).
 */
export function avatarColorFor(seed: number): string {
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

/**
 * Returns a human-readable relative time string, e.g. "3h ago", "just now".
 */
export function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Returns a full date-time string for display in tooltips / secondary text.
 */
export function formatVisitDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
