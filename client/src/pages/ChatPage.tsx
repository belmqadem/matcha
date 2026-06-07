import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Search, ArrowLeft, Loader2, X, AlertCircle,
  MessageCircle, Check, CheckCheck, Ban, UserX,
  CalendarHeart, Heart, MoreVertical, ShieldOff, UserMinus
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id?: number;
  profile_picture_url?: string;
  is_online: boolean;
  last_message: string;
  last_message_at: string;
  last_message_sender_id: string;
  unread_count: number;
}

interface BlockedUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id?: number;
  profile_picture_url?: string;
  blocked_at: string;
}

interface Message {
  id: number;
  from: string;
  to?: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

interface Me {
  id: string;
  first_name: string;
  username: string;
  profile_picture_id?: number;
  profile_picture_url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const date = new Date(msg.sentAt).toLocaleDateString([], {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else groups.push({ date, messages: [msg] });
  }
  return groups;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function handleRes(res: Response) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
  return body;
}

const api = {
  getUser: (id: string) => fetch(`/api/users/${id}`, { credentials: 'include' }).then(handleRes),
  me: () => fetch('/api/users/me', { credentials: 'include' }).then(handleRes),
  conversations: () => fetch('/api/chat/conversations', { credentials: 'include' }).then(handleRes),
  messages: (userId: string, page = 1) =>
    fetch(`/api/chat/${userId}?page=${page}&limit=30`, { credentials: 'include' }).then(handleRes),
  markRead: (userId: string) =>
    fetch(`/api/chat/${userId}/read`, { method: 'POST', credentials: 'include' }).then(handleRes),
  blocked: () => fetch('/api/profile/me/blocked', { credentials: 'include' }).then(handleRes),
  block: (id: string) => fetch(`/api/blocks/${id}`, { method: 'POST', credentials: 'include' }).then(handleRes),
  unblock: (id: string) => fetch(`/api/blocks/${id}`, { method: 'DELETE', credentials: 'include' }).then(handleRes),
  unmatch: (id: string) => fetch(`/api/matches/${id}`, { method: 'DELETE', credentials: 'include' }).then(handleRes),
  proposeDate: (data: { receiver_id: string; scheduled_at: string; location?: string }) =>
    fetch('/api/dates', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleRes),
};

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
      opacity: Math.random() * 0.08 + 0.04,
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

function Avatar({
  photoUrl, first, last, size = 'md', online, grayscale,
}: {
  photoUrl?: string; first: string; last: string;
  size?: 'sm' | 'md' | 'lg'; online?: boolean; grayscale?: boolean;
}) {
  const dim = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-[15px]' };
  const dot = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };

  return (
    <div className="relative shrink-0">
      <div
        className={`${dim[size]} rounded-full overflow-hidden flex items-center justify-center font-black border-2 ${
          grayscale
            ? 'bg-[var(--color-background)] text-[var(--color-text-muted)] border-[var(--color-border)] grayscale'
            : 'bg-white text-[var(--color-primary)] border-[var(--color-primary)]/30'
        }`}
      >
        {photoUrl
          ? <img src={photoUrl} alt={first} className="w-full h-full object-cover" />
          : <span className="font-black">{initials(first, last)}</span>
        }
      </div>
      {online !== undefined && !grayscale && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dot[size]} rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-[var(--color-border)]'}`}
        />
      )}
    </div>
  );
}

// ─── Propose Modal ────────────────────────────────────────────────────────────

