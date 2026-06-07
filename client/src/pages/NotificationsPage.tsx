import { useEffect, useState, useCallback, useRef } from 'react';
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

// All accents now use only --color-primary, --color-text-muted, --color-error
const TYPE_META: Record<
  NotificationType,
  { icon: string; label: (name: string) => string; accent: string; bg: string }
> = {
  like: {
    icon: '♥',
    label: (n) => `${n} liked your profile`,
    accent: 'var(--color-primary)',
    bg: 'rgba(233,64,87,0.07)',
  },
  match: {
    icon: '✦',
    label: (n) => `You matched with ${n}!`,
    accent: 'var(--color-primary)',
    bg: 'rgba(233,64,87,0.1)',
  },
  unlike: {
    icon: '♡',
    label: (n) => `${n} unliked you`,
    accent: 'var(--color-text-muted)',
    bg: 'rgba(107,114,128,0.06)',
  },
  visit: {
    icon: '◉',
    label: (n) => `${n} visited your profile`,
    accent: 'var(--color-text)',
    bg: 'rgba(26,26,46,0.05)',
  },
  message: {
    icon: '✉',
    label: (n) => `${n} sent you a message`,
    accent: 'var(--color-primary)',
    bg: 'rgba(233,64,87,0.07)',
  },
  date_proposed: {
    icon: '◈',
    label: (n) => `${n} proposed a date`,
    accent: 'var(--color-text)',
    bg: 'rgba(26,26,46,0.05)',
  },
  date_accepted: {
    icon: '◈',
    label: (n) => `${n} accepted your date`,
    accent: 'var(--color-primary)',
    bg: 'rgba(233,64,87,0.07)',
  },
  date_declined: {
    icon: '◈',
    label: (n) => `${n} declined your date`,
    accent: 'var(--color-error)',
    bg: 'rgba(220,38,38,0.06)',
  },
  date_cancelled: {
    icon: '◈',
    label: (n) => `${n} cancelled your date`,
    accent: 'var(--color-text-muted)',
    bg: 'rgba(107,114,128,0.06)',
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
    const diffDays = Math.floor((now.getTime() - new Date(n.created_at).getTime()) / 86400000);
    const label = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? 'This week' : 'Earlier';
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  const order = ['Today', 'Yesterday', 'This week', 'Earlier'];
  return order.filter((l) => groups[l]).map((label) => ({ label, items: groups[label] }));
}

// ─── Floating Hearts ──────────────────────────────────────────────────────────

function FloatingHearts() {
  const hearts = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      size: Math.random() * 16 + 8,
      left: Math.random() * 100,
      duration: Math.random() * 14 + 18,
      delay: -(Math.random() * 28),
      wobble: Math.random() * 30 + 15,
      opacity: Math.random() * 0.07 + 0.03,
    }))
  ).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute"
          style={{
            bottom: '-60px',
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            color: 'var(--color-primary)',
            opacity: h.opacity,
            animation: `floatHeart ${h.duration}s ease-in-out ${h.delay}s infinite`,
            ['--wobble' as any]: `${h.wobble}px`,
          }}
        >
          ♥
        </div>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ notification, accent }: { notification: Notification; accent: string }) {
  const initials = `${notification.from_first_name[0] ?? ''}${notification.from_last_name[0] ?? ''}`.toUpperCase();

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

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-black"
      style={{
        background: accent,
        border: `2.5px solid ${accent}`,
        color: 'white',
      }}
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
}: {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
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
      className="group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer"
      style={{
        background: notification.is_read ? 'white' : meta.bg,
        border: `1.5px solid ${notification.is_read ? 'var(--color-border)' : 'transparent'}`,
        opacity: deleting ? 0 : 1,
        transform: deleting ? 'translateX(32px)' : 'none',
        transition: 'opacity 0.28s ease, transform 0.28s ease, box-shadow 0.15s ease, background 0.15s ease',
        boxShadow: notification.is_read
          ? '0 1px 4px rgba(0,0,0,0.04)'
          : '0 2px 12px rgba(233,64,87,0.1)',
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
      <div className="relative">
        <Avatar notification={notification} accent={meta.accent} />
        {/* Icon badge */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm"
          style={{ background: meta.accent, color: 'white' }}
        >
          {meta.icon}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] leading-snug"
          style={{
            color: 'var(--color-text)',
            fontWeight: notification.is_read ? 500 : 700,
          }}
        >
          {meta.label(notification.from_first_name)}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          @{notification.from_username} · {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Delete btn */}
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          color: 'var(--color-text-muted)',
          background: 'var(--color-background)',
        }}
        aria-label="Dismiss"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
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
    all:      { icon: '♡', text: "You're all caught up. Go explore!" },
    social:   { icon: '♡', text: 'No likes or matches yet. Keep browsing.' },
    visits:   { icon: '◉', text: "Nobody's stopped by yet." },
    messages: { icon: '✉', text: 'No messages. Start a conversation!' },
    dates:    { icon: '◈', text: 'No date proposals yet.' },
  };
  const { icon, text } = messages[filter] ?? messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-5xl" style={{ color: 'var(--color-primary)', opacity: 0.25 }}>
        {icon}
      </div>
      <p className="text-[14px] italic" style={{ color: 'var(--color-text-muted)' }}>
        {text}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  // Derived — always in sync with notifications array, never drifts
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
  }, []);

  const deleteOne = useCallback(async (id: number) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    await fetch(`${API}/notifications/${id}`, { method: 'DELETE', credentials: 'include' });
  }, []);

  const markAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await fetch(`${API}/notifications/read-all`, { method: 'PATCH', credentials: 'include' });
    setMarkingAll(false);
  }, [markingAll, unreadCount]);

  const filterDef = FILTERS.find((f) => f.key === activeFilter)!;
  const filtered = filterDef.types
    ? notifications.filter((n) => filterDef.types!.includes(n.type))
    : notifications;
  const groups = groupByDate(filtered);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'var(--color-background)', fontFamily: 'var(--font-primary)' }}
    >
      <style>{`
        @keyframes floatHeart {
          0%   { transform: translateY(0) translateX(0) rotate(-12deg) scale(0.7); opacity: 0; }
          8%   { opacity: 1; }
          30%  { transform: translateY(-30vh) translateX(var(--wobble)) rotate(8deg) scale(1.1); }
          55%  { transform: translateY(-60vh) translateX(calc(var(--wobble) * -0.6)) rotate(-6deg) scale(0.9); }
          80%  { transform: translateY(-88vh) translateX(var(--wobble)) rotate(10deg) scale(1.05); }
          92%  { opacity: 0.5; }
          100% { transform: translateY(-110vh) translateX(0) rotate(-8deg) scale(0.7); opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .notif-row { animation: slideIn 0.28s ease both; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <FloatingHearts />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-black leading-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-[13px] mt-0.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {unreadCount} unread
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="text-[12px] font-black px-4 py-2 rounded-2xl transition-all duration-150 active:scale-95"
              style={{
                color: 'var(--color-primary)',
                background: 'rgba(233,64,87,0.08)',
                border: '1.5px solid rgba(233,64,87,0.15)',
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
            const count = f.types
              ? notifications.filter((n) => f.types!.includes(n.type) && !n.is_read).length
              : unreadCount;
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[12px] font-black transition-all duration-150 whitespace-nowrap"
                style={{
                  background: active ? 'var(--color-primary)' : 'white',
                  color: active ? 'white' : 'var(--color-text-muted)',
                  border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  boxShadow: active ? '0 4px 14px rgba(233,64,87,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className="text-[10px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center"
                    style={{
                      background: active ? 'rgba(255,255,255,0.25)' : 'var(--color-primary)',
                      color: 'white',
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
                style={{ background: 'var(--color-border)', animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(({ label, items }) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-[11px] font-black uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {label}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                </div>

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
