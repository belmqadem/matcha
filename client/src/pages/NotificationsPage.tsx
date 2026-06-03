import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Loader2, CheckCheck, Trash2, Heart, Eye,
  MessageCircle, HeartHandshake, HeartCrack, Calendar, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'like' | 'visit' | 'message' | 'match' | 'unlike'
  | 'date_proposed' | 'date_accepted' | 'date_declined' | 'date_cancelled';

export interface AppNotification {
  id: number;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  from_id: string;
  from_username: string;
  from_first_name: string;
  from_last_name: string;
  from_profile_picture_id: number | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function handleResponse(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body;
}

const api = {
  getNotifications: () =>
    fetch('/api/notifications', { credentials: 'include' })
      .then(handleResponse)
      .then((d) => d.notifications as AppNotification[]),

  markAllAsRead: () =>
    fetch('/api/notifications/read-all', { method: 'PATCH', credentials: 'include' })
      .then(handleResponse),

  markAsRead: (id: number) =>
    fetch(`/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' })
      .then(handleResponse),

  deleteNotification: (id: number) =>
    fetch(`/api/notifications/${id}`, { method: 'DELETE', credentials: 'include' })
      .then(handleResponse),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

// Deterministic avatar color based on user id string
const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  { bg: 'bg-sky-100',    text: 'text-sky-700'     },
  { bg: 'bg-emerald-100',text: 'text-emerald-700' },
  { bg: 'bg-amber-100',  text: 'text-amber-700'   },
  { bg: 'bg-rose-100',   text: 'text-rose-700'    },
];

function avatarColor(id: string) {
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ─── Notification type config ─────────────────────────────────────────────────

const TYPE_UI: Record<
  NotificationType,
  { icon: React.ReactNode; text: string; badgeBg: string; badgeIcon: string }
> = {
  like: {
    icon: <Heart size={10} className="fill-rose-500 text-rose-500" />,
    text: 'liked your profile',
    badgeBg: 'bg-rose-100',
    badgeIcon: 'text-rose-500',
  },
  visit: {
    icon: <Eye size={10} className="text-blue-500" />,
    text: 'viewed your profile',
    badgeBg: 'bg-blue-100',
    badgeIcon: 'text-blue-500',
  },
  message: {
    icon: <MessageCircle size={10} className="fill-emerald-500 text-emerald-500" />,
    text: 'sent you a message',
    badgeBg: 'bg-emerald-100',
    badgeIcon: 'text-emerald-500',
  },
  match: {
    icon: <HeartHandshake size={10} className="text-amber-500" />,
    text: "matched with you ✦",
    badgeBg: 'bg-amber-100',
    badgeIcon: 'text-amber-500',
  },
  unlike: {
    icon: <HeartCrack size={10} className="text-gray-400" />,
    text: 'unliked your profile',
    badgeBg: 'bg-gray-100',
    badgeIcon: 'text-gray-400',
  },
  date_proposed: {
    icon: <Calendar size={10} className="text-purple-500" />,
    text: 'proposed a date',
    badgeBg: 'bg-purple-100',
    badgeIcon: 'text-purple-500',
  },
  date_accepted: {
    icon: <Calendar size={10} className="text-green-500" />,
    text: 'accepted your date',
    badgeBg: 'bg-green-100',
    badgeIcon: 'text-green-500',
  },
  date_declined: {
    icon: <Calendar size={10} className="text-red-500" />,
    text: 'declined your date',
    badgeBg: 'bg-red-100',
    badgeIcon: 'text-red-500',
  },
  date_cancelled: {
    icon: <Calendar size={10} className="text-orange-500" />,
    text: 'cancelled the date',
    badgeBg: 'bg-orange-100',
    badgeIcon: 'text-orange-500',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread';

function FilterTabs({
  active,
  unreadCount,
  totalCount,
  onChange,
}: {
  active: FilterTab;
  unreadCount: number;
  totalCount: number;
  onChange: (tab: FilterTab) => void;
}) {
  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',    label: 'All',    count: totalCount   },
    { key: 'unread', label: 'Unread', count: unreadCount  },
  ];

  return (
    <div className="flex gap-2 mb-5">
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
            active === key
              ? 'bg-[#e94057] text-white border-[#e94057] shadow-sm'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          {label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              active === key
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {count}
          </span>
        </button>
      ))}
    </div>
  );
}

function NotificationItem({
  notif,
  onClick,
  onDelete,
}: {
  notif: AppNotification;
  onClick: (n: AppNotification) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}) {
  const ui = TYPE_UI[notif.type] ?? TYPE_UI['visit'];
  const color = avatarColor(notif.from_id);
  const initials = getInitials(notif.from_first_name, notif.from_last_name);

  return (
    <div
      onClick={() => onClick(notif)}
      className={`relative flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors group
        ${notif.is_read ? 'bg-white hover:bg-gray-50' : 'bg-rose-50/40 hover:bg-rose-50/70'}`}
    >
      {/* Unread left accent */}
      {!notif.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-[#e94057]" />
      )}

      {/* Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${color.bg} ${color.text}`}>
          {initials}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${ui.badgeBg}`}>
          {ui.icon}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notif.is_read ? 'text-gray-500' : 'text-gray-800'}`}>
          <span className="font-bold text-gray-900">
            {notif.from_first_name} {notif.from_last_name}
          </span>{' '}
          <span>{ui.text}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
          {timeAgo(notif.created_at)}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => onDelete(e, notif.id)}
        className="shrink-0 p-1.5 rounded-lg text-gray-300 opacity-0 group-hover:opacity-100
          hover:bg-red-50 hover:text-red-400 transition-all"
        aria-label="Delete notification"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-1 mb-2 mt-5 first:mt-0">
      {label}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    api.getNotifications()
      .then((data) => setNotifications(data ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      api.markAsRead(notif.id).catch(() => {});
    }
    if (notif.type === 'message' || notif.type === 'match') {
      navigate(`/chat/${notif.from_id}`);
    } else {
      navigate(`/profile/${notif.from_id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    api.deleteNotification(id).catch(() => {});
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Filter by active tab
  const displayed =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  // Group into Today / Earlier
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayItems = displayed.filter(
    (n) => new Date(n.created_at).getTime() >= todayStart.getTime()
  );
  const earlierItems = displayed.filter(
    (n) => new Date(n.created_at).getTime() < todayStart.getTime()
  );

  return (
    <div className="min-h-screen bg-[#faf8f8] font-['DM_Sans','Helvetica_Neue',sans-serif]">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#e94057]/10 flex items-center justify-center text-[#e94057] shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-0.5">
                Notifications
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                {unreadCount > 0
                  ? `${unreadCount} unread ${unreadCount === 1 ? 'alert' : 'alerts'}`
                  : 'All caught up'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200
                text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* ── Filter Tabs ── */}
        <FilterTabs
          active={activeTab}
          unreadCount={unreadCount}
          totalCount={notifications.length}
          onChange={setActiveTab}
        />

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-5 border border-red-100 flex justify-between items-center">
            <span>⚠ {error}</span>
            <button onClick={() => setError('')} className="ml-2 shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={28} className="text-[#e94057] animate-spin" />
            <p className="text-sm text-gray-400">Loading your alerts…</p>
          </div>

        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={26} className="text-gray-300" />
            </div>
            <h3 className="text-base font-black text-gray-800 mb-1">
              {activeTab === 'unread' ? 'No unread notifications' : 'You are all caught up!'}
            </h3>
            <p className="text-sm text-gray-400">
              {activeTab === 'unread'
                ? 'Switch to All to see past notifications.'
                : 'No new notifications right now.'}
            </p>
          </div>

        ) : (
          <div>
            {todayItems.length > 0 && (
              <>
                <SectionLabel label="Today" />
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50 mb-1">
                  {todayItems.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      onClick={handleNotificationClick}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}

            {earlierItems.length > 0 && (
              <>
                <SectionLabel label="Earlier" />
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                  {earlierItems.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      onClick={handleNotificationClick}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