function ProposeModal({
  onClose, onPropose, receiverName,
}: {
  onClose: () => void;
  onPropose: (data: { scheduled_at: string; location?: string }) => Promise<void>;
  receiverName: string;
}) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const minDatetime = new Date(Date.now() + 60_000).toISOString().slice(0, 16);

  const handleSubmit = async () => {
    if (!scheduledAt) { setError('Please pick a date and time.'); return; }
    setError(''); setLoading(true);
    try {
      await onPropose({ scheduled_at: new Date(scheduledAt).toISOString(), location: location.trim() || undefined });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to propose date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7 flex flex-col gap-5 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 32px 80px rgba(233,64,87,0.15), 0 8px 24px rgba(0,0,0,0.12)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl mb-1">💌</div>
            <h2 className="text-xl font-black text-[var(--color-text)]">Ask {receiverName} out</h2>
            <p className="text-[13px] text-[var(--color-text-muted)] font-medium mt-0.5">Propose a time and place</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-colors shrink-0 mt-1"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <p className="text-xs px-4 py-2.5 rounded-2xl bg-red-50 text-[var(--color-error)] font-bold border border-red-100">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Date &amp; Time</span>
            <input
              type="datetime-local"
              min={minDatetime}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="px-4 py-3 rounded-2xl text-[14px] font-bold border-2 border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-background)] focus:border-[var(--color-primary)] focus:bg-white transition-all outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              Location <span className="font-medium normal-case tracking-normal">(optional)</span>
            </span>
            <input
              placeholder="Coffee at Café Kitsune…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-2xl text-[14px] font-bold border-2 border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-background)] focus:border-[var(--color-primary)] focus:bg-white transition-all outline-none placeholder-[var(--color-border)]"
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl text-[15px] font-black text-white bg-[var(--color-primary)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(233,64,87,0.3)]"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CalendarHeart size={18} />}
          {loading ? 'Proposing…' : 'Send Proposal'}
        </button>
      </div>
    </div>
  );
}

// ─── Confirm Modal (Block / Unmatch) ──────────────────────────────────────────

