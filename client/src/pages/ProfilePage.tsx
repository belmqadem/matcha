import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Star,
  Eye,
  MessageCircle,
  Flag,
  Ban,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  X,
  Shield,
  Clock,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Photo {
  id: number;
  url: string;
  order_index: number;
  created_at: string;
}

interface PublicProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  birth_date?: string; // What the backend actually sends
  age: number | null;  // What we calculate
  gender: string | null;
  sexual_preference: string | null;
  biography: string | null;
  location_city: string | null;
  fame_rating: number;
  tags: string[];
  photos: Photo[];
  profile_picture_id: number | null;
  is_online: boolean;
  last_seen: string | null;
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
  is_blocked_by_me: boolean;
  is_fake_reported: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function calcAge(birth_date?: string): number | null {
  if (!birth_date) return null;
  return Math.floor((Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000));
}

const GENDERS: Record<string, string> = {
  male: 'Man',
  female: 'Woman',
  non_binary: 'Non-binary',
  other: 'Other',
};

const PREFERENCES: Record<string, string> = {
  heterosexual: 'Heterosexual',
  homosexual: 'Homosexual',
  bisexual: 'Bisexual',
};

// ─── Cute UI Components ───────────────────────────────────────────────────────

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 15 }).map((_, i) => {
        const size = Math.random() * 25 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 12 + 15;
        const delay = -(Math.random() * 25);

        return (
          <div
            key={i}
            className="absolute text-[var(--color-primary)] drop-shadow-sm"
            style={{
              top: 0,
              left: `${left}%`,
              fontSize: `${size}px`,
              opacity: 0,
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

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getProfile: (id: string) =>
    fetch(`/api/users/${id}`, { credentials: 'include' }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);

      const userData = d.user || d.profile?.user || d.profile || (d.id ? d : null);
      if (!userData) throw new Error("Could not find user data in the API response.");

      // 🛠️ FRONTEND FIX: Calculate age from birth_date immediately
      if (userData.birth_date && !userData.age) {
        userData.age = calcAge(userData.birth_date);
      }

      return userData as PublicProfile;
    }),

  like: (id: number) =>
    fetch(`/api/likes/${id}`, { method: 'POST', credentials: 'include' }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    }),

  unlike: (id: number) =>
    fetch(`/api/likes/${id}`, { method: 'DELETE', credentials: 'include' }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    }),

  block: (id: number) =>
    fetch(`/api/blocks/${id}`, { method: 'POST', credentials: 'include' }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    }),

  unblock: (id: number) =>
    fetch(`/api/blocks/${id}`, { method: 'DELETE', credentials: 'include' }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    }),

  report: (id: number) =>
    // 🛠️ FRONTEND FIX: Added headers and empty body to satisfy strict backend parsers
    fetch(`/api/reports/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: "fake account" }),
      credentials: 'include'
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    }),
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[fadeUp_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-[var(--color-text)]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors">
            <X size={14} />
          </button>
        </div>
        <p className="text-[14px] text-[var(--color-text-muted)] leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-[13px] font-bold rounded-xl border-2 border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-5 py-2.5 text-[13px] font-bold rounded-xl border-none text-white transition-opacity hover:opacity-90 ${danger ? 'bg-[var(--color-error)]' : 'bg-[var(--color-text)]'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);

  const [likeLoading, setLikeLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const [confirm, setConfirm] = useState<'block' | 'unblock' | 'report' | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getProfile(id)
      .then((p) => {
        setProfile(p);
        if (p.profile_picture_id) {
          const idx = p.photos.findIndex((ph) => ph.id === p.profile_picture_id);
          if (idx >= 0) setActivePhoto(idx);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
      </div>
    );

  if (error || !profile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-background)]">
        <p className="text-[15px] font-medium text-[var(--color-text-muted)]">{error || 'Profile not found.'}</p>
        <button onClick={() => navigate(-1)} className="text-[14px] font-bold text-[var(--color-primary)] bg-white px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all">
          ← Go back
        </button>
      </div>
    );

  const sorted = profile.photos.slice().sort((a, b) => a.order_index - b.order_index);
  const fame = Math.min(100, Math.max(0, profile.fame_rating ?? 0));

  const handleLike = async () => {
    if (!profile) return;
    setLikeLoading(true);
    setActionError('');
    try {
      if (profile.liked_by_me) {
        await api.unlike(profile.id);
        setProfile((p) => (p ? { ...p, liked_by_me: false, is_connected: false } : p));
      } else {
        const res = await api.like(profile.id);
        setProfile((p) => (p ? { ...p, liked_by_me: true, is_connected: res.connected ?? p.liked_me } : p));
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBlock = async () => {
    setConfirm(null);
    setBlockLoading(true);
    setActionError('');
    try {
      if (profile.is_blocked_by_me) {
        await api.unblock(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked_by_me: false } : p));
      } else {
        await api.block(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked_by_me: true, liked_by_me: false, liked_me: false, is_connected: false } : p));
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleReport = async () => {
    setConfirm(null);
    try {
      await api.report(profile.id);
      setProfile((p) => (p ? { ...p, is_fake_reported: true } : p));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Report failed.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] font-[var(--font-primary)] pb-20">
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Decorative Floating Hearts */}
      <FloatingHearts />

      {/* ── Confirm modals ── */}
      {confirm === 'block' && (
        <ConfirmModal
          title="Block this user?"
          message={`${profile.first_name} will no longer appear in your search results. You also won't be able to chat.`}
          confirmLabel="Block"
          danger
          onConfirm={handleBlock}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'unblock' && (
        <ConfirmModal
          title="Unblock this user?"
          message={`${profile.first_name} will be able to appear in your results and contact you again.`}
          confirmLabel="Unblock"
          onConfirm={handleBlock}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'report' && (
        <ConfirmModal
          title="Report as fake account?"
          message={`You're about to report ${profile.first_name}'s profile as fake. This action cannot be undone.`}
          confirmLabel="Report"
          danger
          onConfirm={handleReport}
          onClose={() => setConfirm(null)}
        />
      )}

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8 items-start">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex flex-col gap-6">

          {/* ── Hero card ── */}
          <div className="bg-white rounded-[32px] border border-[var(--color-border)] shadow-sm overflow-hidden animate-[fadeUp_0.4s_ease-out]">
            <div className="flex flex-col sm:flex-row min-h-[340px]">
              {/* Main photo */}
              <div className="relative w-full sm:w-[320px] bg-[var(--color-background)] flex-shrink-0">
                {sorted.length > 0 ? (
                  <img
                    src={sorted[activePhoto]?.url ?? sorted[0].url}
                    alt={profile.first_name}
                    className="w-full h-full object-cover block"
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center text-[var(--color-text-muted)] text-6xl font-black bg-[var(--color-background)] opacity-50">
                    {profile.first_name[0]}
                  </div>
                )}

                {/* Deep gradient overlay for badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Online badge */}
                <div className="absolute bottom-4 left-4">
                  {profile.is_online ? (
                    <span className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest shadow-lg">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> ONLINE
                    </span>
                  ) : profile.last_seen ? (
                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                      <Clock size={12} /> {timeAgo(profile.last_seen)}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Info */}
              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  {/* Name row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-[28px] font-black text-[var(--color-text)] leading-tight tracking-tight">
                        {profile.first_name} {profile.last_name}
                        {profile.age ? <span className="font-medium opacity-80">, {profile.age}</span> : ''}
                      </h1>
                      <CheckCircle2 size={24} className="text-[var(--color-primary)] flex-shrink-0" />
                    </div>
                  </div>

                  <p className="text-[14px] font-medium text-[var(--color-text-muted)] mb-4">
                    @{profile.username}
                  </p>

                  {/* Location */}
                  {profile.location_city && (
                    <div className="flex items-center gap-1.5 mb-5">
                      <MapPin size={16} className="text-[var(--color-primary)]" />
                      <span className="text-[15px] font-medium text-[var(--color-text-muted)]">
                        {profile.location_city}
                      </span>
                    </div>
                  )}

                  {/* Connection status banner */}
                  {profile.is_connected && (
                    <div className="flex items-center gap-2 bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/20 rounded-2xl px-4 py-3 mb-5">
                      {/* <Zap size={18} className="text-[var(--color-primary)] animate-pulse" /> */}
                      <span className="text-[13px] font-bold text-[var(--color-primary)]">
                        You're connected — start chatting now!
                      </span>
                    </div>
                  )}
                  {!profile.is_connected && profile.liked_me && !profile.liked_by_me && (
                    <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 mb-5">
                      <Heart size={18} className="text-amber-500" />
                      <span className="text-[13px] font-bold text-amber-700">
                        {profile.first_name} already liked you — like back to connect!
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {profile.biography && (
                    <p className="text-[15px] text-[var(--color-text)] leading-relaxed mb-6 font-medium opacity-80">
                      "{profile.biography}"
                    </p>
                  )}
                </div>

                {/* Tags */}
                {(profile.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-1.5 rounded-full bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-[13px] font-bold border-2 border-[var(--color-primary)]/10"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Photo strip ── */}
          {sorted.length > 1 && (
            <div className="bg-white rounded-[32px] p-7 border border-[var(--color-border)] shadow-sm animate-[fadeUp_0.5s_ease-out]">
              <h3 className="text-[18px] font-black text-[var(--color-text)] mb-5">More Photos</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {sorted.map((photo, i) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    className={`relative flex-shrink-0 w-[140px] h-[180px] rounded-2xl overflow-hidden cursor-pointer snap-start transition-all duration-300 ${
                      activePhoto === i ? 'ring-4 ring-[var(--color-primary)] ring-offset-2' : 'hover:opacity-80'
                    }`}
                  >
                    <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── About ── */}
          <div className="bg-white rounded-[32px] p-7 border border-[var(--color-border)] shadow-sm animate-[fadeUp_0.6s_ease-out]">
            <h3 className="text-[18px] font-black text-[var(--color-text)] mb-5">About {profile.first_name}</h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              {[
                { label: 'City', value: profile.location_city },
                { label: 'Age', value: profile.age ? `${profile.age} years old` : null },
                { label: 'Gender', value: profile.gender ? GENDERS[profile.gender] : null },
                {
                  label: 'Orientation',
                  value: profile.sexual_preference ? PREFERENCES[profile.sexual_preference] : 'Bisexual',
                },
              ].map(({ label, value }) => (
                <div key={label} className="border-b-2 border-[var(--color-background)] pb-3">
                  <p className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-[15px] font-bold ${value ? 'text-[var(--color-text)]' : 'text-[var(--color-border)]'}`}>
                    {value ?? 'Not specified'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div className="flex flex-col gap-6 sticky top-8 animate-[fadeUp_0.7s_ease-out]">

          {/* ── Action buttons ── */}
          <div className="bg-white rounded-[32px] p-6 border border-[var(--color-border)] shadow-sm flex flex-col gap-3">

            {actionError && (
              <div className="bg-[var(--color-error)]/10 text-[var(--color-error)] text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2 mb-2">
                <AlertTriangle size={14} /> {actionError}
              </div>
            )}

            {/* Like / Unlike */}
            <button
              onClick={handleLike}
              disabled={likeLoading || profile.is_blocked_by_me}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-black text-[15px] transition-all duration-300 active:scale-95 ${
                profile.is_blocked_by_me ? 'opacity-40 cursor-not-allowed bg-[var(--color-background)] text-[var(--color-text-muted)]' :
                profile.liked_by_me
                  ? 'bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
                  : 'bg-[var(--color-primary)] text-white hover:shadow-[0_8px_20px_rgba(233,64,87,0.3)] border-2 border-[var(--color-primary)]'
              }`}
            >
              {likeLoading ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={profile.liked_by_me ? "currentColor" : "none"} />}
              {profile.liked_by_me ? 'Unlike Profile' : profile.liked_me ? 'Match Now' : 'Send Like'}
            </button>

            {/* Chat */}
            <button
              onClick={() => navigate(`/chat/${profile.id}`)}
              disabled={!profile.is_connected}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-black text-[15px] transition-all duration-300 ${
                profile.is_connected
                ? 'bg-[var(--color-text)] text-white hover:bg-black active:scale-95 shadow-md cursor-pointer'
                : 'bg-[var(--color-background)] text-[var(--color-text-muted)] border-2 border-[var(--color-border)] opacity-60 cursor-not-allowed'
              }`}
            >
              <MessageCircle size={18} />
              {profile.is_connected ? 'Send Message' : 'Match to chat'}
            </button>

            <div className="h-0.5 bg-[var(--color-background)] my-2" />

            {/* Block */}
            <button
              onClick={() => setConfirm(profile.is_blocked_by_me ? 'unblock' : 'block')}
              disabled={blockLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] transition-all ${
                profile.is_blocked_by_me
                ? 'bg-orange-50 text-orange-600 border-2 border-orange-200 hover:bg-orange-100'
                : 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]'
              }`}
            >
              <Ban size={16} />
              {profile.is_blocked_by_me ? 'Unblock User' : 'Block User'}
            </button>

            {/* Report */}
            <button
              onClick={() => !profile.is_fake_reported && setConfirm('report')}
              disabled={profile.is_fake_reported}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] transition-all ${
                profile.is_fake_reported
                ? 'bg-[var(--color-background)] text-[var(--color-text-muted)] cursor-not-allowed border-2 border-[var(--color-border)]'
                : 'bg-transparent text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Flag size={16} />
              {profile.is_fake_reported ? 'Account Reported' : 'Report Fake Account'}
            </button>
          </div>

          {/* ── Fame & Stats ── */}
          <div className="bg-white rounded-[32px] p-6 border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-black text-[var(--color-text)]">Fame Rating</h3>
              <div className="flex items-center gap-1.5 bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
                <Star size={14} className="text-[var(--color-primary)] fill-current" />
                <span className="text-[15px] font-black text-[var(--color-primary)]">{fame}</span>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--color-background)] overflow-hidden mb-6">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-pink-400 transition-all duration-1000 ease-out" style={{ width: `${fame}%` }} />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between py-2 border-t-2 border-[var(--color-background)]">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-text-muted)]">
                  <Eye size={16} className="text-[var(--color-primary)]" /> Profile views
                </div>
                <span className="text-[14px] font-black text-[var(--color-text)]">Hidden</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t-2 border-[var(--color-background)]">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-text-muted)]">
                  <Shield size={16} className="text-[var(--color-primary)]" /> Verified Member
                </div>
                <span className="text-[14px] font-black text-[var(--color-text)]">Yes</span>
              </div>
            </div>
          </div>

          {/* ── Back button ── */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 rounded-[18px] border-2 border-[var(--color-border)] bg-white text-[var(--color-text-muted)] text-[14px] font-black cursor-pointer hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all shadow-sm active:scale-95"
          >
            ← Back to Browse
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
