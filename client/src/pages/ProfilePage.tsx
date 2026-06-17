import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Loader2,
  AlertCircle,
  MoreVertical,
  Ban,
  Flag,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Flame,
  Sparkles,
} from 'lucide-react';
import { userService } from '@/services/userService';
import type { PublicProfile } from '@/types/user';
import { ConfirmModal } from '@/components/profile/ConfirmModal';
import { GENDERS, PREFERENCES } from '@/components/profile/profileConstants';

export default function ProfilePage() {
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
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!id) return;
    let aborted = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      setProfile(null);
      setActivePhoto(0);

      try {
        const p = await userService.getPublicProfile(id);
        if (aborted) return;
        if (p.is_blocked) {
          setError('User not found.');
          return;
        }
        setProfile(p);
        if (p.profile_picture_id) {
          const idx = p.photos.findIndex((ph) => ph.id === p.profile_picture_id);
          if (idx >= 0) setActivePhoto(idx);
        }
      } catch (e) {
        if (aborted) return;
        setError(e instanceof Error ? e.message : 'Failed to load profile.');
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    void fetchProfile();

    return () => {
      aborted = true;
    };
  }, [id]);

  const handleLike = async () => {
    if (!profile) return;
    setLikeLoading(true);
    setActionError('');
    try {
      if (profile.liked_by_me) {
        await userService.unlike(profile.id);
        setProfile((p) => (p ? { ...p, liked_by_me: false, is_connected: false } : p));
      } else {
        const res = await userService.like(profile.id);
        setProfile((p) =>
          p ? { ...p, liked_by_me: true, is_connected: res.connected ?? p.liked_me } : p,
        );
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    setConfirm(null);
    setBlockLoading(true);
    setActionError('');
    try {
      if (profile.is_blocked_by_me) {
        await userService.unblock(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked_by_me: false } : p));
      } else {
        await userService.block(profile.id);
        navigate('/browse');
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleReport = async () => {
    if (!profile) return;
    setConfirm(null);
    try {
      await userService.report(profile.id);
      setProfile((p) => (p ? { ...p, is_fake_reported: true } : p));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Report failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="bg-surface border border-border p-8 rounded-3xl shadow-premium flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="bg-surface border border-border p-6 rounded-3xl shadow-premium flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 text-error animate-pulse" />
          <p className="text-sm font-bold text-text">{error || 'Profile not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-full bg-primary text-text text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sortedPhotos = profile.photos
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const activeUrl = sortedPhotos[activePhoto]?.url ?? sortedPhotos[0]?.url;

  const genderLabel = GENDERS.find((g) => g.value === profile.gender)?.label ?? 'Not specified';
  const prefLabel =
    PREFERENCES.find((p) => p.value === profile.sexual_preference)?.label ?? 'Bisexual';

  return (
    <div className="flex flex-col flex-1 animate-fade-in-up">
      {confirm === 'block' && (
        <ConfirmModal
          title="Block this user?"
          message="They will no longer appear in your results or be able to chat with you."
          confirmLabel="Block"
          danger
          onConfirm={handleBlock}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'unblock' && (
        <ConfirmModal
          title="Unblock this user?"
          message="They will be able to appear in your results and contact you again."
          confirmLabel="Unblock"
          onConfirm={handleBlock}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === 'report' && (
        <ConfirmModal
          title="Report as fake?"
          message="You're about to report this profile as fake. This action cannot be undone."
          confirmLabel="Report"
          danger
          onConfirm={handleReport}
          onClose={() => setConfirm(null)}
        />
      )}

      {/* Page header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-border/60 bg-surface/85 backdrop-blur-md gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full border border-border/80 bg-surface flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-all active:scale-90 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            disabled={likeLoading || blockLoading}
            onClick={() => setShowMenu(!showMenu)}
            className={`w-8 h-8 rounded-full border bg-surface flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
              showMenu
                ? 'border-primary text-primary shadow-sm shadow-primary/20'
                : 'border-border/80 text-text-muted hover:border-primary hover:text-primary'
            } ${likeLoading || blockLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {likeLoading || blockLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface/90 backdrop-blur-md border border-border/80 rounded-2xl shadow-premium py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
              {profile.is_connected && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLike();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-error hover:bg-error/10 hover:text-error transition-colors flex items-center gap-2 cursor-pointer border-b border-border/40 pb-2.5 mb-1"
                >
                  <Heart className="w-3.5 h-3.5 text-error fill-current" />
                  Unmatch
                </button>
              )}

              <button
                onClick={() => {
                  setShowMenu(false);
                  setConfirm(profile.is_blocked_by_me ? 'unblock' : 'block');
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-text hover:bg-error/10 hover:text-error transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5 text-text-muted" />
                {profile.is_blocked_by_me ? 'Unblock User' : 'Block User'}
              </button>

              {!profile.is_fake_reported && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setConfirm('report');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-text hover:bg-error/10 hover:text-error transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-text-muted" />
                  Report Fake
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-215 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column — Photos */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-background border border-border/50 shadow-md group">
                {activeUrl ? (
                  <img
                    src={activeUrl}
                    alt={profile.first_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-6xl font-black">
                    {profile.first_name[0]}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />

                {sortedPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActivePhoto((prev) =>
                          prev > 0 ? prev - 1 : sortedPhotos.length - 1,
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-text flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setActivePhoto((prev) =>
                          prev < sortedPhotos.length - 1 ? prev + 1 : 0,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-text flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {sortedPhotos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
                  {sortedPhotos.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePhoto(idx)}
                      className={`w-11 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activePhoto === idx
                          ? 'border-primary scale-102 shadow-sm shadow-primary/30'
                          : 'border-border/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column — Details */}
            <div className="md:col-span-7 flex flex-col gap-4 min-w-0">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-text tracking-tight flex items-center gap-1.5 truncate">
                      {profile.first_name} {profile.last_name}
                      {profile.age ? (
                        <span className="font-normal text-text-muted">, {profile.age}</span>
                      ) : (
                        ''
                      )}
                    </h2>
                    <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shadow-sm shrink-0">
                      <Flame className="w-3.5 h-3.5 text-primary fill-primary/10" />
                      <span className="text-[11px] font-black text-primary">
                        {Math.round(profile.fame_rating)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-text-muted">@{profile.username}</p>

                  {profile.location_city && (
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-text-muted">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      {profile.location_city}
                    </div>
                  )}
                </div>

                {!profile.is_connected && profile.liked_me && !profile.liked_by_me && (
                  <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/25 rounded-full px-3.5 py-1.5 w-max">
                    <Heart className="w-3 h-3 text-primary fill-current animate-pulse" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-wider">
                      Likes you! Like back to connect
                    </span>
                  </div>
                )}

                {profile.biography && (
                  <div className="pt-3 border-t border-border/55">
                    <h3 className="text-xs font-black text-text-muted uppercase tracking-wider mb-2">
                      Biography
                    </h3>
                    <p className="text-sm text-text leading-relaxed whitespace-pre-wrap wrap-break-word overflow-hidden">
                      {profile.biography}
                    </p>
                  </div>
                )}

                {(profile.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-background border border-border text-text-muted text-[11px] font-bold hover:border-primary hover:text-primary transition-colors cursor-default animate-in fade-in duration-300"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border/55">
                {actionError && (
                  <p className="text-xs text-error font-medium mb-3 text-center">{actionError}</p>
                )}
                <div className="flex gap-3">
                  {profile.is_connected ? (
                    <button
                      onClick={() => navigate(`/chat/${profile.id}`)}
                      className="w-full py-2.5 rounded-full bg-primary text-white hover:bg-primary-hover font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-primary/20"
                    >
                      Send Message
                    </button>
                  ) : (
                    <button
                      onClick={handleLike}
                      disabled={likeLoading}
                      className={`w-full py-2.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                        profile.liked_by_me
                          ? 'bg-transparent border border-primary text-primary hover:bg-primary/10'
                          : 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${profile.liked_by_me ? 'fill-primary text-primary' : ''}`}
                      />
                      {profile.liked_by_me ? 'Unlike' : 'Like'}
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Info Grid */}
              <div className="pt-3 border-t border-border/55 space-y-2.5">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                  Profile Info
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">
                        Gender
                      </p>
                      <p className="text-xs font-bold text-text mt-0.5 truncate leading-tight">
                        {genderLabel}
                      </p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">
                        Looking for
                      </p>
                      <p className="text-xs font-bold text-text mt-0.5 truncate leading-tight">
                        {prefLabel}
                      </p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Calendar size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">
                        Age
                      </p>
                      <p className="text-xs font-bold text-text mt-0.5 truncate leading-tight">
                        {profile.age || 'N/A'} yrs
                      </p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Flame size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">
                        Fame Rating
                      </p>
                      <p className="text-xs font-bold text-primary mt-0.5 truncate leading-tight">
                        {profile.fame_rating} pts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
