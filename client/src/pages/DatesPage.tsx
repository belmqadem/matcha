import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

type DateStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
type MyRole = 'proposer' | 'receiver';

interface DateEntry {
  id: number;
  proposer_id: string;
  receiver_id: string;
  scheduled_at: string;
  location: string | null;
  status: DateStatus;
  created_at: string;
  updated_at: string;
  my_role: MyRole;
  other_user_id: string;
  other_username: string;
  other_first_name: string;
  other_last_name: string;
  other_profile_picture_id: string | null;
  other_profile_picture_url?: string | null;
}

interface DatesResponse {
  dates: DateEntry[];
  upcoming: number;
  total: number;
}

interface SearchUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string | null;
  is_connected: boolean;
  location_city?: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API = '/api';

// Only using the provided CSS variables — no hardcoded colors anywhere
const STATUS_META: Record<DateStatus, { label: string; icon: string; usePrimary: boolean }> = {
  pending:   { label: 'Pending',   icon: '♡', usePrimary: true  },
  accepted:  { label: 'Accepted',  icon: '♥', usePrimary: true  },
  declined:  { label: 'Declined',  icon: '✕', usePrimary: false },
  cancelled: { label: 'Cancelled', icon: '✕', usePrimary: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatScheduled(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  let relative: string;
  if (diffMs < 0) {
    const abs = Math.abs(diffDays);
    relative = abs === 0 ? 'earlier today' : abs === 1 ? 'yesterday' : `${abs}d ago`;
  } else {
    relative = diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : `in ${diffDays}d`;
  }

  const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return { date, time, relative };
}

function groupDates(dates: DateEntry[]) {
  const now = new Date();
  const upcoming: DateEntry[] = [];
  const past: DateEntry[] = [];
  const inactive: DateEntry[] = [];

  for (const d of dates) {
    if (d.status === 'declined' || d.status === 'cancelled') inactive.push(d);
    else if (new Date(d.scheduled_at) >= now) upcoming.push(d);
    else past.push(d);
  }

  const result: { label: string; emoji: string; items: DateEntry[] }[] = [];
  if (upcoming.length) result.push({ label: 'Upcoming', emoji: '✨', items: upcoming });
  if (past.length)     result.push({ label: 'Past',     emoji: '🌙', items: past });
  if (inactive.length) result.push({ label: 'Archived', emoji: '☁️',  items: inactive });
  return result;
}

// ─── Mini Avatar ──────────────────────────────────────────────────────────────

function MiniAvatar({ url, firstName, lastName, muted = false }: {
  url?: string | null;
  firstName: string;
  lastName: string;
  muted?: boolean;
}) {
  const border = muted ? '2px solid var(--color-border)' : '2px solid var(--color-primary)';
  const bg = muted ? 'var(--color-text-muted)' : 'var(--color-primary)';

  if (url) {
    return (
      <img
        src={url} alt={firstName}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        style={{ border }}
      />
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ background: bg, border, fontSize: 11 }}
    >
      {firstName[0]}{lastName[0]}
    </div>
  );
}

// ─── Card Avatar ──────────────────────────────────────────────────────────────

function CardAvatar({ date }: { date: DateEntry }) {
  const muted = date.status === 'declined' || date.status === 'cancelled';
  const border = muted ? '2.5px solid var(--color-border)' : '2.5px solid var(--color-primary)';
  const bg = muted ? 'var(--color-text-muted)' : 'var(--color-primary)';

  if (date.other_profile_picture_url) {
    return (
      <img
        src={date.other_profile_picture_url}
        alt={date.other_first_name}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        style={{ border, opacity: muted ? 0.5 : 1 }}
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ background: bg, border, opacity: muted ? 0.5 : 1 }}
    >
      {date.other_first_name[0]}{date.other_last_name[0]}
    </div>
  );
}

// ─── Floating Hearts ──────────────────────────────────────────────────────────