function ConfirmModal({
  title, description, confirmLabel, danger = false,
  onConfirm, onCancel, loading,
}: {
  title: string; description: string; confirmLabel: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-3xl p-6 flex flex-col gap-4 bg-white"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-[18px] font-black text-[var(--color-text)]">{title}</h2>
          <p className="text-[13px] text-[var(--color-text-muted)] font-medium mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl text-[14px] font-bold border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-2xl text-[14px] font-black text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              danger ? 'bg-[var(--color-error)] hover:opacity-90' : 'bg-[var(--color-primary)] hover:opacity-90'
            }`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Convo Item ───────────────────────────────────────────────────────────────

function ConvoItem({ convo, active, me, onClick }: {
  convo: Conversation; active: boolean; me: Me; onClick: () => void;
}) {
  const isMine = convo.last_message_sender_id === me.id;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-2xl ${
        active
          ? 'bg-[var(--color-primary)] text-white shadow-md'
          : 'hover:bg-white/80 border border-transparent hover:border-[var(--color-border)] bg-transparent'
      }`}
    >
      <Avatar
        photoUrl={convo.profile_picture_url || (convo.profile_picture_id ? `/api/photos/${convo.profile_picture_id}` : undefined)}
        first={convo.first_name} last={convo.last_name} online={convo.is_online}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-[15px] truncate ${active ? 'font-black text-white' : 'font-bold text-[var(--color-text)]'}`}>
            {convo.first_name} {convo.last_name}
          </p>
          <span className={`text-[10px] font-semibold shrink-0 ${active ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
            {formatTime(convo.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-[13px] truncate ${active ? 'text-white/80 font-medium' : 'text-[var(--color-text-muted)] font-medium'}`}>
            {isMine && <span className="opacity-60">You: </span>}
            {convo.last_message || <em className="opacity-50">Say hello!</em>}
          </p>
          {convo.unread_count > 0 && !active && (
            <span className="shrink-0 bg-[var(--color-primary)] text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
              {convo.unread_count > 99 ? '99+' : convo.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Blocked Item ─────────────────────────────────────────────────────────────

function BlockedItem({ user, onUnblock }: { user: BlockedUser; onUnblock: (id: string) => Promise<void> }) {
  const [unblocking, setUnblocking] = useState(false);
  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
      <Avatar
        photoUrl={user.profile_picture_url || (user.profile_picture_id ? `/api/photos/${user.profile_picture_id}` : undefined)}
        first={user.first_name} last={user.last_name} grayscale
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-[var(--color-text)] truncate">{user.first_name} {user.last_name}</p>
        <p className="text-[12px] font-medium text-[var(--color-text-muted)] truncate flex items-center gap-1">
          <Ban size={10} /> Blocked {formatTime(user.blocked_at)}
        </p>
      </div>
      <button
        onClick={async () => { setUnblocking(true); await onUnblock(user.id); setUnblocking(false); }}
        disabled={unblocking}
        className="shrink-0 px-4 py-1.5 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-border)] text-[12px] font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50 active:scale-95"
      >
        {unblocking ? <Loader2 size={14} className="animate-spin" /> : 'Unblock'}
      </button>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, mine }: { msg: Message; mine: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'} mb-1`}>
      <div
        className={`max-w-[72%] px-4 py-2.5 text-[15px] font-medium leading-relaxed shadow-sm ${
          mine
            ? 'bg-[var(--color-primary)] text-white rounded-[20px] rounded-br-[5px]'
            : 'bg-white text-[var(--color-text)] border border-[var(--color-border)] rounded-[20px] rounded-bl-[5px]'
        }`}
      >
        <p style={{ wordBreak: 'break-word' }}>{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] font-bold ${mine ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>
            {formatMessageTime(msg.sentAt)}
          </span>
          {mine && (
            msg.isRead
              ? <CheckCheck size={13} className="text-white/80" />
              : <Check size={13} className="text-white/50" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Actions Dropdown ─────────────────────────────────────────────────────────

function ActionsMenu({
  firstName, iBlocked, onBlock, onUnblock, onUnmatch, onClose,
}: {
  firstName: string; iBlocked: boolean;
  onBlock: () => void; onUnblock: () => void; onUnmatch: () => void; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] z-50 py-2 overflow-hidden"
      style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.14)' }}
    >
      {iBlocked ? (
        <button
          onClick={() => { onUnblock(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors text-left"
        >
          <ShieldOff size={16} className="text-[var(--color-text-muted)]" />
          Unblock {firstName}
        </button>
      ) : (
        <button
          onClick={() => { onBlock(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-[var(--color-error)] hover:bg-red-50 transition-colors text-left"
        >
          <Ban size={16} />
          Block {firstName}
        </button>
      )}
      <div className="mx-4 my-1 border-t border-[var(--color-border)]" />
      <button
        onClick={() => { onUnmatch(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-[var(--color-error)] hover:bg-red-50 transition-colors text-left"
      >
        <UserMinus size={16} />
        Unmatch {firstName}
      </button>
    </div>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────

type SidebarTab = 'messages' | 'blocked';
type ConfirmAction = 'block' | 'unblock' | 'unmatch' | null;

export default function ChatPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('messages');
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [search, setSearch] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotal, setMsgTotal] = useState(0);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [chatForbidden, setChatForbidden] = useState(false);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { id: urlUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeConvoRef = useRef<Conversation | null>(null);

  useEffect(() => { activeConvoRef.current = activeConvo; }, [activeConvo]);

  // ── Init ──
  useEffect(() => {
    Promise.all([
      api.me().catch(() => null),
      api.blocked().catch(() => ({ blocked: [] })),
      api.conversations().catch(() => ({ conversations: [] })),
    ]).then(([meData, blockedData, convosData]) => {
      if (meData) setMe(meData.user);
      setBlockedUsers(blockedData?.blocked || blockedData?.users || []);
      const fetchedConvos = convosData?.conversations || [];
      setConvos(fetchedConvos);

      if (urlUserId) {
        const targetConvo = fetchedConvos.find((c: Conversation) => String(c.id) === urlUserId);
        if (targetConvo) {
          setActiveConvo(targetConvo); setMobileView('chat');
        } else {
          api.getUser(urlUserId).then((userData) => {
            const u = userData.user || userData.profile?.user || userData.profile || (userData.id ? userData : null);
            if (!u) return;
            const newConvo: Conversation = {
              id: u.id, username: u.username, first_name: u.first_name, last_name: u.last_name,
              profile_picture_id: u.profile_picture_id,
              profile_picture_url: u.photos?.find((p: any) => p.id === u.profile_picture_id)?.url || u.photos?.[0]?.url,
              is_online: u.is_online, last_message: '', last_message_at: new Date().toISOString(),
              last_message_sender_id: '', unread_count: 0,
            };
            setConvos((prev) => prev.some(c => c.id === newConvo.id) ? prev : [newConvo, ...prev]);
            setActiveConvo(newConvo); setMobileView('chat');
          }).catch(console.error);
        }
      }
    }).finally(() => setLoadingInitial(false));
  }, [urlUserId]);

  // ── Socket.io ──
  useEffect(() => {
    const socket = io('/', { withCredentials: true, path: '/socket.io' });
    socketRef.current = socket;

    socket.on('chat:receive', (msg: { id: number; from: string; content: string; sentAt: string; isRead: boolean }) => {
      setConvos((prev) => prev.map((c) =>
        c.id === msg.from ? {
          ...c, last_message: msg.content, last_message_at: msg.sentAt,
          last_message_sender_id: msg.from,
          unread_count: c.id === activeConvoRef.current?.id ? 0 : c.unread_count + 1,
        } : c
      ));
      if (activeConvoRef.current?.id === msg.from) {
        setMessages((prev) => [...prev, { ...msg, to: undefined }]);
        api.markRead(msg.from).catch(() => {});
      }
    });

    socket.on('chat:sent', (msg: { id: number; to: string; content: string; sentAt: string }) => {
      setMessages((prev) => prev.map((m) =>
        m.id === -1 && m.content === msg.content ? { ...m, id: msg.id, sentAt: msg.sentAt } : m
      ));
      setSending(false);
    });

    socket.on('chat:error', ({ message }: { message: string }) => {
      setError(message);
      setSending(false);
      setMessages((prev) => prev.filter((m) => m.id !== -1));
    });

    return () => { socket.disconnect(); };
  }, []);

  const iBlockedThem = activeConvo ? blockedUsers.some(b => b.id === activeConvo.id) : false;

  // ── Load messages when convo changes ──
  useEffect(() => {
    if (!activeConvo) return;
    setMessages([]); setMsgPage(1); setChatForbidden(false);
    if (iBlockedThem) return;
    setLoadingMsgs(true);
    api.messages(activeConvo.id, 1)
      .then((d) => {
        const msgs: Message[] = (d.messages ?? []).map((m: any) => ({
          id: m.id, from: m.sender_id ?? m.from, content: m.content,
          sentAt: m.sent_at ?? m.sentAt, isRead: m.is_read ?? m.isRead,
        }));
        setMessages(msgs.reverse());
        setMsgTotal(d.total ?? 0);
        api.markRead(activeConvo.id).catch(() => {});
        setConvos((prev) => prev.map((c) => c.id === activeConvo.id ? { ...c, unread_count: 0 } : c));
      })
      .catch((e) => {
        if (e.message.includes('403') || e.message.toLowerCase().includes('not connected') ||
          e.message.toLowerCase().includes('forbidden') || e.message.includes('404')) {
          setChatForbidden(true);
        } else setError(e.message);
      })
      .finally(() => setLoadingMsgs(false));
  }, [activeConvo?.id, iBlockedThem]);

  // ── Scroll to bottom ──
  useEffect(() => {
    if (!loadingMsgs && !chatForbidden && !iBlockedThem) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
    }
  }, [messages.length, loadingMsgs, chatForbidden, iBlockedThem]);

  const loadOlder = async () => {
    if (!activeConvo || loadingOlder || messages.length >= msgTotal) return;
    setLoadingOlder(true);
    const nextPage = msgPage + 1;
    const scrollEl = threadRef.current;
    const prevHeight = scrollEl?.scrollHeight ?? 0;
    try {
      const d = await api.messages(activeConvo.id, nextPage);
      const older: Message[] = (d.messages ?? []).map((m: any) => ({
        id: m.id, from: m.sender_id ?? m.from, content: m.content,
        sentAt: m.sent_at ?? m.sentAt, isRead: m.is_read ?? m.isRead,
      }));
      setMessages((prev) => [...older.reverse(), ...prev]);
      setMsgPage(nextPage);
      requestAnimationFrame(() => { if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight; });
    } catch (e: any) { setError(e.message); }
    finally { setLoadingOlder(false); }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConvo || !me || sending || chatForbidden || iBlockedThem) return;
    const content = input.trim();
    if (content.length > 1000) { setError('Message too long (max 1000 chars)'); return; }
    const optimistic: Message = { id: -1, from: me.id, content, sentAt: new Date().toISOString(), isRead: false };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);
    socketRef.current?.emit('chat:send', { to: activeConvo.id, content });
    setConvos((prev) => {
      const updated = prev.map((c) =>
        c.id === activeConvo.id
          ? { ...c, last_message: content, last_message_at: optimistic.sentAt, last_message_sender_id: me.id }
          : c
      );
      return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    });
    setTimeout(() => setSending(false), 3000);
  };

  const handleProposeDate = async (data: { scheduled_at: string; location?: string }) => {
    if (!activeConvo) return;
    await api.proposeDate({ receiver_id: activeConvo.id, ...data });
    const formattedDate = new Date(data.scheduled_at).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const messageContent = `📅 I've proposed a date: ${formattedDate}${data.location ? ` at ${data.location}` : ''}`;
    socketRef.current?.emit('chat:send', { to: activeConvo.id, content: messageContent });
    setMessages((prev) => [...prev, {
      id: Math.random(), from: me?.id ?? '', content: messageContent,
      sentAt: new Date().toISOString(), isRead: false,
    }]);
  };

  const handleBlock = async () => {
    if (!activeConvo) return;
    setConfirmLoading(true);
    try {
      await api.block(activeConvo.id);
      setBlockedUsers((prev) => [...prev, {
        id: activeConvo.id, username: activeConvo.username,
        first_name: activeConvo.first_name, last_name: activeConvo.last_name,
        profile_picture_id: activeConvo.profile_picture_id,
        profile_picture_url: activeConvo.profile_picture_url, blocked_at: new Date().toISOString(),
      }]);
      setConfirmAction(null);
    } catch (e: any) { setError(e.message); }
    finally { setConfirmLoading(false); }
  };

  const handleUnblock = async (id?: string) => {
    const targetId = id ?? activeConvo?.id;
    if (!targetId) return;
    try {
      await api.unblock(targetId);
      setBlockedUsers((prev) => prev.filter(u => u.id !== targetId));
      if (activeConvo?.id === targetId) setChatForbidden(false);
    } catch (e: any) { setError(e.message); }
    finally { setConfirmLoading(false); setConfirmAction(null); }
  };

  const handleUnmatch = async () => {
    if (!activeConvo) return;
    setConfirmLoading(true);
    try {
      await api.unmatch(activeConvo.id);
      setConvos((prev) => prev.filter(c => c.id !== activeConvo.id));
      setActiveConvo(null);
      setMobileView('list');
      setConfirmAction(null);
    } catch (e: any) { setError(e.message); }
    finally { setConfirmLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const visibleConvos = convos.filter(c => !blockedUsers.some(b => b.id === c.id));
  const filteredConvos = search
    ? visibleConvos.filter(c =>
        `${c.first_name} ${c.last_name} ${c.username}`.toLowerCase().includes(search.toLowerCase())
      )
    : visibleConvos;

  const groups = groupMessagesByDate(messages);
  const hasOlder = messages.length < msgTotal;

  return (
    <div className="relative h-screen flex flex-col bg-[var(--color-background)] font-[var(--font-primary)] overflow-hidden">

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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-appear { animation: fadeInUp 0.18s ease-out both; }
      `}</style>

      <FloatingHearts />

      {/* Confirm modals */}
      {confirmAction === 'block' && activeConvo && (
        <ConfirmModal
          title={`Block ${activeConvo.first_name}?`}
          description={`You won't be able to send or receive messages from ${activeConvo.first_name}. You can unblock them later.`}
          confirmLabel="Block" danger
          onConfirm={handleBlock} onCancel={() => setConfirmAction(null)} loading={confirmLoading}
        />
      )}
      {confirmAction === 'unblock' && activeConvo && (
        <ConfirmModal
          title={`Unblock ${activeConvo.first_name}?`}
          description={`You'll be able to send and receive messages from ${activeConvo.first_name} again.`}
          confirmLabel="Unblock"
          onConfirm={() => handleUnblock()} onCancel={() => setConfirmAction(null)} loading={confirmLoading}
        />
      )}
      {confirmAction === 'unmatch' && activeConvo && (
        <ConfirmModal
          title={`Unmatch ${activeConvo.first_name}?`}
          description={`This will permanently remove your match with ${activeConvo.first_name}. This action cannot be undone.`}
          confirmLabel="Unmatch" danger
          onConfirm={handleUnmatch} onCancel={() => setConfirmAction(null)} loading={confirmLoading}
        />
      )}

      {showProposeModal && activeConvo && (
        <ProposeModal
          onClose={() => setShowProposeModal(false)}
          onPropose={handleProposeDate}
          receiverName={activeConvo.first_name}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-error)] text-white text-[13px] font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm animate-[fadeInUp_0.2s_ease-out]">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="hover:opacity-70 transition-opacity ml-1"><X size={15} /></button>
        </div>
      )}

      <div className="relative z-10 flex flex-1 overflow-hidden max-w-[1280px] w-full mx-auto py-5 px-4 sm:px-6 gap-5">

        {/* ══ SIDEBAR ══ */}
        <aside className={`
          w-full md:w-80 lg:w-96 shrink-0 flex flex-col
          bg-white/90 backdrop-blur-md rounded-[28px]
          border border-[var(--color-border)] shadow-sm overflow-hidden
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
              <h1 className="text-[22px] font-black text-[var(--color-text)]">Messages</h1>
            </div>

            {/* Tabs */}
            <div className="flex bg-[var(--color-background)] border border-[var(--color-border)] rounded-full p-1 mb-4">
              {(['messages', 'blocked'] as SidebarTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`flex-1 py-2 rounded-full text-[13px] font-black transition-all duration-200 capitalize ${
                    sidebarTab === tab
                      ? 'bg-white shadow-sm text-[var(--color-text)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {sidebarTab === 'messages' && (
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-full pl-10 pr-4 py-2.5 text-[13px] font-bold text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white transition-all outline-none"
                />
              </div>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
            {sidebarTab === 'messages' ? (
              loadingInitial ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={26} className="text-[var(--color-primary)] animate-spin" />
                </div>
              ) : filteredConvos.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="text-4xl mb-3">💌</div>
                  <p className="text-[14px] font-bold text-[var(--color-text-muted)]">
                    {search ? 'No conversations match.' : 'Match with someone to start chatting!'}
                  </p>
                </div>
              ) : (
                filteredConvos.map((c) => (
                  <ConvoItem
                    key={c.id} convo={c} active={activeConvo?.id === c.id}
                    me={me ?? { id: '0', first_name: '', username: '' }}
                    onClick={() => { setActiveConvo(c); setMobileView('chat'); }}
                  />
                ))
              )
            ) : (
              loadingInitial ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={26} className="text-[var(--color-primary)] animate-spin" />
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <Ban size={36} className="text-[var(--color-border)] mx-auto mb-3" />
                  <p className="text-[14px] font-bold text-[var(--color-text-muted)]">You haven't blocked anyone.</p>
                </div>
              ) : (
                blockedUsers.map((u) => (
                  <BlockedItem key={u.id} user={u} onUnblock={async (id) => { await handleUnblock(id); }} />
                ))
              )
            )}
          </div>
        </aside>

        {/* ══ CHAT THREAD ══ */}
        <main className={`
          flex-1 flex flex-col bg-white/95 backdrop-blur-md rounded-[28px]
          border border-[var(--color-border)] shadow-sm overflow-hidden min-w-0
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        `}>
          {!activeConvo ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/20 flex items-center justify-center">
                <Heart size={36} className="text-[var(--color-primary)] fill-[var(--color-primary)]/30" />
              </div>
              <div>
                <h3 className="font-black text-[var(--color-text)] text-xl mb-1.5">Your messages</h3>
                <p className="text-[14px] text-[var(--color-text-muted)] max-w-[260px] mx-auto font-medium leading-relaxed">
                  Select a conversation to start chatting. Only mutual matches can message!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--color-border)] bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-2 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors shrink-0"
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <div
                    onClick={() => navigate(`/profile/${activeConvo.id}`)}
                    className="flex items-center gap-3 cursor-pointer group min-w-0"
                  >
                    <Avatar
                      photoUrl={activeConvo.profile_picture_url || (activeConvo.profile_picture_id ? `/api/photos/${activeConvo.profile_picture_id}` : undefined)}
                      first={activeConvo.first_name} last={activeConvo.last_name} size="lg"
                      online={iBlockedThem || chatForbidden ? false : activeConvo.is_online}
                      grayscale={iBlockedThem}
                    />
                    <div className="min-w-0">
                      <p className="font-black text-[17px] text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {activeConvo.first_name} {activeConvo.last_name}
                      </p>
                      <p className="text-[12px] font-bold">
                        {iBlockedThem
                          ? <span className="text-[var(--color-error)]">Blocked</span>
                          : activeConvo.is_online && !chatForbidden
                            ? <span className="text-emerald-500">Active now</span>
                            : <span className="text-[var(--color-text-muted)]">@{activeConvo.username}</span>
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!iBlockedThem && !chatForbidden && (
                    <button
                      onClick={() => setShowProposeModal(true)}
                      title="Ask out"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-[13px] font-black hover:bg-[var(--color-primary)]/15 transition-all"
                    >
                      <CalendarHeart size={16} />
                      <span className="hidden sm:inline">Ask out</span>
                    </button>
                  )}

                  {/* 3-dot menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu((v) => !v)}
                      className="p-2.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] transition-all bg-white"
                    >
                      <MoreVertical size={17} />
                    </button>
                    {showActionsMenu && (
                      <ActionsMenu
                        firstName={activeConvo.first_name}
                        iBlocked={iBlockedThem}
                        onBlock={() => setConfirmAction('block')}
                        onUnblock={() => setConfirmAction('unblock')}
                        onUnmatch={() => setConfirmAction('unmatch')}
                        onClose={() => setShowActionsMenu(false)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={threadRef}
                className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3"
                style={{ scrollbarWidth: 'thin' }}
              >
                {iBlockedThem ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-background)] flex items-center justify-center border border-[var(--color-border)]">
                      <Ban size={28} className="text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="text-[18px] font-black text-[var(--color-text)]">You blocked this user</h3>
                    <p className="text-[14px] font-medium text-[var(--color-text-muted)] max-w-[260px] leading-relaxed">
                      You can't send or receive messages from <strong className="text-[var(--color-text)]">{activeConvo.first_name}</strong>.
                    </p>
                    <button
                      onClick={() => setConfirmAction('unblock')}
                      className="mt-2 px-5 py-2.5 bg-white border-2 border-[var(--color-border)] text-[var(--color-text)] font-bold rounded-full hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all text-[14px]"
                    >
                      Unblock user
                    </button>
                  </div>
                ) : chatForbidden ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-background)] flex items-center justify-center border border-[var(--color-border)]">
                      <UserX size={28} className="text-[var(--color-error)]" />
                    </div>
                    <h3 className="text-[18px] font-black text-[var(--color-text)]">Chat unavailable</h3>
                    <p className="text-[14px] font-medium text-[var(--color-text-muted)] max-w-[280px] leading-relaxed">
                      <strong className="text-[var(--color-text)]">{activeConvo.first_name}</strong> may have unmatched or blocked you.
                    </p>
                  </div>
                ) : loadingMsgs ? (
                  <div className="flex-1 flex justify-center items-center">
                    <Loader2 size={30} className="text-[var(--color-primary)] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <div className="text-5xl">💞</div>
                    <p className="text-[15px] font-bold text-[var(--color-text-muted)]">
                      You matched with <strong className="text-[var(--color-text)]">{activeConvo.first_name}</strong>!<br />
                      <span className="font-medium">Be the first to say hi.</span>
                    </p>
                  </div>
                ) : (
                  <>
                    {hasOlder && (
                      <div className="text-center pb-2">
                        <button
                          onClick={loadOlder}
                          disabled={loadingOlder}
                          className="px-5 py-2 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[12px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                        >
                          {loadingOlder && <Loader2 size={13} className="animate-spin" />}
                          {loadingOlder ? 'Loading…' : 'Load older messages'}
                        </button>
                      </div>
                    )}
                    {groups.map((group) => (
                      <div key={group.date} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-center my-3">
                          <span className="text-[10px] bg-[var(--color-background)] text-[var(--color-text-muted)] font-black uppercase tracking-[0.12em] px-4 py-1.5 rounded-full border border-[var(--color-border)]">
                            {group.date}
                          </span>
                        </div>
                        {group.messages.map((msg) => (
                          <div key={msg.id} className="msg-appear">
                            <Bubble msg={msg} mine={me ? msg.from === me.id : false} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="px-5 py-4 bg-white border-t border-[var(--color-border)] shrink-0">
                <div
                  className={`flex items-end gap-3 bg-[var(--color-background)] border-2 rounded-[22px] px-4 py-2.5 transition-all ${
                    chatForbidden || iBlockedThem
                      ? 'opacity-50 cursor-not-allowed border-[var(--color-border)]'
                      : 'border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(233,64,87,0.06)]'
                  }`}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={chatForbidden || iBlockedThem}
                    placeholder={
                      iBlockedThem ? 'You blocked this user.'
                      : chatForbidden ? 'You can no longer reply.'
                      : 'Type a message… (Enter to send)'
                    }
                    rows={1}
                    maxLength={1000}
                    className="flex-1 bg-transparent text-[15px] font-medium text-[var(--color-text)] placeholder-[var(--color-text-muted)] resize-none outline-none leading-relaxed py-1 disabled:cursor-not-allowed"
                    style={{ height: '32px' }}
                  />
                  <div className="flex items-center gap-2 shrink-0 pb-0.5">
                    {input.length > 900 && (
                      <span className="text-[11px] font-black text-[var(--color-error)]">{1000 - input.length}</span>
                    )}
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending || chatForbidden || iBlockedThem}
                      className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:shadow-[0_4px_16px_rgba(233,64,87,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {sending
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Send size={16} className="ml-0.5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
