import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, ArrowLeft, MapPin, Clock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Visitor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  visited_at: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getVisitors: () =>
    fetch('/api/profile/me/visitors', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.visitors as Visitor[]),
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Avatar initials + color
const COLORS = [
  '#e94057', '#f97316', '#8b5cf6', '#06b6d4',
  '#10b981', '#f59e0b', '#ec4899', '#6366f1',
];
function colorFor(id: number) {
  return COLORS[id % COLORS.length];
}

// ─── Visitor Card ─────────────────────────────────────────────────────────────

function VisitorCard({ visitor, onClick }: { visitor: Visitor; onClick: () => void }) {
  const color = colorFor(visitor.id);
  const initials = `${visitor.first_name[0]}${visitor.last_name[0]}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: '18px',
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Photo area */}
      <div style={{ position: 'relative', height: '200px', background: '#f5f5f5', flexShrink: 0 }}>
        {visitor.profile_picture_url ? (
          <img
            src={visitor.profile_picture_url}
            alt={visitor.first_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${color}15`,
          }}>
            <span style={{ fontSize: '40px', fontWeight: 800, color }}>{initials}</span>
          </div>
        )}

        {/* Time badge */}
        <span style={{
          position: 'absolute', bottom: '10px', right: '10px',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          color: '#fff', fontSize: '10px', fontWeight: 600,
          padding: '3px 9px', borderRadius: '999px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <Clock size={9} /> {timeAgo(visitor.visited_at)}
        </span>
      </div>

      {/* Info area */}
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
          {visitor.first_name} {visitor.last_name}
        </p>
        <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '8px' }}>@{visitor.username}</p>
        <p style={{
          fontSize: '10px', color: '#ccc',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <Clock size={9} />
          {formatDate(visitor.visited_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
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
        <Eye size={28} style={{ color: '#e94057', opacity: 0.5 }} />
      </div>
      <p style={{ fontSize: '16px', fontWeight: 700, color: '#333' }}>No visitors yet</p>
      <p style={{ fontSize: '13px', color: '#bbb', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>
        People who visit your profile will appear here. Complete your profile to attract more visitors!
      </p>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ visitors }: { visitors: Visitor[] }) {
  const today = visitors.filter(v => {
    const diff = Date.now() - new Date(v.visited_at).getTime();
    return diff < 86400000;
  }).length;

  const week = visitors.filter(v => {
    const diff = Date.now() - new Date(v.visited_at).getTime();
    return diff < 7 * 86400000;
  }).length;

  const stats = [
    { label: 'Total visitors', value: visitors.length },
    { label: 'Last 24h', value: today },
    { label: 'Last 7 days', value: week },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px', marginBottom: '28px',
    }}>
      {stats.map(({ label, value }) => (
        <div key={label} style={{
          background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0',
          padding: '16px 20px',
        }}>
          <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '4px', fontWeight: 500, letterSpacing: '0.03em' }}>{label}</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: '#e94057', lineHeight: 1 }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const VisitorsPage = () => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');

  useEffect(() => {
    api.getVisitors()
      .then((v) => setVisitors(v ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...visitors].sort((a, b) => {
    const diff = new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
    return sort === 'recent' ? diff : -diff;
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
                Profile visitors
              </h1>
              {!loading && (
                <p style={{ fontSize: '12px', color: '#bbb', marginTop: '3px' }}>
                  {visitors.length} {visitors.length === 1 ? 'person' : 'people'} visited your profile
                </p>
              )}
            </div>
          </div>

          {/* Sort control */}
          {visitors.length > 0 && (
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

        {/* ── Body ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Loader2 size={28} style={{ color: '#e94057' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#bbb', fontSize: '13px' }}>
            {error}
          </div>
        ) : visitors.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StatsBar visitors={visitors} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
            }}>
              {sorted.map((visitor) => (
                <VisitorCard
                  key={visitor.id}
                  visitor={visitor}
                  onClick={() => navigate(`/profile/${visitor.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorsPage;
