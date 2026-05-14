import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  Flag,
  Ban,
  Check,
  Loader2,
  MessageCircle,
  Star,
  Eye,
  Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Photo {
  id: number;
  url: string;
  order_index: number;
  created_at: string;
}

interface ViewUserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  sexual_preference: string | null;
  biography: string | null;
  location_city: string | null;
  fame_rating: number;
  is_online: boolean;
  last_seen: string | null;
  distance_km: number | null;
  birth_date: string | null;
  created_at: string;
  profile_picture_id: number | null;
  photos: Photo[];
  tags: string[];
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
  is_blocked_by_me: boolean;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const api = {
  getUser: (id: string) =>
    fetch(`/api/users/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) throw new Error(d.error ?? 'User not found');
        return d.user as ViewUserProfile;
      }),

  likeUser: (id: string) =>
    fetch(`/api/likes/${id}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (!r.ok) throw new Error(d.error ?? 'Failed to like');
        return d;
      }),

  unlikeUser: (id: string) =>
    fetch(`/api/likes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (!r.ok) throw new Error(d.error ?? 'Failed to unlike');
        return d;
      }),

  blockUser: (id: string) =>
    fetch(`/api/blocks/${id}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (!r.ok) throw new Error(d.error ?? 'Failed to block');
        return d;
      }),

  unblockUser: (id: string) =>
    fetch(`/api/blocks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (!r.ok) throw new Error(d.error ?? 'Failed to unblock');
        return d;
      }),

  reportUser: (id: string, reason?: string) =>
    fetch(`/api/reports/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reason }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!r.ok) throw new Error(d.error ?? 'Failed to report');
        return d;
      }),
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function fameLabel(rating: number) {
  if (rating >= 80) return { text: 'Very high', color: '#10b981' };
  if (rating >= 60) return { text: 'High', color: '#34d399' };
  if (rating >= 40) return { text: 'Average', color: '#f59e0b' };
  if (rating >= 20) return { text: 'Low', color: '#f97316' };
  return { text: 'New', color: '#94a3b8' };
}

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 4) return `${w}w ago`;
  return new Date(iso).toLocaleDateString();
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ViewUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [liking, setLiking] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const u = await api.getUser(id);
        setUser(u);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--color-background)">
        <Loader2 className="animate-spin text-(--color-primary)" size={32} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-(--color-background) p-4">
        <p className="text-sm text-(--color-error)">{error || 'Profile not found'}</p>
        <button
          onClick={() => navigate('/browse')}
          className="px-4 py-2 rounded-lg bg-(--color-primary) text-white text-xs font-semibold hover:opacity-90"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const age = calculateAge(user.birth_date);
  const fame = fameLabel(user.fame_rating);
  const mainPhoto = user.photos.find((p) => p.id === user.profile_picture_id);
  const selectedPhoto = user.photos[selectedPhotoIndex];
  const photoToDisplay = selectedPhoto || mainPhoto;

  const handleLike = async () => {
    setLiking(true);
    try {
      if (user.liked_by_me) {
        await api.unlikeUser(user.id);
        setUser((u) => (u ? { ...u, liked_by_me: false } : u));
      } else {
        await api.likeUser(user.id);
        setUser((u) => (u ? { ...u, liked_by_me: true } : u));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const handleBlock = async () => {
    setBlocking(true);
    try {
      if (user.is_blocked_by_me) {
        await api.unblockUser(user.id);
        setUser((u) => (u ? { ...u, is_blocked_by_me: false } : u));
      } else {
        if (confirm('Are you sure? This will remove any connections and hide both profiles.')) {
          await api.blockUser(user.id);
          setUser((u) => (u ? { ...u, is_blocked_by_me: true } : u));
        }
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update block');
    } finally {
      setBlocking(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Report reason (optional):');
    if (reason === null) return;

    setReporting(true);
    try {
      await api.reportUser(user.id, reason || undefined);
      alert('Thanks for reporting. Our team will review this.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to report');
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--color-background)">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-(--color-border) px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-(--color-background) rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-(--color-text)" />
        </button>
        <div>
          <p className="text-sm font-semibold text-(--color-text)">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-xs text-(--color-text-muted)">@{user.username}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Photo Gallery */}
        {photoToDisplay ? (
          <div className="relative bg-black aspect-square overflow-hidden">
            <img src={photoToDisplay.url} alt="Profile" className="w-full h-full object-cover" />

            {/* Photo thumbnails */}
            {user.photos.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                {user.photos.slice(0, 5).map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      idx === selectedPhotoIndex
                        ? 'border-(--color-primary)'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-(--color-background) aspect-square flex items-center justify-center border border-(--color-border) rounded-lg">
            <p className="text-(--color-text-muted) text-sm">No photos</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex gap-2 p-4 border-b border-(--color-border) bg-white">
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              user.liked_by_me
                ? 'bg-(--color-primary) text-white hover:opacity-90'
                : 'border border-(--color-border) text-(--color-text) hover:bg-(--color-background)'
            }`}
          >
            <Heart size={16} fill={user.liked_by_me ? 'currentColor' : 'none'} />
            {user.liked_by_me ? 'Liked' : 'Like'}
          </button>

          {/* Message button (only if connected) */}
          {user.is_connected && (
            <button
              onClick={() => navigate(`/chat/${user.id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-(--color-border) text-(--color-text) font-semibold text-sm hover:bg-(--color-background) transition-all"
            >
              <MessageCircle size={16} />
              Message
            </button>
          )}

          {/* Block button */}
          <button
            onClick={handleBlock}
            disabled={blocking}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              user.is_blocked_by_me
                ? 'border border-(--color-border) bg-white text-(--color-text) hover:bg-(--color-background)'
                : 'border border-(--color-border) text-(--color-text-muted) hover:text-(--color-error) hover:border-(--color-error)'
            }`}
          >
            <Ban size={16} />
            {user.is_blocked_by_me ? 'Unblock' : 'Block'}
          </button>

          {/* Report button */}
          <button
            onClick={handleReport}
            disabled={reporting}
            className="p-2.5 rounded-xl border border-(--color-border) text-(--color-text-muted) hover:text-(--color-error) hover:border-(--color-error) transition-all"
            title="Report this profile"
          >
            <Flag size={16} />
          </button>
        </div>

        {/* Basic Info */}
        <div className="bg-white border-b border-(--color-border) p-6 space-y-5">
          {/* Name & basics */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-(--color-text-muted) uppercase mb-3">
              Identity
            </p>
            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-(--color-text-muted) mb-1">Full name</p>
                <p className="text-sm font-medium text-(--color-text)">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--color-text-muted) mb-1">Username</p>
                <p className="text-sm font-medium text-(--color-text)">@{user.username}</p>
              </div>
              {age && (
                <div>
                  <p className="text-xs text-(--color-text-muted) mb-1">Age</p>
                  <p className="text-sm font-medium text-(--color-text)">{age} years old</p>
                </div>
              )}
              {user.gender && (
                <div>
                  <p className="text-xs text-(--color-text-muted) mb-1">Gender</p>
                  <p className="text-sm font-medium text-(--color-text) capitalize">
                    {user.gender.replace('_', ' ')}
                  </p>
                </div>
              )}
              {user.sexual_preference && (
                <div>
                  <p className="text-xs text-(--color-text-muted) mb-1">Interested in</p>
                  <p className="text-sm font-medium text-(--color-text) capitalize">
                    {user.sexual_preference.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {user.location_city && (
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-(--color-primary) flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-(--color-text-muted) mb-1">Location</p>
                <p className="text-sm font-medium text-(--color-text)">{user.location_city}</p>
                {user.distance_km != null && (
                  <p className="text-xs text-(--color-text-muted) mt-1">
                    {user.distance_km.toFixed(1)} km away
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fame Rating */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-(--color-background) border border-(--color-border)">
            <Star size={14} className="flex-shrink-0 mt-1" style={{ color: fame.color }} />
            <div className="flex-1">
              <p className="text-xs text-(--color-text-muted) mb-1">Popularity</p>
              <p className="text-sm font-semibold" style={{ color: fame.color }}>
                {fame.text} ({user.fame_rating.toFixed(1)}/100)
              </p>
            </div>
          </div>

          {/* Online Status */}
          <div className="flex items-start gap-3">
            {user.is_online ? (
              <>
                <Eye size={14} className="text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-(--color-text-muted) mb-1">Status</p>
                  <p className="text-sm font-medium text-(--color-text)">Online now</p>
                </div>
              </>
            ) : (
              <>
                <Clock size={14} className="text-(--color-text-muted) flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-(--color-text-muted) mb-1">Last seen</p>
                  <p className="text-sm font-medium text-(--color-text)">
                    {user.last_seen ? timeAgo(user.last_seen) : 'Unknown'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.biography && (
          <div className="bg-white border-b border-(--color-border) p-6">
            <p className="text-[10px] font-bold tracking-widest text-(--color-text-muted) uppercase mb-3">
              About
            </p>
            <p className="text-sm text-(--color-text-muted) leading-relaxed">{user.biography}</p>
          </div>
        )}

        {/* Tags */}
        {user.tags && user.tags.length > 0 && (
          <div className="bg-white border-b border-(--color-border) p-6">
            <p className="text-[10px] font-bold tracking-widest text-(--color-text-muted) uppercase mb-3">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {user.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs font-medium border border-(--color-primary)/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
