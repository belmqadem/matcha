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
  age: number | null;
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
  // Relationship state
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
  is_blocked: boolean;
  is_fake_reported: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getProfile: (id: string) =>
    fetch(`/api/users/${id}`, { credentials: 'include' }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);

      return d.profile.user as PublicProfile;
    }),

  like: (id: number) =>
    fetch(`/api/profile/${id}/like`, { method: 'POST', credentials: 'include' }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      return d;
    }),

  unlike: (id: number) =>
    fetch(`/api/profile/${id}/like`, { method: 'DELETE', credentials: 'include' }).then(
      async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      },
    ),

  block: (id: number) =>
    fetch(`/api/profile/${id}/block`, { method: 'POST', credentials: 'include' }).then(
      async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      },
    ),

  unblock: (id: number) =>
    fetch(`/api/profile/${id}/block`, { method: 'DELETE', credentials: 'include' }).then(
      async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      },
    ),

  report: (id: number) =>
    fetch(`/api/profile/${id}/report`, { method: 'POST', credentials: 'include' }).then(
      async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      },
    ),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          margin: '0 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1.5px solid #eee',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#888',
            }}
          >
            <X size={13} />
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#777', lineHeight: 1.6, marginBottom: '20px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1.5px solid #eee',
              background: '#fff',
              color: '#888',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '10px',
              border: 'none',
              background: danger ? '#e94057' : '#222',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
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

        // Set active photo to main photo index
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
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2 size={28} style={{ color: '#e94057' }} />
      </div>
    );

  if (error || !profile)
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#aaa' }}>{error || 'Profile not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#e94057',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
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
        await api.like(profile.id);
        setProfile((p) => (p ? { ...p, liked_by_me: true, is_connected: p.liked_me } : p));
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
      if (profile.is_blocked) {
        await api.unblock(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked: false } : p));
      } else {
        await api.block(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked: true } : p));
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
    <div
      style={{
        minHeight: '100vh',
        background: '#f7f4f4',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* ── Confirm modals ── */}
      {confirm === 'block' && (
        <ConfirmModal
          title="Block this user?"
          message={`${profile.first_name} will no longer appear in your search results or send you notifications. You also won't be able to chat.`}
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

      <div
        style={{
          maxWidth: '1140px',
          margin: '0 auto',
          padding: '28px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ── Hero card ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              border: '1px solid #f0f0f0',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '300px' }}>
              {/* Main photo */}
              <div style={{ position: 'relative', background: '#f5f5f5' }}>
                {sorted.length > 0 ? (
                  <img
                    src={sorted[activePhoto]?.url ?? sorted[0].url}
                    alt={profile.first_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '300px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ddd',
                      fontSize: '48px',
                      fontWeight: 800,
                    }}
                  >
                    {profile.first_name[0]}
                  </div>
                )}

                {/* Online badge */}
                {profile.is_online ? (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: '#4ade80',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    ● ONLINE
                  </span>
                ) : profile.last_seen ? (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={9} /> {timeAgo(profile.last_seen)}
                  </span>
                ) : null}
              </div>

              {/* Info */}
              <div
                style={{
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Name row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h1
                        style={{
                          fontSize: '22px',
                          fontWeight: 800,
                          color: '#1a1a1a',
                          lineHeight: 1.2,
                        }}
                      >
                        {profile.first_name} {profile.last_name}
                        {profile.age ? `, ${profile.age}` : ''}
                      </h1>
                      <CheckCircle2 size={18} style={{ color: '#e94057', flexShrink: 0 }} />
                    </div>
                  </div>

                  {/* Username */}
                  <p style={{ fontSize: '12px', color: '#bbb', marginBottom: '10px' }}>
                    @{profile.username}
                  </p>

                  {/* Location */}
                  {profile.location_city && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginBottom: '14px',
                      }}
                    >
                      <MapPin size={12} style={{ color: '#e94057' }} />
                      <span style={{ fontSize: '13px', color: '#aaa' }}>
                        {profile.location_city}
                      </span>
                    </div>
                  )}

                  {/* Connection status banner */}
                  {profile.is_connected && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(233,64,87,0.07)',
                        border: '1px solid rgba(233,64,87,0.15)',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        marginBottom: '14px',
                      }}
                    >
                      <Zap size={13} style={{ color: '#e94057' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#e94057' }}>
                        You're connected — you can chat!
                      </span>
                    </div>
                  )}
                  {!profile.is_connected && profile.liked_me && !profile.liked_by_me && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(251,191,36,0.08)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        marginBottom: '14px',
                      }}
                    >
                      <Heart size={13} style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>
                        {profile.first_name} already liked you — like back to connect!
                      </span>
                    </div>
                  )}

                  {/* Bio */}
                  {profile.biography && (
                    <p
                      style={{
                        fontSize: '13.5px',
                        color: '#555',
                        lineHeight: 1.6,
                        marginBottom: '18px',
                      }}
                    >
                      {profile.biography}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {(profile.tags ?? []).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '4px 13px',
                          borderRadius: '999px',
                          background: '#fff0f2',
                          color: '#e94057',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid #ffd6db',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Photo strip ── */}
          {sorted.length > 1 && (
            <div
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '20px 22px',
                border: '1px solid #f0f0f0',
              }}
            >
              <h3
                style={{ fontSize: '15px', fontWeight: 700, color: '#222', marginBottom: '16px' }}
              >
                Photos
              </h3>
              <div
                style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}
              >
                {sorted.map((photo, i) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                      width: '140px',
                      height: '180px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2px solid ${activePhoto === i ? '#e94057' : '#f0f0f0'}`,
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── About ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px 22px',
              border: '1px solid #f0f0f0',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222', marginBottom: '16px' }}>
              About
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              {[
                { label: 'City', value: profile.location_city },
                { label: 'Age', value: profile.age ? `${profile.age} years old` : null },
                { label: 'Gender', value: profile.gender ? GENDERS[profile.gender] : null },
                {
                  label: 'Orientation',
                  value: profile.sexual_preference
                    ? PREFERENCES[profile.sexual_preference]
                    : 'Bisexual (default)',
                },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '2px' }}>{label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: value ? '#333' : '#ddd' }}>
                    {value ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Fame rating ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px 22px',
              border: '1px solid #f0f0f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>Fame Rating</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={13} style={{ color: '#e94057' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e94057' }}>{fame}</span>
              </div>
            </div>
            <div
              style={{
                height: '6px',
                borderRadius: '999px',
                background: '#f5f5f5',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: '999px',
                  background: '#e94057',
                  width: `${fame}%`,
                  transition: 'width 0.7s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '88px',
          }}
        >
          {/* ── Action buttons ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid #f0f0f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {actionError && (
              <p
                style={{
                  fontSize: '11px',
                  color: '#e94057',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertTriangle size={10} /> {actionError}
              </p>
            )}

            {/* Like / Unlike */}
            <button
              onClick={handleLike}
              disabled={likeLoading || profile.is_blocked}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px',
                borderRadius: '14px',
                border: 'none',
                cursor: profile.is_blocked ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
                background: profile.liked_by_me
                  ? '#fff0f2'
                  : 'linear-gradient(90deg, #C4364A, #e05570)',
                color: profile.liked_by_me ? '#e94057' : '#fff',
                border: profile.liked_by_me ? '2px solid #ffd6db' : 'none',
                opacity: profile.is_blocked ? 0.4 : 1,
              }}
            >
              {likeLoading ? (
                <Loader2 size={16} />
              ) : (
                <Heart size={16} fill={profile.liked_by_me ? '#e94057' : 'none'} />
              )}
              {profile.liked_by_me ? 'Unlike' : profile.liked_me ? 'Like back' : 'Like'}
            </button>

            {/* Chat — only if connected */}
            <button
              onClick={() => navigate(`/chat/${profile.id}`)}
              disabled={!profile.is_connected}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '14px',
                background: profile.is_connected ? '#f0fdf4' : '#f9f9f9',
                color: profile.is_connected ? '#16a34a' : '#ccc',
                border: `2px solid ${profile.is_connected ? '#bbf7d0' : '#f0f0f0'}`,
                cursor: profile.is_connected ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              <MessageCircle size={16} />
              {profile.is_connected ? 'Send message' : 'Match to chat'}
            </button>

            <div style={{ height: '1px', background: '#f5f5f5', margin: '4px 0' }} />

            {/* Block */}
            <button
              onClick={() => setConfirm(profile.is_blocked ? 'unblock' : 'block')}
              disabled={blockLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '13px',
                background: profile.is_blocked ? '#fff7ed' : '#fafafa',
                color: profile.is_blocked ? '#ea580c' : '#999',
                border: `1.5px solid ${profile.is_blocked ? '#fed7aa' : '#f0f0f0'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Ban size={14} />
              {profile.is_blocked ? 'Unblock user' : 'Block user'}
            </button>

            {/* Report */}
            <button
              onClick={() => !profile.is_fake_reported && setConfirm('report')}
              disabled={profile.is_fake_reported}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '13px',
                background: profile.is_fake_reported ? '#f9f9f9' : '#fafafa',
                color: profile.is_fake_reported ? '#ccc' : '#999',
                border: '1.5px solid #f0f0f0',
                cursor: profile.is_fake_reported ? 'not-allowed' : 'pointer',
              }}
            >
              <Flag size={14} />
              {profile.is_fake_reported ? 'Reported' : 'Report fake account'}
            </button>
          </div>

          {/* ── Profile stats ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid #f0f0f0',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#222', marginBottom: '14px' }}>
              Profile stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  <Eye size={13} style={{ color: '#e94057' }} /> Profile views
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>—</span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  <Heart size={13} style={{ color: '#e94057' }} /> Likes received
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>—</span>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  <Shield size={13} style={{ color: '#e94057' }} /> Member since
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>—</span>
              </div>
            </div>
          </div>

          {/* ── Back button ── */}
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              border: '1.5px solid #f0f0f0',
              background: '#fff',
              color: '#aaa',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
