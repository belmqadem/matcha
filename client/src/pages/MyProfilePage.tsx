import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Edit2,
  Loader2,
  LogOut,
  Flame,
  User,
  Sparkles,
  Calendar,
  Quote,
  MoreVertical,
  Camera,
  Eye,
  Heart,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from 'lucide-react';

import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { mapService } from '@/services/mapService';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile, Visitor, Liker } from '@/types/user';
import type { FullUser } from '@/types/auth';

import { CityName } from '@/components/ui/CityName';
import { PhotosPanel } from '@/components/profile/PhotosPanel';
import { EditFullProfileModal } from '@/components/profile/EditFullProfileModal';
import { GENDERS, PREFERENCES, DEFAULT_PREFERENCE } from '@/components/profile/profileConstants';

type ModalType = 'identity' | 'about' | 'tags' | 'location' | null;
type Tab = 'profile' | 'visitors' | 'liked-by';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PersonRow({
  src,
  initials,
  name,
  username,
  time,
}: {
  src: string | null;
  initials: string;
  name: string;
  username: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-background rounded-2xl transition-colors">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-primary">{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text truncate">{name}</p>
        <p className="text-xs text-text-muted">@{username}</p>
      </div>
      <span className="text-xs text-text-muted shrink-0">{time}</span>
    </div>
  );
}

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { logout: ctxLogout, updateUser } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editModal, setEditModal] = useState<ModalType>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [visitorsLoaded, setVisitorsLoaded] = useState(false);
  const [likedBy, setLikedBy] = useState<Liker[]>([]);
  const [likedByLoading, setLikedByLoading] = useState(false);
  const [likedByLoaded, setLikedByLoaded] = useState(false);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    updateUser(updated as unknown as FullUser);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    userService
      .getMe()
      .then(handleUpdateUser)
      .catch((e: unknown) =>
        setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'),
      )
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'visitors' && !visitorsLoaded && !visitorsLoading) {
      const fetchVisitors = async () => {
        setVisitorsLoading(true);
        try {
          const data = await userService.getVisitors();
          setVisitors(data);
        } catch {
          /* ignore */
        }
        setVisitorsLoaded(true);
        setVisitorsLoading(false);
      };
      void fetchVisitors();
    }
    if (activeTab === 'liked-by' && !likedByLoaded && !likedByLoading) {
      const fetchLikedBy = async () => {
        setLikedByLoading(true);
        try {
          const data = await userService.getLikedBy();
          setLikedBy(data);
        } catch {
          /* ignore */
        }
        setLikedByLoaded(true);
        setLikedByLoading(false);
      };
      void fetchLikedBy();
    }
  }, [activeTab, visitorsLoaded, visitorsLoading, likedByLoaded, likedByLoading]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    ctxLogout();
    navigate('/login');
  };

  const handleGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await mapService.updateGpsLocation(pos.coords.latitude, pos.coords.longitude);
          const updated = await userService.getMe();
          handleUpdateUser(updated);
        } catch {
          setGpsError('Failed to update location');
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsError('GPS denied — please enter your city manually');
        setGpsLoading(false);
        setEditModal('location');
      },
    );
  };

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
      </div>
    );

  if (fetchError || !user)
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4">
        <p className="text-sm sm:text-base font-medium text-text-muted">
          {fetchError || 'Profile not found.'}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-bold text-primary bg-surface px-6 py-2.5 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          Back to login
        </button>
      </div>
    );

  const age = user.birth_date
    ? new Date().getFullYear() - new Date(user.birth_date).getFullYear()
    : null;

  const genderLabel = GENDERS.find((g) => g.value === user.gender)?.label;
  const prefLabel =
    PREFERENCES.find((p) => p.value === user.sexual_preference)?.label ??
    PREFERENCES.find((p) => p.value === DEFAULT_PREFERENCE)?.label;

  const fame = user.fame_rating ?? 0;
  const fameColorClass =
    fame >= 70
      ? 'text-primary border-primary/30 bg-primary/10'
      : fame >= 40
        ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
        : 'text-text-muted border-border';

  const avatar = user.photos?.find((p) => p.id === user.profile_picture_id)?.url ?? null;
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  const completionSteps = [
    Boolean(user.gender),
    Boolean(user.biography),
    Boolean(user.latitude ?? user.location_city),
    (user.tags ?? []).length > 0,
    (user.photos ?? []).length > 0,
  ];
  const completionScore = completionSteps.filter(Boolean).length;
  const completionPct = Math.round((completionScore / 5) * 100);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    {
      id: 'visitors',
      label: visitorsLoaded ? `Visitors (${visitors.length})` : 'Visitors',
    },
    {
      id: 'liked-by',
      label: likedByLoaded ? `Liked by (${likedBy.length})` : 'Liked by',
    },
  ];

  const sectionLabel = 'text-xs font-black text-text-muted uppercase tracking-wider';

  return (
    <div className="flex flex-col flex-1 animate-fade-in-up">
      {editModal && (
        <EditFullProfileModal
          user={user}
          onUpdate={handleUpdateUser}
          initialTab={editModal}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* ── Hero banner ── */}
      <div className="bg-surface border-b border-border px-4 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-start gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary bg-primary/10 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt={user.first_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-primary">{initials}</span>
              )}
            </div>
            {user.is_online && (
              <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-400 border-2 border-surface shadow" />
            )}
          </div>

          {/* Info + actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* Name block */}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-black text-text leading-tight truncate">
                  {user.first_name} {user.last_name}
                  {age !== null && <span className="font-normal text-text-muted">, {age}</span>}
                </h1>
                <p className="text-xs sm:text-sm text-text-muted font-medium">@{user.username}</p>
                {(user.location_city ?? user.latitude) && (
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-primary shrink-0" />
                    {user.location_city ?? (
                      <CityName
                        lat={Number(user.latitude)}
                        lng={Number(user.longitude)}
                        fallback="Location set"
                      />
                    )}
                  </p>
                )}
              </div>

              {/* Edit + menu */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setEditModal('identity')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
                >
                  <Edit2 size={12} /> Edit Profile
                </button>
                <button
                  onClick={() => setEditModal('identity')}
                  className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Edit Profile"
                >
                  <Edit2 size={13} />
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu((o) => !o)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                      showMenu
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border text-text-muted hover:border-primary hover:text-primary'
                    }`}
                  >
                    <MoreVertical size={15} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-2xl shadow-xl py-1.5 z-30 animate-fade-in-up origin-top-right">
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors text-left disabled:opacity-50"
                      >
                        {loggingOut ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <LogOut size={13} />
                        )}
                        {loggingOut ? 'Signing out…' : 'Sign out'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fame pill + completion bar */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold border rounded-full px-3 py-1 ${fameColorClass}`}
              >
                <Flame size={11} /> {Math.round(fame)}/100
              </span>
              {completionPct === 100 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400">
                  <CheckCircle2 size={13} /> Complete ✓
                </span>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-30 max-w-45">
                  <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted font-medium whitespace-nowrap">
                    {completionPct}% complete
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="bg-surface border-b border-border px-4 sm:px-6 sticky top-14 z-10">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* ── Profile tab ── */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="flex flex-col gap-6">
                {/* Photos */}
                <div className="bg-surface border border-border/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`${sectionLabel} flex items-center gap-1.5`}>
                      <Camera size={12} /> Photos
                      <span className="ml-1 font-bold text-primary">
                        {user.photos?.length ?? 0}/5
                      </span>
                    </h2>
                  </div>
                  <PhotosPanel user={user} onUpdate={handleUpdateUser} />
                  {!user.profile_picture_id && (
                    <p className="mt-3 text-xs text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle size={11} className="shrink-0" />
                      Set a profile picture to be able to like other users
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="bg-surface border border-border/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`${sectionLabel} flex items-center gap-1.5`}>
                      <MapPin size={12} /> Location
                    </h2>
                    <button
                      onClick={() => setEditModal('location')}
                      className="text-text-muted hover:text-primary transition-colors"
                      aria-label="Edit location"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>

                  {(user.location_city ?? user.latitude) ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-text">
                        {user.location_city ?? (
                          <CityName
                            lat={Number(user.latitude)}
                            lng={Number(user.longitude)}
                            fallback="Location set"
                          />
                        )}
                      </span>
                      {user.latitude && (
                        <span className="text-[10px] text-text-muted bg-background border border-border px-2 py-0.5 rounded-full font-mono">
                          {Number(user.latitude).toFixed(2)}, {Number(user.longitude).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400 flex items-center gap-1.5 mb-3">
                      <AlertTriangle size={11} className="shrink-0" />
                      Location required for matching
                    </p>
                  )}

                  <button
                    onClick={handleGpsLocation}
                    disabled={gpsLoading}
                    className="mt-3 flex items-center gap-2 text-xs font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {gpsLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Navigation size={12} />
                    )}
                    Use my GPS location
                  </button>
                  {gpsError && (
                    <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={11} className="shrink-0" /> {gpsError}
                    </p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-6">
                {/* Biography */}
                <div className="bg-surface border border-border/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`${sectionLabel} flex items-center gap-1.5`}>
                      <Quote size={12} /> Biography
                    </h2>
                    <button
                      onClick={() => setEditModal('about')}
                      className="text-text-muted hover:text-primary transition-colors"
                      aria-label="Edit biography"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                  {user.biography ? (
                    <blockquote className="rounded-r-xl overflow-hidden">
                      <p className="text-sm text-text italic leading-relaxed wrap-break-word">
                        {user.biography}
                      </p>
                    </blockquote>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle size={11} /> Biography required
                      </p>
                      <button
                        onClick={() => setEditModal('about')}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Add biography
                      </button>
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div className="bg-surface border border-border/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`${sectionLabel} flex items-center gap-1.5`}>
                      <Tag size={12} /> Interests
                    </h2>
                    <button
                      onClick={() => setEditModal('tags')}
                      className="text-text-muted hover:text-primary transition-colors"
                      aria-label="Edit interests"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                  {(user.tags ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {user.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-background border border-border text-text-muted text-xs font-bold"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle size={11} /> Add at least one interest tag
                      </p>
                      <button
                        onClick={() => setEditModal('tags')}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Add tags
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile info grid */}
                <div className="bg-surface border border-border/80 rounded-2xl p-4">
                  <h2 className={`${sectionLabel} mb-3`}>Profile Info</h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { Icon: User, label: 'Gender', value: genderLabel ?? 'Not set' },
                      { Icon: Sparkles, label: 'Looking for', value: prefLabel ?? 'Not set' },
                      {
                        Icon: Calendar,
                        label: 'Age',
                        value: user.birth_date ? `${age} yrs` : 'Not set',
                      },
                      {
                        Icon: Flame,
                        label: 'Fame Rating',
                        value: `${Math.round(fame)}/100`,
                        primary: true,
                      },
                    ].map(({ Icon, label, value, primary }) => (
                      <div
                        key={label}
                        className="bg-background/40 border border-border/50 p-2.5 rounded-2xl flex items-center gap-2"
                      >
                        <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">
                            {label}
                          </p>
                          <p
                            className={`text-xs font-bold mt-0.5 truncate leading-tight ${primary ? 'text-primary' : 'text-text'}`}
                          >
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fame rating card */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${sectionLabel} flex items-center gap-1.5`}>
                      <Flame size={12} /> Fame Rating
                    </span>
                    <span className="text-lg font-black text-primary">{Math.round(fame)}/100</span>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${fame}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">
                    Increased by likes and profile views. Decreased by blocks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Visitors tab ── */}
          {activeTab === 'visitors' && (
            <div>
              <h2 className={`${sectionLabel} flex items-center gap-1.5 mb-4`}>
                <Eye size={12} /> Who viewed your profile
              </h2>
              {visitorsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : visitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-4xl mb-3">👀</span>
                  <p className="text-sm font-medium text-text-muted">No profile views yet</p>
                </div>
              ) : (
                <div className="bg-surface border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/50">
                  {visitors.map((v) => {
                    const ini = `${v.first_name?.[0] ?? ''}${v.last_name?.[0] ?? ''}`.toUpperCase();
                    return (
                      <PersonRow
                        key={v.id}
                        src={v.profile_picture_url}
                        initials={ini}
                        name={`${v.first_name} ${v.last_name}`}
                        username={v.username}
                        time={timeAgo(v.visited_at)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Liked by tab ── */}
          {activeTab === 'liked-by' && (
            <div>
              <h2 className={`${sectionLabel} flex items-center gap-1.5 mb-4`}>
                <Heart size={12} /> People who liked you
              </h2>
              {likedByLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : likedBy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-4xl mb-3">💛</span>
                  <p className="text-sm font-medium text-text-muted">No likes yet</p>
                </div>
              ) : (
                <div className="bg-surface border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/50">
                  {likedBy.map((l) => {
                    const ini = `${l.first_name?.[0] ?? ''}${l.last_name?.[0] ?? ''}`.toUpperCase();
                    return (
                      <PersonRow
                        key={l.id}
                        src={l.profile_picture_url}
                        initials={ini}
                        name={`${l.first_name} ${l.last_name}`}
                        username={l.username}
                        time={timeAgo(l.created_at)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
