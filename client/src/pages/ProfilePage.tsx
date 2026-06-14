// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MapPin, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

import { userService } from '@/services/userService';
import type { PublicProfile } from '@/types/user';
import { ConfirmModal } from '@/components/profile/ConfirmModal';
import { GENDERS, PREFERENCES } from '@/components/profile/profileConstants';

// Modular Subcomponents (One component per file)
import { ProfilePhotoGallery } from '@/components/profile/ProfilePhotoGallery';
import { ProfileInfoGrid } from '@/components/profile/ProfileInfoGrid';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { ProfileFame } from '@/components/profile/ProfileFame';
import { ProfileLightbox } from '@/components/profile/ProfileLightbox';

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
    let aborted = false;

    Promise.resolve().then(() => {
      if (aborted) return;
      setLoading(true);
    });

    userService
      .getPublicProfile(id)
      .then((p) => {
        if (aborted) return;
        setProfile(p);
        if (p.profile_picture_id) {
          const idx = p.photos.findIndex((ph) => ph.id === p.profile_picture_id);
          if (idx >= 0) setActivePhoto(idx);
        }
        setLoading(false);
      })
      .catch((e) => {
        if (aborted) return;
        setError(e.message);
        setLoading(false);
      });

    return () => {
      aborted = true;
    };
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

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm sm:text-base font-bold text-text-muted">
          {error || 'Profile not found.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm sm:text-base font-black text-primary bg-surface border border-border/80 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

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
    <div className="relative min-h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)] flex flex-col bg-background font-primary overflow-y-auto md:overflow-hidden">
      {/* Decorative abstract glow background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#ff758c]/10 blur-[100px] -z-10 pointer-events-none" />

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

      {/* Top Page Header / Navigation Bar */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-3 flex items-center gap-3 shrink-0 select-none animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full border border-border/80 bg-surface/80 flex items-center justify-center text-text-muted hover:border-primary hover:text-primary hover:bg-surface transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
          Public Profile
        </span>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 md:h-full md:min-h-0 items-start">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-4 md:h-full md:min-h-0 md:overflow-y-auto scrollbar-thin pr-1 w-full">
          {/* Hero Profile Split Card */}
          <div className="bg-surface/85 backdrop-blur-md rounded-3xl md:rounded-[2.2rem] border border-border/75 shadow-premium hover:border-primary/25 transition-all duration-500 overflow-hidden animate-fade-in-up shrink-0">
            <div className="flex flex-col md:flex-row min-h-[22rem]">
              <ProfilePhotoGallery
                photos={profile.photos}
                activePhoto={activePhoto}
                setActivePhoto={setActivePhoto}
                onPhotoClick={() => setLightboxPhoto(activePhoto)}
                isOnline={profile.is_online}
                lastSeen={profile.last_seen}
                firstName={profile.first_name}
              />

              {/* Bio & Details side */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-text leading-tight tracking-tight">
                      {profile.first_name} {profile.last_name}
                      {profile.age ? (
                        <span className="font-normal text-text-muted opacity-90">
                          , {profile.age}
                        </span>
                      ) : (
                        ''
                      )}
                    </h1>
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 animate-pulse" />
                  </div>

                  <p className="text-xs font-bold text-text-muted mb-3 tracking-wide">
                    @{profile.username}
                  </p>

                  {profile.location_city && (
                    <div className="flex items-center gap-1.5 mb-4 text-xs font-bold text-text-muted">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      {profile.location_city}
                    </div>
                  )}

                  {/* Connected alert bar */}
                  {profile.is_connected && (
                    <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full px-3.5 py-1 mb-4 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping" />
                      <span className="text-[10px] font-black text-[#10b981] uppercase tracking-wider">
                        Matched! Connected to chat
                      </span>
                    </div>
                  )}

                  {!profile.is_connected && profile.liked_me && !profile.liked_by_me && (
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-3.5 py-1 mb-4 shadow-sm">
                      <Heart className="w-3 h-3 text-primary fill-current animate-pulse" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                        Likes you! Like back to connect
                      </span>
                    </div>
                  )}

                  {profile.biography && (
                    <div className="relative pl-3 border-l-2 border-primary/40 my-3">
                      <p className="text-sm text-text leading-relaxed font-semibold italic opacity-90">
                        "{profile.biography}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags section */}
                {(profile.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-background border border-border/80 text-text-muted text-xs font-bold hover:border-primary hover:text-primary transition-all duration-300 shadow-sm cursor-default"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details list info */}
          <ProfileInfoGrid
            locationCity={profile.location_city}
            age={profile.age}
            genderLabel={genderLabel}
            prefLabel={prefLabel}
            firstName={profile.first_name}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4 md:h-full md:min-h-0 md:overflow-y-auto scrollbar-thin">
          <ProfileActions
            isBlockedByMe={profile.is_blocked_by_me}
            likedByMe={profile.liked_by_me}
            likedMe={profile.liked_me}
            isConnected={profile.is_connected}
            isFakeReported={profile.is_fake_reported}
            likeLoading={likeLoading}
            blockLoading={blockLoading}
            actionError={actionError}
            onLike={handleLike}
            onChat={() => navigate(`/chat/${profile.id}`)}
            onConfirmAction={setConfirm}
            firstName={profile.first_name}
          />

          <ProfileFame fameRating={profile.fame_rating} />
        </div>
      </div>

      {/* GALLERY LIGHTBOX OVERLAY */}
      {lightboxPhoto !== null && (
        <ProfileLightbox
          photos={profile.photos}
          lightboxPhoto={lightboxPhoto}
          setLightboxPhoto={setLightboxPhoto}
        />
      )}
    </div>
  );
}
