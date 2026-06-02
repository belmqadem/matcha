import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, ArrowLeft, Clock, HeartHandshake } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Liker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  liked_at: string;
}

interface LikedUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  liked_at: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getLikedBy: () =>
    fetch('/api/profile/me/liked-by', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.likers as Liker[]),

  getLikedByMe: () =>
    fetch('/api/profile/me/liked', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.liked as LikedUser[]),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const COLORS = [
  '#e94057', '#f97316', '#8b5cf6', '#06b6d4',
  '#10b981', '#f59e0b', '#ec4899', '#6366f1',
];
function colorFor(id: number | string) {
  const n = typeof id === 'string' ? parseInt(id, 16) || 0 : id;
  return COLORS[n % COLORS.length];
}

// ─── Like Card ────────────────────────────────────────────────────────────────

function LikeCard({
  user,
  timeProp,
  isMutual,
  onClick,
}: {
  user: Liker | LikedUser;
  timeProp: string;
  isMutual: boolean;
  onClick: () => void;
}) {
  const color = colorFor(user.id);
  const initials = `${user.first_name[0]}${(user.last_name?.[0] ?? '')}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: '18px',
        border: isMutual ? '1.5px solid #e94057' : '1px solid #f0f0f0',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Mutual match badge */}
      {isMutual && (
        <div style={{
          position: 'absolute', top: '10px', left: '10px', zIndex: 2,
          background: '#e94057', color: '#fff',
          fontSize: '9px', fontWeight: 700, padding: '3px 9px',
          borderRadius: '999px', letterSpacing: '0.05em',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <HeartHandshake size={9} /> MATCH
        </div>
      )}

      {/* Photo */}
      <div style={{ position: 'relative', height: '200px', background: '#f5f5f5', flexShrink: 0 }}>
        {user.profile_picture_url ? (
          <img
            src={user.profile_picture_url}
            alt={user.first_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${color}15`,
          }}>
            <span style={{ fontSize: '36px', fontWeight: 800, color }}>{initials}</span>
          </div>
        )}

        {/* Time badge */}
        <span style={{
          position: 'absolute', bottom: '10px', right: '10px',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff', fontSize: '10px', fontWeight: 600,
          padding: '3px 9px', borderRadius: '999px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <Clock size={9} /> {timeAgo(timeProp)}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
          {user.first_name} {user.last_name}
        </p>
        <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '6px' }}>@{user.username}</p>
        <p style={{ fontSize: '10px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={9} /> {formatDate(timeProp)}
        </p>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ likedBy, likedByMe }: { likedBy: Liker[]; likedByMe: LikedUser[] }) {
  const mutualIds = new Set(likedBy.map(u => String(u.id)));
  const matches = likedByMe.filter(u => mutualIds.has(String(u.id))).length;

  const stats = [
    { label: 'Liked me', value: likedBy.length },
    { label: 'I liked', value: likedByMe.length },
    { label: 'Mutual matches', value: matches },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px', marginBottom: '28px',
    }}>
      {stats.map(({ label, value }) => (
        <div key={label} style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #f0f0f0', padding: '16px 20px',
        }}>
          <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#e94057', lineHeight: 1 }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: 'liked-me' | 'i-liked' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 24px', gap: '14px',
    }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: 'rgba(233,64,87,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Heart size={28} style={{ color: '#e94057', opacity: 0.5 }} />
      </div>
      <p style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>
        {tab === 'liked-me' ? 'No likes yet' : "You haven't liked anyone yet"}
      </p>
      <p style={{ fontSize: '13px', color: '#bbb', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>
        {tab === 'liked-me'
          ? 'Complete your profile and start browsing to attract likes!'
          : 'Head to the browse page to discover people you might like.'}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const LikesPage = () => {
  const navigate = useNavigate();
  const [likedBy, setLikedBy] = useState<Liker[]>([]);
  const [likedByMe, setLikedByMe] = useState<LikedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'liked-me' | 'i-liked'>('liked-me');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');

  useEffect(() => {
    Promise.all([api.getLikedBy(), api.getLikedByMe()])
      .then(([lb, lm]) => { setLikedBy(lb ?? []); setLikedByMe(lm ?? []); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  // Compute mutual set
  const likedByMeIds = new Set(likedByMe.map(u => String(u.id)));
  const likedByIds = new Set(likedBy.map(u => String(u.id)));

  const activeList = tab === 'liked-me' ? likedBy : likedByMe;
  const sorted = [...activeList].sort((a, b) => {
    const ta = new Date('liked_at' in a ? a.liked_at : a.liked_at).getTime();
    const tb = new Date('liked_at' in b ? b.liked_at : b.liked_at).getTime();
    return sort === 'recent' ? tb - ta : ta - tb;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f4f4',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1.5px solid #eee', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#888',
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
                Likes
              </h1>
              {!loading && (
                <p style={{ fontSize: '12px', color: '#bbb', marginTop: '3px' }}>
                  {likedBy.length} {likedBy.length === 1 ? 'person likes' : 'people like'} your profile
                </p>
              )}
            </div>
          </div>

          {/* Sort control */}
          {activeList.length > 0 && (
            <div style={{
              display: 'flex', gap: '6px',
              background: '#fff', borderRadius: '12px',
              border: '1px solid #f0f0f0', padding: '4px',
            }}>
              {(['recent', 'oldest'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  style={{
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: sort === s ? '#e94057' : 'transparent',
                    color: sort === s ? '#fff' : '#bbb',
                    transition: 'all 0.15s',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Loader2 size={28} style={{ color: '#e94057' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#bbb', fontSize: '13px' }}>{error}</div>
        ) : (
          <>
            <StatsBar likedBy={likedBy} likedByMe={likedByMe} />

            {/* ── Tabs ── */}
            <div style={{
              display: 'flex', gap: '0',
              background: '#fff', borderRadius: '14px',
              border: '1px solid #f0f0f0', padding: '4px',
              marginBottom: '24px', width: 'fit-content',
            }}>
              {([
                { key: 'liked-me' as const, label: 'Liked me', count: likedBy.length },
                { key: 'i-liked' as const, label: 'I liked', count: likedByMe.length },
              ]).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '8px 18px', fontSize: '13px', fontWeight: 600,
                    borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: tab === key ? '#e94057' : 'transparent',
                    color: tab === key ? '#fff' : '#bbb',
                    transition: 'all 0.15s',
                  }}
                >
                  <Heart size={12} fill={tab === key ? '#fff' : 'none'} />
                  {label}
                  <span style={{
                    padding: '1px 7px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                    background: tab === key ? 'rgba(255,255,255,0.25)' : '#f5f5f5',
                    color: tab === key ? '#fff' : '#aaa',
                  }}>{count}</span>
                </button>
              ))}
            </div>

            {/* ── Grid ── */}
            {sorted.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px',
              }}>
                {sorted.map((user) => {
                  const isMutual = tab === 'liked-me'
                    ? likedByMeIds.has(String(user.id))
                    : likedByIds.has(String(user.id));
                  const timeProp = user.liked_at;
                  return (
                    <LikeCard
                      key={user.id}
                      user={user}
                      timeProp={timeProp}
                      isMutual={isMutual}
                      onClick={() => navigate(`/profile/${user.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LikesPage;
