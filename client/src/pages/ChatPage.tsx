import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Search, ArrowLeft, MoreVertical,
  Loader2, X, AlertCircle, MessageCircle, Check, CheckCheck
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';
// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string; // <-- Change to string
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id?: number;
  is_online: boolean;
  last_message: string;
  last_message_at: string;
  last_message_sender_id: string; // <-- Change to string
  unread_count: number;
}

interface Message {
  id: number;
  from: string; // <-- Change to string
  to?: string;  // <-- Change to string
  content: string;
  sentAt: string;
  isRead: boolean;
}

interface Me {
  id: string; // <-- Change to string
  first_name: string;
  username: string;
  profile_picture_id?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function photoUrl(id?: number) {
  return id ? `/api/photos/${id}` : '';
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function formatTime(iso: string) {
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
  messages: (userId: number, page = 1) =>
    fetch(`/api/chat/${userId}?page=${page}&limit=30`, { credentials: 'include' }).then(handleRes),
  markRead: (userId: number) =>
    fetch(`/api/chat/${userId}/read`, { method: 'POST', credentials: 'include' }).then(handleRes),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  photoId, first, last, size = 'md', online,
}: {
  photoId?: number; first: string; last: string; size?: 'sm' | 'md' | 'lg'; online?: boolean;
}) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const dotSizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };
  const url = photoUrl(photoId);

  return (
    <div className="relative shrink-0">
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center font-black text-rose-600`}>
        {url
          ? <img src={url} alt={first} className="w-full h-full object-cover" />
          : <span>{initials(first, last)}</span>
        }
      </div>
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${dotSizes[size]} rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-gray-300'}`} />
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
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 rounded-xl mx-1 ${
        active
          ? 'bg-[#e94057]/10 border border-[#e94057]/20'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <Avatar photoId={convo.profile_picture_id} first={convo.first_name} last={convo.last_name} online={convo.is_online} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-sm truncate ${active ? 'font-black text-[#e94057]' : 'font-bold text-gray-800'}`}>
            {convo.first_name} {convo.last_name}
          </p>
          <span className="text-[10px] text-gray-400 shrink-0">{formatTime(convo.last_message_at)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-gray-400 truncate">
            {isMine && <span className="text-gray-300">You: </span>}
            {convo.last_message || <em className="text-gray-300">No messages yet</em>}
          </p>
          {convo.unread_count > 0 && (
            <span className="shrink-0 bg-[#e94057] text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
              {convo.unread_count > 99 ? '99+' : convo.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, mine }: { msg: Message; mine: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          mine
            ? 'bg-[#e94057] text-white rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
        }`}
      >
        <p style={{ wordBreak: 'break-word' }}>{msg.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${mine ? 'text-rose-200' : 'text-gray-400'}`}>
            {formatMessageTime(msg.sentAt)}
          </span>
          {mine && (
            msg.isRead
              ? <CheckCheck size={11} className="text-rose-200" />
              : <Check size={11} className="text-rose-300" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyThread() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center border-2 border-rose-100">
        <MessageCircle size={32} className="text-rose-300" />
      </div>
      <div>
        <h3 className="font-black text-gray-800 text-lg mb-1">Your messages</h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Select a conversation from the left to start chatting. Only mutual matches can message each other.
        </p>
      </div>
    </div>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [filteredConvos, setFilteredConvos] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotal, setMsgTotal] = useState(0);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const { id: urlUserId } = useParams<{ id: string }>();

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Init: fetch me + convos ──
// ── Init: fetch me + convos ──
  useEffect(() => {
    api.me().then((d) => setMe(d.user)).catch(() => {});

    api.conversations()
      .then((d) => {
        const fetchedConvos = d.conversations ?? [];
        setConvos(fetchedConvos);
        setFilteredConvos(fetchedConvos);

        // Auto-select the conversation if there's an ID in the URL
        if (urlUserId) {
          const targetConvo = fetchedConvos.find((c: Conversation) => String(c.id) === urlUserId);

          if (targetConvo) {
            // They are already in our chat history!
            setActiveConvo(targetConvo);
            setMobileView('chat');
          } else {
            // ✨ NEW FIX: They aren't in the chat history yet (brand new match).
            // We fetch their basic info to create an empty conversation on the fly.

         api.getUser(urlUserId)
              .then((userData) => {
                // ✨ THE FIX: Safely hunt down the user object just like we did in the Profile page
                const newMatch = userData.user || userData.profile?.user || userData.profile || (userData.id ? userData : null);

                if (!newMatch) {
                  throw new Error("Could not find user data in the API response.");
                }

                const newConvo: Conversation = {
                  id: newMatch.id,
                  username: newMatch.username,
                  first_name: newMatch.first_name,
                  last_name: newMatch.last_name,
                  profile_picture_id: newMatch.profile_picture_id,
                  is_online: newMatch.is_online,
                  last_message: '',
                  last_message_at: new Date().toISOString(),
                  last_message_sender_id: '', // Make sure this is a string, not 0!
                  unread_count: 0
                };

                // Pop them into the top of the sidebar and open the chat
                setConvos((prev) => [newConvo, ...prev]);
                setFilteredConvos((prev) => [newConvo, ...prev]);
                setActiveConvo(newConvo);
                setMobileView('chat');
              })
              .catch((e) => console.error("Could not fetch new match data:", e));
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingConvos(false));
  }, [urlUserId]);

  // ── Socket.io ──
  // useEffect(() => {
  //   const socket = io({ withCredentials: true, path: '/socket.io' });
  //   socketRef.current = socket;

  //   socket.on('chat:receive', (msg: { id: number; from: number; content: string; sentAt: string; isRead: boolean }) => {
  //     const newMsg: Message = { ...msg, to: undefined };

  //     // Update conversation list
  //     setConvos((prev) =>
  //       prev.map((c) =>
  //         c.id === msg.from
  //           ? {
  //               ...c,
  //               last_message: msg.content,
  //               last_message_at: msg.sentAt,
  //               last_message_sender_id: msg.from,
  //               unread_count: c.id === activeConvoRef.current?.id ? 0 : c.unread_count + 1,
  //             }
  //           : c
  //       )
  //     );

  //     // Add to thread if active
  //     setActiveConvo((ac) => {
  //       if (ac?.id === msg.from) {
  //         setMessages((prev) => [...prev, newMsg]);
  //         api.markRead(msg.from).catch(() => {});
  //       }
  //       return ac;
  //     });
  //   });

  //   socket.on('chat:sent', (msg: { id: number; to: number; content: string; sentAt: string }) => {
  //     setMessages((prev) =>
  //       prev.map((m) =>
  //         m.id === -1 && m.content === msg.content
  //           ? { ...m, id: msg.id, sentAt: msg.sentAt }
  //           : m
  //       )
  //     );
  //   });

  //   socket.on('chat:error', ({ message }: { message: string }) => {
  //     setError(message);
  //     setSending(false);
  //     // Remove optimistic message
  //     setMessages((prev) => prev.filter((m) => m.id !== -1));
  //   });

  //   return () => { socket.disconnect(); };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
useEffect(() => {
    // Explicitly passing '/' helps the client know where to route the connection
    const socket = io('/', { withCredentials: true, path: '/socket.io' });
    socketRef.current = socket;

    // Optional: Helpful for debugging if it's actually connecting
    socket.on('connect', () => console.log('Socket connected!'));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    socket.on('chat:receive', (msg: { id: number; from: string; content: string; sentAt: string; isRead: boolean }) => {
      const newMsg: Message = { ...msg, to: undefined };

      // Update conversation list
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

      // FIX: Use the ref to check the active conversation instead of nesting state setters
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
      // FIX: Unlock the input field immediately when the server confirms receipt!
      setSending(false);
    });

    socket.on('chat:error', ({ message }: { message: string }) => {
      setError(message);
      setSending(false);
      setMessages((prev) => prev.filter((m) => m.id !== -1));
    });

    return () => { socket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Keep a ref to activeConvo for use in socket closure
  const activeConvoRef = useRef<Conversation | null>(null);
  useEffect(() => { activeConvoRef.current = activeConvo; }, [activeConvo]);

  // ── Filter convos by search ──
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredConvos(
      q
        ? convos.filter(
            (c) =>
              c.first_name.toLowerCase().includes(q) ||
              c.last_name.toLowerCase().includes(q) ||
              c.username.toLowerCase().includes(q)
          )
        : convos
    );
  }, [search, convos]);

  // ── Load messages when convo changes ──
  useEffect(() => {
    if (!activeConvo) return;
    setMessages([]);
    setMsgPage(1);
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
        setMessages(msgs); // oldest first
        setMsgTotal(d.total ?? 0);
        api.markRead(activeConvo.id).catch(() => {});
        // Clear unread badge
        setConvos((prev) => prev.map((c) => c.id === activeConvo.id ? { ...c, unread_count: 0 } : c));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMsgs(false));
  }, [activeConvo?.id]);

  // ── Scroll to bottom on new messages ──
useEffect(() => {
    if (!loadingMsgs) {
      // The 100ms timeout guarantees the browser has fully rendered the new message before scrolling
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages.length, loadingMsgs]);
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
      setMessages((prev) => [...older, ...prev]);
      setMsgPage(nextPage);
      // Restore scroll position
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
    if (!input.trim() || !activeConvo || !me || sending) return;
    const content = input.trim();
    if (content.length > 1000) { setError('Message too long (max 1000 chars)'); return; }

    // Optimistic
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

    // Update convo list optimistically
  setConvos((prev) => {
      const updated = prev.map((c) =>
        c.id === activeConvo.id
          ? { ...c, last_message: content, last_message_at: optimistic.sentAt, last_message_sender_id: me.id }
          : c
      );

      // Sort the list so the most recent conversation is always at the top
      return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    });

    // Reset sending after acknowledgment (chat:sent event handles it)
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
    <div className="h-screen flex flex-col bg-[#faf8f8] font-['DM_Sans','Helvetica_Neue',sans-serif] overflow-hidden">

      {/* Global error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-sm px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={15} /></button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden max-w-[1280px] w-full mx-auto py-6 px-4 sm:px-6 gap-4">

        {/* ══ SIDEBAR ══ */}
        <aside className={`
          w-full md:w-80 lg:w-96 shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Sidebar header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-50">
            <h1 className="text-xl font-black text-gray-900 mb-3">Messages</h1>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-[#e94057] transition-colors"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
            {loadingConvos ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="text-[#e94057] animate-spin" />
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="text-center py-12 px-6">
                <MessageCircle size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  {search ? 'No conversations match your search.' : 'No conversations yet. Match with someone to start chatting!'}
                </p>
              </div>
            ) : (
              filteredConvos.map((c) => (
                <ConvoItem
                  key={c.id}
                  convo={c}
                  active={activeConvo?.id === c.id}
                  me={me ?? { id: 0, first_name: '', username: '', profile_picture_id: undefined }}
                  onClick={() => openConvo(c)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ══ CHAT THREAD ══ */}
        <main className={`
          flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        `}>
          {!activeConvo ? (
            <EmptyThread />
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 shrink-0">
                {/* Mobile back */}
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>

                <a href={`/profile/${activeConvo.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                  <Avatar
                    photoId={activeConvo.profile_picture_id}
                    first={activeConvo.first_name}
                    last={activeConvo.last_name}
                    size="md"
                    online={activeConvo.is_online}
                  />
                  <div className="min-w-0">
                    <p className="font-black text-gray-900 text-sm group-hover:text-[#e94057] transition-colors truncate">
                      {activeConvo.first_name} {activeConvo.last_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activeConvo.is_online ? (
                        <span className="text-emerald-500 font-semibold">● Active now</span>
                      ) : (
                        `@${activeConvo.username}`
                      )}
                    </p>
                  </div>
                </a>

                <a
                  href={`/profile/${activeConvo.id}`}
                  className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <MoreVertical size={18} />
                </a>
              </div>

              {/* Messages area */}
              <div
                ref={threadRef}
                className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Load older */}
                {hasOlder && (
                  <div className="text-center pb-2">
                    <button
                      onClick={loadOlder}
                      disabled={loadingOlder}
                      className="text-xs text-[#e94057] font-bold hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto"
                    >
                      {loadingOlder ? <Loader2 size={12} className="animate-spin" /> : null}
                      {loadingOlder ? 'Loading…' : 'Load older messages'}
                    </button>
                  </div>
                )}

                {loadingMsgs ? (
                  <div className="flex-1 flex justify-center items-center">
                    <Loader2 size={28} className="text-[#e94057] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                    <div className="text-4xl">👋</div>
                    <p className="text-sm text-gray-400">
                      You matched with <span className="font-bold text-gray-600">{activeConvo.first_name}</span>!
                      <br />Say something nice.
                    </p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group.date} className="flex flex-col gap-2">
                      {/* Date divider */}
                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{group.date}</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      {group.messages.map((msg) => (
                        <Bubble
                          key={msg.id}
                          msg={msg}
                          mine={me ? msg.from === me.id : false}
                        />
                      ))}
                    </div>
                  ))
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3 border-t border-gray-50 shrink-0">
                <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#e94057] focus-within:ring-1 focus-within:ring-[#e94057]/20 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    rows={1}
                    maxLength={1000}
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed"
                    style={{ height: '24px' }}
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    {input.length > 900 && (
                      <span className="text-[10px] text-gray-400">{1000 - input.length}</span>
                    )}
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="w-8 h-8 rounded-xl bg-[#e94057] text-white flex items-center justify-center hover:bg-[#d6364a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-200 active:scale-95"
                    >
                      {sending
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Send size={14} />
                      }
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-300 mt-1.5 text-center">
                  Shift+Enter for new line · Enter to send
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
