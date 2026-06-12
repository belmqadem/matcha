// src/pages/ProfilePage.tsx
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
  Clock,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { userService } from '@/services/userService';
import type { PublicProfile } from '@/types/user';
import { ConfirmModal } from '@/components/profile/ConfirmModal';
import { timeAgo, GENDERS, PREFERENCES } from '@/components/profile/profileConstants';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<number | null>(null);

  const [likeLoading, setLikeLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirm, setConfirm] = useState<'block' | 'unblock' | 'report' | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userService
      .getPublicProfile(id)
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

  useEffect(() => {
    if (lightboxPhoto === null || !profile) return;
    const sorted = profile.photos
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxPhoto(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxPhoto((prev) =>
          prev !== null ? (prev - 1 + sorted.length) % sorted.length : null,
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxPhoto((prev) => (prev !== null ? (prev + 1) % sorted.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto, profile]);

  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
      </div>
    );

  if (error || !profile)
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm sm:text-base font-medium text-text-muted">
          {error || 'Profile not found.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm sm:text-base font-bold text-primary bg-surface px-6 py-2.5 rounded-full shadow-sm active:scale-95"
        >
          Go back
        </button>
      </div>
    );

  const sorted = profile.photos.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const fame = Math.min(100, Math.max(0, profile.fame_rating ?? 0));

  const handleLike = async () => {
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
    setConfirm(null);
    setBlockLoading(true);
    setActionError('');
    try {
      if (profile.is_blocked_by_me) {
        await userService.unblock(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked_by_me: false } : p));
      } else {
        await userService.block(profile.id);
        setProfile((p) =>
          p
            ? {
                ...p,
                is_blocked_by_me: true,
                liked_by_me: false,
                liked_me: false,
                is_connected: false,
              }
            : p,
        );
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
      await userService.report(profile.id);
      setProfile((p) => (p ? { ...p, is_fake_reported: true } : p));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Report failed.');
    }
  };

  const genderLabel = GENDERS.find((g) => g.value === profile.gender)?.label ?? 'Not specified';
  const prefLabel =
    PREFERENCES.find((p) => p.value === profile.sexual_preference)?.label ?? 'Bisexual';

  return (
    <div className="min-h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)] flex flex-col bg-transparent font-primary overflow-y-auto md:overflow-hidden">
      {confirm === 'block' && (
        <ConfirmModal
          title="Block this user?"
          message="They will no longer appear in your search results or be able to chat with you."
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

      <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row gap-6 md:h-full md:min-h-0 items-start">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-6 md:h-full md:min-h-0 md:overflow-y-auto scrollbar-thin pr-1 w-full">
          {/* Split Profile Card */}
          <div className="bg-surface/85 backdrop-blur-md rounded-3xl sm:rounded-[2.2rem] border border-border/70 shadow-premium hover:shadow-glow/5 hover:border-primary/20 transition-all duration-500 overflow-hidden animate-fade-in-up shrink-0">
            <div className="flex flex-col sm:flex-row min-h-[18rem] sm:min-h-[22rem]">
              <div
                className="relative w-full sm:w-80 bg-background/50 flex-shrink-0 aspect-square sm:aspect-auto overflow-hidden cursor-pointer group/photo"
                onClick={() => setLightboxPhoto(activePhoto)}
              >
                {sorted.length > 0 ? (
                  <img
                    src={sorted[activePhoto]?.url ?? sorted[0].url}
                    alt={profile.first_name}
                    className="w-full h-full object-cover block transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full min-h-[18rem] flex items-center justify-center text-text-muted text-5xl sm:text-6xl font-black bg-background/50 opacity-50">
                    {profile.first_name[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-text/70 via-transparent to-transparent pointer-events-none" />

                {/* Navigation arrows */}
                {sorted.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhoto((prev) => (prev - 1 + sorted.length) % sorted.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-surface flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors z-10 cursor-pointer shadow-md opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 hover:scale-105 active:scale-95 border-none animate-fade-in"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhoto((prev) => (prev + 1) % sorted.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-surface flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors z-10 cursor-pointer shadow-md opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 hover:scale-105 active:scale-95 border-none animate-fade-in"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Dot Indicators */}
                {sorted.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {sorted.map((_, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhoto(idx);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          activePhoto === idx
                            ? 'bg-primary w-3.5'
                            : 'bg-surface/60 hover:bg-surface/95'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Image counter */}
                {sorted.length > 1 && (
                  <span className="absolute top-4 right-4 bg-black/40 text-surface text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest z-10 backdrop-blur-sm">
                    {activePhoto + 1}/{sorted.length}
                  </span>
                )}

                <div className="absolute bottom-4 left-4 z-10">
                  {profile.is_online ? (
                    <span className="flex items-center gap-1.5 bg-primary text-surface text-[0.65rem] sm:text-xs font-black px-3.5 py-1.5 rounded-full tracking-widest shadow-md shadow-primary/30 animate-pulse">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-surface rounded-full shadow-[0_0_8px_white]" />{' '}
                      ONLINE
                    </span>
                  ) : profile.last_seen ? (
                    <span className="flex items-center gap-1.5 bg-text/60 backdrop-blur-md text-surface text-[0.65rem] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-surface/20">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {timeAgo(profile.last_seen)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-text leading-tight tracking-tight">
                        {profile.first_name} {profile.last_name}
                        {profile.age ? (
                          <span className="font-medium opacity-80">, {profile.age}</span>
                        ) : (
                          ''
                        )}
                      </h1>
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 animate-[floatSlow_6s_ease-in-out_infinite]" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-text-muted mb-4 sm:mb-5">
                    @{profile.username}
                  </p>

                  {profile.location_city && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 text-sm sm:text-base font-medium text-text-muted">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />{' '}
                      {profile.location_city}
                    </div>
                  )}

                  {profile.is_connected && (
                    <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-2xl px-4 py-3 mb-5 animate-[heartBeat_3s_ease-in-out_infinite]">
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        You're connected — start chatting now!
                      </span>
                    </div>
                  )}

                  {!profile.is_connected && profile.liked_me && !profile.liked_by_me && (
                    <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-2xl px-4 py-3 mb-5 animate-[heartBeat_3s_ease-in-out_infinite]">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current" />
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {profile.first_name} already liked you — like back to connect!
                      </span>
                    </div>
                  )}

                  {profile.biography && (
                    <p className="text-sm sm:text-base text-text leading-relaxed mb-6 font-medium italic opacity-85">
                      "{profile.biography}"
                    </p>
                  )}
                </div>

                {(profile.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3.5 py-1.5 rounded-full bg-primary/5 text-primary text-xs sm:text-sm font-bold border border-primary/10 hover:bg-primary/10 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ABOUT DETAILS PANEL */}
          <div className="bg-surface/85 backdrop-blur-md rounded-3xl sm:rounded-[2.2rem] p-6 sm:p-8 border border-border/70 shadow-premium hover:shadow-glow/5 hover:border-primary/20 transition-all duration-500 animate-fade-in-up shrink-0">
            <h3 className="text-lg sm:text-xl font-black text-text mb-5 sm:mb-6">
              About {profile.first_name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 sm:gap-y-6 gap-x-8">
              {[
                { label: 'City', value: profile.location_city },
                { label: 'Age', value: profile.age ? `${profile.age} years old` : null },
                { label: 'Gender', value: genderLabel },
                { label: 'Orientation', value: prefLabel },
              ].map(({ label, value }) => (
                <div key={label} className="border-b-2 border-background/40 pb-3">
                  <p className="text-[0.65rem] sm:text-xs font-bold text-text-muted uppercase tracking-wider mb-1 sm:mb-1.5">
                    {label}
                  </p>
                  <p
                    className={`text-sm sm:text-base font-bold ${value ? 'text-text' : 'text-border'}`}
                  >
                    {value ?? 'Not specified'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-6 md:h-full md:min-h-0 md:overflow-y-auto scrollbar-thin">
          <div className="bg-surface/85 backdrop-blur-md rounded-3xl sm:rounded-[2.2rem] p-6 border border-border/70 shadow-premium hover:shadow-glow/5 hover:border-primary/20 transition-all duration-500 flex flex-col gap-4">
            {actionError && (
              <div className="bg-error/10 text-error text-xs sm:text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> {actionError}
              </div>
            )}

            {profile.is_blocked_by_me ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base bg-background/50 text-text-muted opacity-40 cursor-not-allowed"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" /> Blocked
              </button>
            ) : profile.liked_by_me ? (
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base bg-surface text-primary border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/60 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
              >
                {likeLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-current" />
                )}{' '}
                Unlike Profile
              </button>
            ) : (
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-primary to-[#ff758c] text-surface shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                {likeLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-surface fill-none" />
                )}
                {profile.liked_me ? 'Match Now' : 'Send Like'}
              </button>
            )}

            <button
              onClick={() => navigate(`/chat/${profile.id}`)}
              disabled={!profile.is_connected}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-md hover:shadow-lg ${profile.is_connected ? 'bg-text text-surface hover:bg-text/90' : 'bg-background/50 text-text-muted border border-border/80 opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none'}`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />{' '}
              {profile.is_connected ? 'Send Message' : 'Match to chat'}
            </button>

            <div className="h-0.5 bg-background/40 my-2 sm:my-3" />

            <button
              onClick={() => setConfirm(profile.is_blocked_by_me ? 'unblock' : 'block')}
              disabled={blockLoading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm border border-transparent hover:border-border transition-all duration-200 active:scale-95 ${profile.is_blocked_by_me ? 'bg-error/10 text-error border-2 border-error/20 hover:bg-error/20' : 'bg-transparent text-text-muted hover:bg-background/50 hover:text-text'}`}
            >
              <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{' '}
              {profile.is_blocked_by_me ? 'Unblock User' : 'Block User'}
            </button>

            <button
              onClick={() => !profile.is_fake_reported && setConfirm('report')}
              disabled={profile.is_fake_reported}
              className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm border border-transparent hover:border-border transition-all duration-200 active:scale-95 ${profile.is_fake_reported ? 'bg-background/50 text-text-muted cursor-not-allowed border border-border/60' : 'bg-transparent text-text-muted hover:bg-error/10 hover:text-error'}`}
            >
              <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{' '}
              {profile.is_fake_reported ? 'Account Reported' : 'Report Fake Account'}
            </button>
          </div>

          <div className="bg-surface/85 backdrop-blur-md rounded-3xl sm:rounded-[2.2rem] p-6 border border-border/70 shadow-premium hover:shadow-glow/5 hover:border-primary/20 transition-all duration-500 flex-shrink-0">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-sm sm:text-base font-black text-text">Fame Rating</h3>
              <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-current animate-[heartBeat_1.5s_ease-in-out_infinite]" />
                <span className="text-sm sm:text-base font-black text-primary">{fame}</span>
              </div>
            </div>

            {/* Dynamic layout value passed safely via CSS variable to avoid standard inline style blocks */}
            <div className="h-2 sm:h-2.5 rounded-full bg-background/50 overflow-hidden mb-6 sm:mb-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#ff758c] shadow-[0_0_8px_rgba(233,64,87,0.3)] transition-all duration-1000 ease-out w-[var(--fame-width)]"
                style={{ '--fame-width': `${fame}%` } as React.CSSProperties}
              />
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between py-2 border-t-2 border-background/40">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-muted">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Profile views
                </div>
                <span className="text-xs sm:text-sm font-black text-text">Hidden</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t-2 border-background/40">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-muted">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Verified Member
                </div>
                <span className="text-xs sm:text-sm font-black text-text">Yes</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 sm:py-4 rounded-2xl border-2 border-border/60 bg-surface/50 backdrop-blur-md text-text-muted text-sm sm:text-base font-black cursor-pointer hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 hover:-translate-y-0.5 mb-4 shrink-0"
          >
            Back
          </button>
        </div>
      </div>

      {/* LIGHTBOX / CAROUSEL MODAL */}
      {lightboxPhoto !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-surface hover:text-primary transition-colors p-2 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>

          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxPhoto((prev) =>
                    prev !== null ? (prev - 1 + sorted.length) % sorted.length : null,
                  );
                }}
                className="absolute left-4 text-surface hover:text-primary transition-colors p-3 bg-surface/10 rounded-full hover:bg-surface/20 cursor-pointer"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxPhoto((prev) => (prev !== null ? (prev + 1) % sorted.length : null));
                }}
                className="absolute right-4 text-surface hover:text-primary transition-colors p-3 bg-surface/10 rounded-full hover:bg-surface/20 cursor-pointer"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={sorted[lightboxPhoto]?.url}
              alt="Gallery Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-surface/10 select-none"
            />
            {sorted.length > 1 && (
              <span className="text-surface/80 text-sm font-bold bg-surface/10 px-3 py-1.5 rounded-full select-none">
                {lightboxPhoto + 1} / {sorted.length}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
