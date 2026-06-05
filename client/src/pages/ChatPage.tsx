import { useState, useEffect, useRef } from 'react';
import {
  Send, Search, ArrowLeft, MoreVertical,
  Loader2, X, AlertCircle, MessageCircle, Check, CheckCheck, Lock, Ban, UserX
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
  unblock: (id: string) => fetch(`/api/blocks/${id}`, { method: 'DELETE', credentials: 'include' }).then(handleRes),
};

// ─── Cute UI Components ───────────────────────────────────────────────────────

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 12 }).map((_, i) => {
        const size = Math.random() * 20 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 15;
        const delay = -(Math.random() * 20);

        return (
          <div
            key={i}
            className="absolute text-[var(--color-primary)] opacity-20 drop-shadow-sm"
            style={{
              top: 0,
              left: `${left}%`,
              fontSize: `${size}px`,
              animation: `float-cute ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            ♥
          </div>
        );
      })}
    </div>
  );
}

function Avatar({
  photoUrl, first, last, size = 'md', online, grayscale
}: {
  photoUrl?: string; first: string; last: string; size?: 'sm' | 'md' | 'lg'; online?: boolean; grayscale?: boolean;
}) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const dotSizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };

  return (
    <div className="relative shrink-0">
      <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center font-black border ${grayscale ? 'bg-[var(--color-background)] text-[var(--color-text-muted)] border-[var(--color-border)] grayscale' : 'bg-white text-[var(--color-primary)] border-[var(--color-primary)]'}`}>
        {photoUrl
          ? <img src={photoUrl} alt={first} className="w-full h-full object-cover" />
          : <span>{initials(first, last)}</span>
        }
      </div>
      {online !== undefined && !grayscale && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${dotSizes[size]} rounded-full border-2 border-white ${online ? 'bg-[#10b981]' : 'bg-[var(--color-text-muted)]'}`} />
      )}
    </div>
  );
}

// ─── Conversation Item ────────────────────────────────────────────────────────

function ConvoItem({
  convo, active, me, onClick,
}: {
  convo: Conversation; active: boolean; me: Me; onClick: () => void;
}) {
  const isMine = convo.last_message_sender_id === me.id;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-2xl mx-1 my-0.5 ${
        active
          ? 'bg-[var(--color-primary)] text-white shadow-md border-[var(--color-primary)]'
          : 'hover:bg-[var(--color-background)] border border-transparent bg-white'
      }`}
    >
      <Avatar
        photoUrl={convo.profile_picture_url || (convo.profile_picture_id ? `/api/photos/${convo.profile_picture_id}` : undefined)}
        first={convo.first_name}
        last={convo.last_name}
        online={convo.is_online}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-[15px] truncate ${active ? 'font-black text-white' : 'font-bold text-[var(--color-text)]'}`}>
            {convo.first_name} {convo.last_name}
          </p>
          <span className={`text-[10px] font-medium shrink-0 ${active ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
            {formatTime(convo.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-[13px] font-medium truncate ${active ? 'text-white/90' : 'text-[var(--color-text-muted)]'}`}>
            {isMine && <span className="opacity-70">You: </span>}
            {convo.last_message || <em className="opacity-60">No messages yet</em>}
          </p>
          {convo.unread_count > 0 && !active && (
            <span className="shrink-0 bg-[var(--color-primary)] text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
              {convo.unread_count > 99 ? '99+' : convo.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Blocked Item ─────────────────────────────────────────────────────────────

function BlockedItem({
  user, onUnblock,
}: {
  user: BlockedUser; onUnblock: (id: string) => Promise<void>;
}) {
  const [unblocking, setUnblocking] = useState(false);

  const handleUnblock = async () => {
    setUnblocking(true);
    await onUnblock(user.id);
    setUnblocking(false);
  };

  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 mx-1 my-0.5 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm">
      <Avatar
        photoUrl={user.profile_picture_url || (user.profile_picture_id ? `/api/photos/${user.profile_picture_id}` : undefined)}
        first={user.first_name}
        last={user.last_name}
        grayscale
      />

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-[var(--color-text)] truncate">
          {user.first_name} {user.last_name}
        </p>
        <p className="text-[12px] font-medium text-[var(--color-text-muted)] truncate flex items-center gap-1">
          <Ban size={10} /> Blocked {formatTime(user.blocked_at)}
        </p>
      </div>

      <button
        onClick={handleUnblock}
        disabled={unblocking}
        className="shrink-0 px-4 py-1.5 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-border)] text-[12px] font-bold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
      >
        {unblocking ? <Loader2 size={14} className="animate-spin" /> : "Unblock"}
      </button>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, mine }: { msg: Message; mine: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'} mb-1`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 text-[15px] font-medium leading-relaxed shadow-sm ${
          mine
            ? 'bg-[var(--color-primary)] text-white rounded-[20px] rounded-br-[4px]'
            : 'bg-white text-[var(--color-text)] border border-[var(--color-border)] rounded-[20px] rounded-bl-[4px]'
        }`}
      >
        <p style={{ wordBreak: 'break-word' }}>{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] font-bold ${mine ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
            {formatMessageTime(msg.sentAt)}
          </span>
          {mine && (
            msg.isRead
              ? <CheckCheck size={14} className="text-white/90" />
              : <Check size={14} className="text-white/60" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────

type SidebarTab = 'messages' | 'blocked';

export default function ChatPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('messages');

  // States
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [search, setSearch] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Chat State
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotal, setMsgTotal] = useState(0);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Specific Forbidden States
  const [chatForbidden, setChatForbidden] = useState(false);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const { id: urlUserId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Init: fetch me + blocked + convos simultaneously ──
  useEffect(() => {
    Promise.all([
      api.me().catch(() => null),
      api.blocked().catch(() => ({ blocked: [] })),
      api.conversations().catch(() => ({ conversations: [] }))
    ]).then(([meData, blockedData, convosData]) => {
      if (meData) setMe(meData.user);

      const fetchedBlocked = blockedData?.blocked || blockedData?.users || [];
      setBlockedUsers(fetchedBlocked);

      const fetchedConvos = convosData?.conversations || [];
      setConvos(fetchedConvos);

      if (urlUserId) {
        const targetConvo = fetchedConvos.find((c: Conversation) => String(c.id) === urlUserId);

        if (targetConvo) {
          setActiveConvo(targetConvo);
          setMobileView('chat');
        } else {
          // If not in standard convos, let's fetch them to see if we can chat
          api.getUser(urlUserId)
            .then((userData) => {
              const newMatch = userData.user || userData.profile?.user || userData.profile || (userData.id ? userData : null);
              if (!newMatch) throw new Error("Could not find user data in the API response.");

              const newConvo: Conversation = {
                id: newMatch.id,
                username: newMatch.username,
                first_name: newMatch.first_name,
                last_name: newMatch.last_name,
                profile_picture_id: newMatch.profile_picture_id,
                profile_picture_url: newMatch.photos?.find((p: any) => p.id === newMatch.profile_picture_id)?.url || (newMatch.photos?.[0]?.url),
                is_online: newMatch.is_online,
                last_message: '',
                last_message_at: new Date().toISOString(),
                last_message_sender_id: '',
                unread_count: 0
              };

              setConvos((prev) => {
                if (prev.some(c => c.id === newConvo.id)) return prev;
                return [newConvo, ...prev];
              });

              setActiveConvo(newConvo);
              setMobileView('chat');
            })
            .catch((e) => console.error("Could not fetch new match data:", e));
        }
      }
    }).finally(() => {
      setLoadingInitial(false);
    });
  }, [urlUserId]);

  const handleUnblock = async (id: string) => {
    try {
      await api.unblock(id);
      setBlockedUsers((prev) => prev.filter(u => u.id !== id));
      // If we are currently looking at this user's blocked state, clear it
      if (activeConvo?.id === id) {
        setChatForbidden(false);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  // ── Socket.io ──
  useEffect(() => {
    const socket = io('/', { withCredentials: true, path: '/socket.io' });
    socketRef.current = socket;

    socket.on('chat:receive', (msg: { id: number; from: string; content: string; sentAt: string; isRead: boolean }) => {
      const newMsg: Message = { ...msg, to: undefined };

      setConvos((prev) =>
        prev.map((c) =>
          c.id === msg.from
            ? {
                ...c,
                last_message: msg.content,
                last_message_at: msg.sentAt,
                last_message_sender_id: msg.from,
                unread_count: c.id === activeConvoRef.current?.id ? 0 : c.unread_count + 1,
              }
            : c
        )
      );

      if (activeConvoRef.current?.id === msg.from) {
        setMessages((prev) => [...prev, newMsg]);
        api.markRead(msg.from).catch(() => {});
      }
    });

    socket.on('chat:sent', (msg: { id: number; to: string; content: string; sentAt: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === -1 && m.content === msg.content
            ? { ...m, id: msg.id, sentAt: msg.sentAt }
            : m
        )
      );
      setSending(false);
    });

    socket.on('chat:error', ({ message }: { message: string }) => {
      setError(message);
      setSending(false);
      setMessages((prev) => prev.filter((m) => m.id !== -1));
    });

    return () => { socket.disconnect(); };
  }, []);

  const activeConvoRef = useRef<Conversation | null>(null);
  useEffect(() => { activeConvoRef.current = activeConvo; }, [activeConvo]);

  // ── Filter convos: Hide blocked users & apply search ──
  const visibleConvos = convos.filter(c => !blockedUsers.some(b => b.id === c.id));
  const filteredConvos = search
    ? visibleConvos.filter(c =>
        c.first_name.toLowerCase().includes(search.toLowerCase()) ||
        c.last_name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase())
      )
    : visibleConvos;

  // Check if current active convo is blocked by ME
  const iBlockedThem = activeConvo ? blockedUsers.some(b => b.id === activeConvo.id) : false;

  // ── Load messages when convo changes ──
  useEffect(() => {
    if (!activeConvo) return;
    setMessages([]);
    setMsgPage(1);
    setChatForbidden(false);

    if (iBlockedThem) {
      // If I blocked them, don't even try to fetch messages.
      return;
    }

    setLoadingMsgs(true);
    api.messages(activeConvo.id, 1)
      .then((d) => {
        const msgs: Message[] = (d.messages ?? []).map((m: any) => ({
          id: m.id,
          from: m.sender_id ?? m.from,
          content: m.content,
          sentAt: m.sent_at ?? m.sentAt,
          isRead: m.is_read ?? m.isRead,
        }));
        setMessages(msgs.reverse());
        setMsgTotal(d.total ?? 0);
        api.markRead(activeConvo.id).catch(() => {});
        setConvos((prev) => prev.map((c) => c.id === activeConvo.id ? { ...c, unread_count: 0 } : c));
      })
      .catch((e) => {
        if (e.message.includes('403') || e.message.toLowerCase().includes('not connected') || e.message.toLowerCase().includes('forbidden') || e.message.includes('404')) {
          // If it throws a forbidden error, and I didn't block them, it means THEY blocked or unmatched me!
          setChatForbidden(true);
        } else {
          setError(e.message);
        }
      })
      .finally(() => setLoadingMsgs(false));
  }, [activeConvo?.id, iBlockedThem]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    if (!loadingMsgs && !chatForbidden && !iBlockedThem) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages.length, loadingMsgs, chatForbidden, iBlockedThem]);

  // ── Load older messages ──
  const loadOlder = async () => {
    if (!activeConvo || loadingOlder || messages.length >= msgTotal) return;
    setLoadingOlder(true);
    const nextPage = msgPage + 1;
    const scrollEl = threadRef.current;
    const prevHeight = scrollEl?.scrollHeight ?? 0;

    try {
      const d = await api.messages(activeConvo.id, nextPage);
      const older: Message[] = (d.messages ?? []).map((m: any) => ({
        id: m.id,
        from: m.sender_id ?? m.from,
        content: m.content,
        sentAt: m.sent_at ?? m.sentAt,
        isRead: m.is_read ?? m.isRead,
      }));
      setMessages((prev) => [...older.reverse(), ...prev]);
      setMsgPage(nextPage);
      requestAnimationFrame(() => {
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingOlder(false);
    }
  };

  // ── Send message ──
  const sendMessage = () => {
    if (!input.trim() || !activeConvo || !me || sending || chatForbidden || iBlockedThem) return;
    const content = input.trim();
    if (content.length > 1000) { setError('Message too long (max 1000 chars)'); return; }

    const optimistic: Message = {
      id: -1,
      from: me.id,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openConvo = (convo: Conversation) => {
    setActiveConvo(convo);
    setMobileView('chat');
  };

  const groups = groupMessagesByDate(messages);
  const hasOlder = messages.length < msgTotal;

  return (
    <div className="relative h-screen flex flex-col bg-[var(--color-background)] font-[var(--font-primary)] overflow-hidden">

      <style>{`
        @keyframes float-cute {
          0%   { transform: translateY(110vh) translateX(-15px) rotate(-15deg) scale(0.8); opacity: 0; }
          10%  { opacity: 0.15; }
          25%  { transform: translateY(75vh) translateX(20px) rotate(10deg) scale(1.1); }
          50%  { transform: translateY(40vh) translateX(-20px) rotate(-10deg) scale(0.9); }
          75%  { transform: translateY(10vh) translateX(15px) rotate(15deg) scale(1.2); }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-20vh) translateX(-10px) rotate(-15deg) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* Floating Hearts Background */}
      <FloatingHearts />

      {/* Global error toast */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-error)] text-white text-[13px] font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="hover:opacity-70 transition-opacity cursor-pointer"><X size={16} /></button>
        </div>
      )}

      <div className="relative z-10 flex flex-1 overflow-hidden max-w-[1280px] w-full mx-auto py-6 px-4 sm:px-6 gap-6">

        {/* ══ SIDEBAR ══ */}
        <aside className={`
          w-full md:w-80 lg:w-[400px] shrink-0 flex flex-col bg-white/90 backdrop-blur-md rounded-[32px] border border-[var(--color-border)] shadow-sm overflow-hidden
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Sidebar header & Tabs */}
          <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] bg-white shrink-0">
            <h1 className="text-2xl font-black text-[var(--color-text)] mb-4">Chat</h1>

            <div className="flex bg-[var(--color-background)] border border-[var(--color-border)] rounded-full p-1 w-full mb-4 shadow-inner">
              <button
                onClick={() => setSidebarTab('messages')}
                className={`flex-1 py-2 rounded-full text-[13px] font-black cursor-pointer transition-all duration-300 ${sidebarTab === 'messages' ? 'bg-white shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
              >
                Messages
              </button>
              <button
                onClick={() => setSidebarTab('blocked')}
                className={`flex-1 py-2 rounded-full text-[13px] font-black cursor-pointer transition-all duration-300 ${sidebarTab === 'blocked' ? 'bg-white shadow-sm text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
              >
                Blocked
              </button>
            </div>

            {sidebarTab === 'messages' && (
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-[18px] pl-11 pr-4 py-2.5 text-[14px] font-bold text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>
            )}
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto py-3 px-2">
            {sidebarTab === 'messages' ? (
              // --- MESSAGES TAB ---
              loadingInitial ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="text-[var(--color-primary)] animate-spin" />
                </div>
              ) : filteredConvos.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <MessageCircle size={40} className="text-[var(--color-border)] mx-auto mb-4" />
                  <p className="text-[15px] font-bold text-[var(--color-text-muted)]">
                    {search ? 'No conversations match your search.' : 'No conversations yet. Match with someone to start chatting!'}
                  </p>
                </div>
              ) : (
                filteredConvos.map((c) => (
                  <ConvoItem
                    key={c.id}
                    convo={c}
                    active={activeConvo?.id === c.id}
                    me={me ?? { id: "0", first_name: '', username: '' }}
                    onClick={() => openConvo(c)}
                  />
                ))
              )
            ) : (
              // --- BLOCKED TAB ---
              loadingInitial ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="text-[var(--color-primary)] animate-spin" />
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <Ban size={40} className="text-[var(--color-border)] mx-auto mb-4" />
                  <p className="text-[15px] font-bold text-[var(--color-text-muted)]">
                    You haven't blocked anyone yet.
                  </p>
                </div>
              ) : (
                blockedUsers.map((u) => (
                  <BlockedItem
                    key={u.id}
                    user={u}
                    onUnblock={handleUnblock}
                  />
                ))
              )
            )}
          </div>
        </aside>

        {/* ══ CHAT THREAD ══ */}
        <main className={`
          flex-1 flex flex-col bg-white/95 backdrop-blur-md rounded-[32px] border border-[var(--color-border)] shadow-sm overflow-hidden min-w-0
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        `}>
          {!activeConvo ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 relative z-10">
              <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center border-2 border-[var(--color-primary)]/20 animate-pulse">
                <MessageCircle size={40} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-black text-[var(--color-text)] text-2xl mb-2">Your messages</h3>
                <p className="text-[15px] text-[var(--color-text-muted)] max-w-xs mx-auto font-bold">
                  Select a conversation from the left to start chatting. Only mutual matches can message each other!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-2 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div
                    onClick={() => navigate(`/profile/${activeConvo.id}`)}
                    className="flex items-center gap-4 cursor-pointer group"
                  >
                    <Avatar
                      photoUrl={activeConvo.profile_picture_url || (activeConvo.profile_picture_id ? `/api/photos/${activeConvo.profile_picture_id}` : undefined)}
                      first={activeConvo.first_name}
                      last={activeConvo.last_name}
                      size="lg"
                      online={iBlockedThem || chatForbidden ? false : activeConvo.is_online}
                      grayscale={iBlockedThem}
                    />
                    <div className="min-w-0">
                      <p className="font-black text-[18px] text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {activeConvo.first_name} {activeConvo.last_name}
                      </p>
                      <p className="text-[13px] font-bold">
                        {iBlockedThem ? (
                          <span className="text-[var(--color-error)]">Blocked</span>
                        ) : activeConvo.is_online && !chatForbidden ? (
                          <span className="text-[#10b981]">Active Now</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">@{activeConvo.username}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/profile/${activeConvo.id}`)}
                  className="p-2.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all bg-white cursor-pointer"
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Messages area */}
              <div
                ref={threadRef}
                className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4"
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* ── STATE 1: I blocked them ── */}
                {iBlockedThem ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                     <div className="w-20 h-20 rounded-full bg-[var(--color-background)] flex items-center justify-center border-2 border-[var(--color-border)] mb-2">
                       <Ban size={32} className="text-[var(--color-text-muted)]" />
                     </div>
                     <h3 className="text-xl font-black text-[var(--color-text)]">You Blocked This User</h3>
                     <p className="text-[15px] font-medium text-[var(--color-text-muted)] max-w-[280px]">
                       You cannot send or receive messages from <span className="font-bold text-[var(--color-text)]">{activeConvo.first_name}</span>.
                     </p>
                     <button
                       onClick={() => handleUnblock(activeConvo.id)}
                       className="mt-4 px-6 py-2.5 bg-white border-2 border-[var(--color-border)] text-[var(--color-text)] font-bold rounded-full shadow-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
                     >
                       Unblock User
                     </button>
                   </div>
                ) :
                /* ── STATE 2: They blocked me / Unmatched ── */
                chatForbidden ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                     <div className="w-20 h-20 rounded-full bg-[var(--color-background)] flex items-center justify-center border-2 border-[var(--color-border)] mb-2">
                       <UserX size={32} className="text-[var(--color-error)]" />
                     </div>
                     <h3 className="text-xl font-black text-[var(--color-text)]">Chat Unavailable</h3>
                     <p className="text-[15px] font-medium text-[var(--color-text-muted)] max-w-[300px]">
                       You can no longer reply to this conversation. <span className="font-bold text-[var(--color-text)]">{activeConvo.first_name}</span> may have unmatched or blocked you.
                     </p>
                   </div>
                ) :
                /* ── STATE 3: Loading ── */
                loadingMsgs ? (
                  <div className="flex-1 flex justify-center items-center">
                    <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                  </div>
                ) :
                /* ── STATE 4: Empty normal chat ── */
                messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <div className="text-6xl animate-bounce">👋</div>
                    <p className="text-[16px] font-bold text-[var(--color-text-muted)] mt-2">
                      You matched with <span className="font-black text-[var(--color-text)]">{activeConvo.first_name}</span>!
                      <br />Send a message to say hi.
                    </p>
                  </div>
                ) :
                /* ── STATE 5: Render Chat History ── */
                (
                  <>
                    {hasOlder && (
                      <div className="text-center pb-4">
                        <button
                          onClick={loadOlder}
                          disabled={loadingOlder}
                          className="px-5 py-2 rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-[12px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto cursor-pointer"
                        >
                          {loadingOlder ? <Loader2 size={14} className="animate-spin" /> : null}
                          {loadingOlder ? 'Loading…' : 'Load older messages'}
                        </button>
                      </div>
                    )}
                    {groups.map((group) => (
                      <div key={group.date} className="flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-4 my-3">
                          <span className="text-[11px] bg-[var(--color-background)] text-[var(--color-text-muted)] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[var(--color-border)]">
                            {group.date}
                          </span>
                        </div>

                        {group.messages.map((msg) => (
                          <Bubble
                            key={msg.id}
                            msg={msg}
                            mine={me ? msg.from === me.id : false}
                          />
                        ))}
                      </div>
                    ))}
                  </>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="px-6 py-5 bg-white border-t border-[var(--color-border)] shrink-0">
                <div className={`flex items-end gap-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[24px] px-5 py-3 transition-all shadow-inner ${chatForbidden || iBlockedThem ? 'opacity-50 cursor-not-allowed' : 'focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-sm'}`}>
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
                    placeholder={iBlockedThem ? "You blocked this user." : chatForbidden ? "You can no longer reply to this conversation." : "Type a message… (Enter to send)"}
                    rows={1}
                    maxLength={1000}
                    className="flex-1 bg-transparent text-[15px] font-bold text-[var(--color-text)] placeholder-[var(--color-text-muted)] resize-none outline-none leading-relaxed py-1 disabled:cursor-not-allowed"
                    style={{ height: '32px' }}
                  />
                  <div className="flex items-center gap-3 shrink-0 pb-0.5">
                    {input.length > 900 && (
                      <span className="text-[11px] font-black text-[var(--color-error)]">
                        {1000 - input.length}
                      </span>
                    )}
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending || chatForbidden || iBlockedThem}
                      className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:shadow-[0_4px_15px_rgba(233,64,87,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                    >
                      {sending
                        ? <Loader2 size={18} className="animate-spin" />
                        : <Send size={18} className="ml-1" />
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