function FloatingHearts() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {[
        { top: '10%', left: '5%',  size: 12, delay: 0,   dur: 6   },
        { top: '20%', left: '92%', size: 8,  delay: 1.2, dur: 7   },
        { top: '50%', left: '3%',  size: 15, delay: 2.5, dur: 8   },
        { top: '68%', left: '94%', size: 9,  delay: 0.8, dur: 6.5 },
        { top: '35%', left: '89%', size: 7,  delay: 3.1, dur: 7.5 },
        { top: '82%', left: '7%',  size: 11, delay: 1.7, dur: 9   },
        { top: '75%', left: '50%', size: 6,  delay: 4,   dur: 8.5 },
      ].map((h, i) => (
        <span key={i} style={{
          position: 'absolute', top: h.top, left: h.left,
          fontSize: h.size, color: 'var(--color-primary)', opacity: 0.12,
          animation: `heartFloat ${h.dur}s ease-in-out ${h.delay}s infinite`,
        }}>♥</span>
      ))}
    </div>
  );
}

// ─── Propose Modal ────────────────────────────────────────────────────────────

function ProposeModal({ onClose, onPropose }: {
  onClose: () => void;
  onPropose: (data: { receiver_id: string; scheduled_at: string; location?: string }) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchUser | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${API}/search?limit=20`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const users: SearchUser[] = data.users ?? [];
      const lower = q.toLowerCase();
      setResults(users.filter((u) => u.username.toLowerCase().includes(lower)));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSubmit = async () => {
    if (!selected)              { setError('Pick someone first 💌'); return; }
    if (!selected.is_connected) { setError('You can only propose to mutual connections.'); return; }
    if (!scheduledAt)           { setError('Choose a date & time!'); return; }
    setError('');
    setLoading(true);
    try {
      await onPropose({
        receiver_id: selected.id,
        scheduled_at: new Date(scheduledAt).toISOString(),
        location: location.trim() || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to send proposal.');
    } finally {
      setLoading(false);
    }
  };

  const minDatetime = new Date(Date.now() + 60_000).toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'color-mix(in srgb, var(--color-text) 50%, transparent)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm flex flex-col gap-5 relative"
        style={{
          background: 'var(--color-background)',
          borderRadius: '28px 28px 0 0',
          padding: '28px 24px 36px',
          boxShadow: '0 -8px 40px color-mix(in srgb, var(--color-primary) 15%, transparent)',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
          style={{ background: 'var(--color-border)' }} />

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
              Propose a date ♥
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Only mutual connections can be invited
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-60"
            style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs px-3 py-2.5 rounded-2xl"
            style={{ background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', color: 'var(--color-error)' }}>
            {error}
          </p>
        )}

        {/* Search */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Search by username
          </label>

          {selected ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
              style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1.5px solid color-mix(in srgb, var(--color-primary) 25%, transparent)' }}>
              <MiniAvatar url={selected.profile_picture_url} firstName={selected.first_name} lastName={selected.last_name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {selected.first_name} {selected.last_name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-primary)' }}>@{selected.username}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setQuery(''); setResults([]); }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-opacity hover:opacity-60"
                style={{ color: 'var(--color-text-muted)', background: 'var(--color-border)' }}
              >✕</button>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  className="w-full px-3 py-2.5 rounded-2xl"
                  style={{
                    border: '1.5px solid var(--color-border)',
                    color: 'var(--color-text)',
                    background: 'white',
                  }}
                  placeholder="@username"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
                )}
              </div>

              {results.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'white' }}>
                  {results.map((u, i) => (
                    <button
                      key={u.id}
                      onClick={() => u.is_connected && (setSelected(u), setResults([]), setQuery(u.username))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-opacity"
                      style={{
                        borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                        opacity: u.is_connected ? 1 : 0.4,
                        cursor: u.is_connected ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <MiniAvatar url={u.profile_picture_url} firstName={u.first_name} lastName={u.last_name} muted={!u.is_connected} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</p>
                      </div>
                      {u.is_connected
                        ? <span style={{ color: 'var(--color-primary)', fontSize: 14 }}>♥</span>
                        : <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                            not connected
                          </span>
                      }
                    </button>
                  ))}
                </div>
              )}

              {query.length > 1 && !searching && results.length === 0 && (
                <p className="text-xs italic text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
                  No one found for "{query}" ♡
                </p>
              )}
            </>
          )}
        </div>

        {/* Date + location — only after selecting a user */}
        {selected && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                When?
              </label>
              <input
                type="datetime-local"
                min={minDatetime}
                className="px-3 py-2.5 rounded-2xl"
                style={{ border: '1.5px solid var(--color-border)', color: 'var(--color-text)', background: 'white' }}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Where?{' '}
                <span style={{ fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                className="px-3 py-2.5 rounded-2xl"
                style={{ border: '1.5px solid var(--color-border)', color: 'var(--color-text)', background: 'white' }}
                placeholder="Coffee at Café Kitsune…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !selected}
          className="w-full py-3.5 rounded-2xl font-bold transition-all duration-200"
          style={{
            background: selected ? 'var(--color-primary)' : 'var(--color-border)',
            color: selected ? 'white' : 'var(--color-text-muted)',
            boxShadow: selected ? '0 4px 18px color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'none',
            opacity: loading ? 0.65 : 1,
          }}
        >
          {loading ? 'Sending… ♡' : 'Send Proposal ♥'}
        </button>
      </div>
    </div>
  );
}

// ─── Date Card ────────────────────────────────────────────────────────────────

function DateCard({ date, onRespond, onCancel }: {
  date: DateEntry;
  onRespond: (id: number, status: 'accepted' | 'declined') => Promise<void>;
  onCancel: (id: number) => Promise<void>;
}) {
  const navigate = useNavigate();
  const meta = STATUS_META[date.status];
  const { date: fmtDate, time, relative } = formatScheduled(date.scheduled_at);
  const [acting, setActing] = useState(false);
  const muted = date.status === 'declined' || date.status === 'cancelled';

  const isUpcoming = !muted && new Date(date.scheduled_at) >= new Date();

  const handleRespond = async (status: 'accepted' | 'declined') => {
    setActing(true);
    try { await onRespond(date.id, status); }
    finally { setActing(false); }
  };

  const handleCancel = async () => {
    setActing(true);
    try { await onCancel(date.id); }
    finally { setActing(false); }
  };

  return (
    <div
      className="rounded-3xl overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        opacity: muted ? 0.65 : 1,
      }}
    >
      {/* Top stripe — primary for active, border color for inactive */}
      <div style={{
        height: 3,
        background: muted
          ? 'var(--color-border)'
          : 'linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 40%, transparent))',
      }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer flex-shrink-0" onClick={() => navigate(`/profile/${date.other_user_id}`)}>
            <CardAvatar date={date} />
            <div
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{
                background: muted ? 'var(--color-text-muted)' : 'var(--color-primary)',
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              {meta.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold leading-tight cursor-pointer hover:underline"
              style={{ color: 'var(--color-text)' }}
              onClick={() => navigate(`/profile/${date.other_user_id}`)}
            >
              {date.other_first_name} {date.other_last_name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              @{date.other_username}
              {' · '}
              <span style={{ color: muted ? 'var(--color-text-muted)' : 'var(--color-primary)', fontWeight: 600 }}>
                {meta.label}
              </span>
            </p>
          </div>

          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: muted
                ? 'var(--color-background)'
                : 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: muted ? 'var(--color-text-muted)' : 'var(--color-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {date.my_role === 'proposer' ? 'You asked' : 'They asked'}
          </span>
        </div>

        {/* Date / time / location */}
        <div
          className="rounded-2xl px-4 py-3 flex flex-col gap-1.5"
          style={{
            background: muted
              ? 'var(--color-background)'
              : 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: muted ? 'var(--color-text-muted)' : 'var(--color-primary)', fontSize: 13 }}>◷</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              {fmtDate} · {time}
            </span>
            <span
              className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: muted
                  ? 'var(--color-border)'
                  : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: muted ? 'var(--color-text-muted)' : 'var(--color-primary)',
              }}
            >
              {relative}
            </span>
          </div>
          {date.location && (
            <div className="flex items-center gap-2">
              <span style={{ color: muted ? 'var(--color-text-muted)' : 'var(--color-primary)', fontSize: 13 }}>◎</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{date.location}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {date.status === 'pending' && date.my_role === 'receiver' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond('accepted')}
              disabled={acting}
              className="flex-1 py-2.5 rounded-2xl font-bold transition-all duration-150 flex items-center justify-center gap-1.5"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                boxShadow: '0 3px 12px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                opacity: acting ? 0.6 : 1,
              }}
            >
              ♥ Accept
            </button>
            <button
              onClick={() => handleRespond('declined')}
              disabled={acting}
              className="flex-1 py-2.5 rounded-2xl font-bold transition-all duration-150"
              style={{
                background: 'var(--color-background)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                opacity: acting ? 0.6 : 1,
              }}
            >
              Decline
            </button>
          </div>
        )}

        {date.status === 'pending' && date.my_role === 'proposer' && (
          <button
            onClick={handleCancel}
            disabled={acting}
            className="w-full py-2.5 rounded-2xl font-bold text-xs transition-all duration-150"
            style={{
              background: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
              color: 'var(--color-error)',
              border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
              opacity: acting ? 0.6 : 1,
            }}
          >
            Cancel proposal
          </button>
        )}

        {date.status === 'accepted' && date.my_role === 'proposer' && isUpcoming && (
          <button
            onClick={handleCancel}
            disabled={acting}
            className="w-full py-2.5 rounded-2xl font-bold text-xs transition-all duration-150"
            style={{
              background: 'var(--color-background)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              opacity: acting ? 0.6 : 1,
            }}
          >
            Cancel date
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div style={{ fontSize: 44, color: 'var(--color-primary)', opacity: 0.2, lineHeight: 1 }}>♥</div>
      <p className="text-sm italic text-center" style={{ color: 'var(--color-text-muted)' }}>
        No dates yet — ask someone out! ♡
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DatesPage() {
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [upcoming, setUpcoming] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchDates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/dates`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data: DatesResponse = await res.json();
      setDates(data.dates);
      setUpcoming(data.upcoming);
    } catch { } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDates(); }, [fetchDates]);

  const handlePropose = useCallback(async (body: { receiver_id: string; scheduled_at: string; location?: string }) => {
    const res = await fetch(`${API}/dates`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to propose.');
    }
    await fetchDates();
  }, [fetchDates]);

  const handleRespond = useCallback(async (id: number, status: 'accepted' | 'declined') => {
    const res = await fetch(`${API}/dates/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error();
    setDates((prev) => prev.map((d) => d.id === id ? { ...d, status } : d));
    // pending dates aren't in `upcoming`, so only increment if accepted + future
    if (status === 'accepted') {
      setDates((prev) => {
        const d = prev.find((x) => x.id === id);
        if (d && new Date(d.scheduled_at) >= new Date()) setUpcoming((c) => c + 1);
        return prev;
      });
    }
  }, []);

  const handleCancel = useCallback(async (id: number) => {
    const res = await fetch(`${API}/dates/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error();
    setDates((prev) => prev.map((d) => d.id === id ? { ...d, status: 'cancelled' } : d));
    setUpcoming((c) => Math.max(0, c - 1));
  }, []);

  const groups = groupDates(dates);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-background)' }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartFloat {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50%       { transform: translateY(-16px) rotate(8deg); }
        }
        .date-card { animation: slideIn 0.3s ease both; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { opacity: 0.4; }
      `}</style>

      <FloatingHearts />

      <div className="max-w-xl mx-auto px-4 py-8 relative">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black leading-none" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                Dates
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {upcoming > 0
                  ? `${upcoming} upcoming ${upcoming === 1 ? 'date' : 'dates'} ♥`
                  : 'Nothing planned yet ♡'}
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                boxShadow: '0 4px 18px color-mix(in srgb, var(--color-primary) 30%, transparent)',
              }}
            >
              <span>♥</span> Propose
            </button>
          </div>

          {/* Decorative divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span style={{ color: 'var(--color-primary)', opacity: 0.35, fontSize: 11, letterSpacing: '0.2em' }}>♥ ♡ ♥</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-3xl animate-pulse"
                style={{ background: 'var(--color-border)', animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : dates.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map(({ label, emoji, items }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ fontSize: 14 }}>{emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    {label}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'white', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  >
                    {items.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {items.map((d, i) => (
                    <div key={d.id} className="date-card" style={{ animationDelay: `${i * 55}ms` }}>
                      <DateCard date={d} onRespond={handleRespond} onCancel={handleCancel} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ProposeModal onClose={() => setShowModal(false)} onPropose={handlePropose} />}
    </div>
  );
}
