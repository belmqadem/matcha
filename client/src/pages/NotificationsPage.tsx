import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | 'like'
  | 'visit'
  | 'message'
  | 'match'
  | 'unlike'
  | 'date_proposed'
  | 'date_accepted'
  | 'date_declined'
  | 'date_cancelled';

interface Notification {
  id: number;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  from_id: string;
  from_username: string;
  from_first_name: string;
  from_last_name: string;
  from_profile_picture_id: string | null;
  from_profile_picture_url: string | null;
}

interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API = '/api';

const TYPE_META: Record<
  NotificationType,
  { icon: string; label: (name: string) => string; accent: string; bg: string }
> = {
  like: {
    icon: '♥',
    label: (n) => `${n} liked your profile`,
    accent: '#e94057',
    bg: 'rgba(233,64,87,0.08)',
  },
  match: {
    icon: '✦',
    label: (n) => `You matched with ${n}!`,
    accent: '#e94057',
    bg: 'rgba(233,64,87,0.12)',
  },
  unlike: {
    icon: '♡',
    label: (n) => `${n} unliked you`,
    accent: '#9ca3af',
    bg: 'rgba(156,163,175,0.08)',
  },
  visit: {
    icon: '◉',
    label: (n) => `${n} visited your profile`,
    accent: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
  },
  message: {
    icon: '✉',
    label: (n) => `${n} sent you a message`,
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
  },
  date_proposed: {
    icon: '◈',
    label: (n) => `${n} proposed a date`,
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  date_accepted: {
    icon: '◈',
    label: (n) => `${n} accepted your date`,
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
  },
  date_declined: {
    icon: '◈',
    label: (n) => `${n} declined your date`,
    accent: '#9ca3af',
    bg: 'rgba(156,163,175,0.08)',
  },
  date_cancelled: {
    icon: '◈',
    label: (n) => `${n} cancelled your date`,
    accent: '#9ca3af',
    bg: 'rgba(156,163,175,0.08)',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {};
  const now = new Date();

  for (const n of notifications) {
    const d = new Date(n.created_at);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    let label: string;
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = 'This week';
    else label = 'Earlier';

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  const order = ['Today', 'Yesterday', 'This week', 'Earlier'];
  return order.filter((l) => groups[l]).map((label) => ({ label, items: groups[label] }));
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  notification,
  accent,
}: {
  notification: Notification;
  accent: string;
}) {
  if (notification.from_profile_picture_url) {
    return (
      <img
        src={notification.from_profile_picture_url}
        alt={notification.from_first_name}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        style={{ border: `2.5px solid ${accent}` }}
      />
    );
  }
  const initials =
    `${notification.from_first_name[0] ?? ''}${notification.from_last_name[0] ?? ''}`.toUpperCase();
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
      style={{ background: accent, border: `2.5px solid ${accent}` }}
    >
      {initials}
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
  onDelete,
  style,
}: {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  style?: React.CSSProperties;
}) {
  const navigate = useNavigate();
  const meta = TYPE_META[notification.type];
  const [deleting, setDeleting] = useState(false);

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    if (notification.type === 'message') {
      navigate(`/chat/${notification.from_id}`);
    } else if (
      notification.type !== 'unlike' &&
      notification.type !== 'date_cancelled' &&
      notification.type !== 'date_declined'
    ) {
      navigate(`/profile/${notification.from_id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    setTimeout(() => onDelete(notification.id), 280);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: notification.is_read ? 'white' : meta.bg,
        border: `1px solid ${notification.is_read ? 'var(--color-border)' : meta.accent + '30'}`,
        opacity: deleting ? 0 : 1,
        transform: deleting ? 'translateX(40px)' : undefined,
        transition: 'opacity 0.28s ease, transform 0.28s ease, box-shadow 0.15s ease',
        boxShadow: notification.is_read
          ? '0 1px 4px rgba(0,0,0,0.04)'
          : `0 2px 12px ${meta.accent}18`,
        ...style,
      }}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <div
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: meta.accent }}
        />
      )}

      {/* Avatar */}
      <Avatar notification={notification} accent={meta.accent} />

      {/* Icon badge */}
      <div
        className="absolute left-11 bottom-2.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
        style={{ background: meta.accent }}
      >
        {meta.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug"
          style={{
            fontFamily: 'Fraunces, serif',
            color: 'var(--color-text)',
            fontWeight: notification.is_read ? 400 : 600,
          }}
        >
          {meta.label(notification.from_first_name)}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'Fraunces, serif' }}
        >
          @{notification.from_username} · {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Delete btn */}
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-100"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS: { key: string; label: string; types?: NotificationType[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'social', label: 'Likes & Matches', types: ['like', 'match', 'unlike'] },
  { key: 'visits', label: 'Visitors', types: ['visit'] },
  { key: 'messages', label: 'Messages', types: ['message'] },
  { key: 'dates', label: 'Dates', types: ['date_proposed', 'date_accepted', 'date_declined', 'date_cancelled'] },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  const messages: Record<string, { icon: string; text: string }> = {
    all: { icon: '◎', text: "You're all caught up. Go explore!" },
    social: { icon: '♡', text: 'No likes or matches yet. Keep browsing.' },
    visits: { icon: '◉', text: "Nobody's stopped by yet." },
    messages: { icon: '✉', text: 'No messages. Start a conversation!' },
    dates: { icon: '◈', text: 'No date proposals yet.' },
  };
  const { icon, text } = messages[filter] ?? messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="text-5xl"
        style={{ color: 'var(--color-primary)', opacity: 0.3, fontFamily: 'Fraunces, serif' }}
      >
        {icon}
      </div>
      <p
        className="text-sm italic"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'Fraunces, serif' }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`${API}/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });
  }, []);

  const deleteOne = useCallback(async (id: number) => {
    const n = notifications.find((x) => x.id === id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    if (n && !n.is_read) setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`${API}/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }, [notifications]);

  const markAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await fetch(`${API}/notifications/read-all`, {
      method: 'PATCH',
      credentials: 'include',
    });
    setMarkingAll(false);
  }, [markingAll, unreadCount]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filterDef = FILTERS.find((f) => f.key === activeFilter)!;
  const filtered = filterDef.types
    ? notifications.filter((n) => filterDef.types!.includes(n.type))
    : notifications;

  const groups = groupByDate(filtered);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-background)', fontFamily: 'Fraunces, serif' }}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .notif-row { animation: slideIn 0.32s ease both; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold leading-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'Fraunces, serif' }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {unreadCount} unread
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150"
              style={{
                color: 'var(--color-primary)',
                background: 'rgba(233,64,87,0.08)',
                opacity: markingAll ? 0.5 : 1,
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => {
            const count =
              f.types
                ? notifications.filter((n) => f.types!.includes(n.type) && !n.is_read).length
                : unreadCount;
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-150 whitespace-nowrap"
                style={{
                  background: active ? 'var(--color-primary)' : 'white',
                  color: active ? 'white' : 'var(--color-text-muted)',
                  border: active ? 'none' : '1px solid var(--color-border)',
                  boxShadow: active ? '0 4px 14px rgba(233,64,87,0.25)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: active ? 'rgba(255,255,255,0.3)' : 'var(--color-primary)',
                      color: active ? 'white' : 'white',
                    }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl animate-pulse"
                style={{ background: '#e5e7eb', animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(({ label, items }) => (
              <div key={label}>
                {/* Group label */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {label}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-2">
                  {items.map((n, i) => (
                    <div
                      key={n.id}
                      className="notif-row"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <NotificationRow
                        notification={n}
                        onRead={markRead}
                        onDelete={deleteOne}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
