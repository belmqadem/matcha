// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, Star, Eye, MessageCircle, Flag, Ban, CheckCircle2,
  Loader2, AlertTriangle, Clock, Shield
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

  const [likeLoading, setLikeLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirm, setConfirm] = useState<'block' | 'unblock' | 'report' | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userService.getPublicProfile(id)
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

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-background">
      <p className="text-sm sm:text-base font-medium text-text-muted">{error || 'Profile not found.'}</p>
      <button onClick={() => navigate(-1)} className="text-sm sm:text-base font-bold text-primary bg-surface px-6 py-2.5 rounded-full shadow-sm active:scale-95">Go back</button>
    </div>
  );

  const sorted = profile.photos.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const fame = Math.min(100, Math.max(0, profile.fame_rating ?? 0));

  const handleLike = async () => {
    setLikeLoading(true); setActionError('');
    try {
      if (profile.liked_by_me) {
        await userService.unlike(profile.id);
        setProfile((p) => (p ? { ...p, liked_by_me: false, is_connected: false } : p));
      } else {
        const res = await userService.like(profile.id);
        setProfile((p) => (p ? { ...p, liked_by_me: true, is_connected: res.connected ?? p.liked_me } : p));
      }
    } catch (e) { setActionError(e instanceof Error ? e.message : 'Action failed.'); } finally { setLikeLoading(false); }
  };

  const handleBlock = async () => {
    setConfirm(null); setBlockLoading(true); setActionError('');
    try {
      if (profile.is_blocked_by_me) {
        await userService.unblock(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked_by_me: false } : p));
      } else {
        await userService.block(profile.id);
        setProfile((p) => (p ? { ...p, is_blocked_by_me: true, liked_by_me: false, liked_me: false, is_connected: false } : p));
      }
    } catch (e) { setActionError(e instanceof Error ? e.message : 'Action failed.'); } finally { setBlockLoading(false); }
  };

  const handleReport = async () => {
    setConfirm(null);
    try {
      await userService.report(profile.id);
      setProfile((p) => (p ? { ...p, is_fake_reported: true } : p));
    } catch (e) { setActionError(e instanceof Error ? e.message : 'Report failed.'); }
  };

  const genderLabel = GENDERS.find(g => g.value === profile.gender)?.label ?? 'Not specified';
  const prefLabel = PREFERENCES.find(p => p.value === profile.sexual_preference)?.label ?? 'Bisexual';

  return (
    <div className="min-h-[100dvh] bg-background font-primary pb-20">
      {confirm === 'block' && <ConfirmModal title="Block this user?" message="They will no longer appear in your search results or be able to chat with you." confirmLabel="Block" danger onConfirm={handleBlock} onClose={() => setConfirm(null)} />}
      {confirm === 'unblock' && <ConfirmModal title="Unblock this user?" message="They will be able to appear in your results and contact you again." confirmLabel="Unblock" onConfirm={handleBlock} onClose={() => setConfirm(null)} />}
      {confirm === 'report' && <ConfirmModal title="Report as fake?" message="You're about to report this profile as fake. This action cannot be undone." confirmLabel="Report" danger onConfirm={handleReport} onClose={() => setConfirm(null)} />}

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
          <div className="bg-surface rounded-3xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden animate-fade-in-up">
            <div className="flex flex-col sm:flex-row min-h-[18rem] sm:min-h-[22rem]">
              <div className="relative w-full sm:w-80 bg-background flex-shrink-0 aspect-square sm:aspect-auto">
                {sorted.length > 0 ? (
                  <img src={sorted[activePhoto]?.url ?? sorted[0].url} alt={profile.first_name} className="w-full h-full object-cover block" />
                ) : (
                  <div className="w-full h-full min-h-[18rem] flex items-center justify-center text-text-muted text-5xl sm:text-6xl font-black bg-background opacity-50">{profile.first_name[0]}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-text/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4">
                  {profile.is_online ? (
                    <span className="flex items-center gap-1.5 bg-primary text-surface text-[0.65rem] sm:text-xs font-black px-3 py-1.5 rounded-full tracking-widest shadow-lg">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-surface rounded-full animate-pulse" /> ONLINE
                    </span>
                  ) : profile.last_seen ? (
                    <span className="flex items-center gap-1.5 bg-text/50 backdrop-blur-md text-surface text-[0.65rem] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-surface/20">
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
                        {profile.first_name} {profile.last_name}{profile.age ? <span className="font-medium opacity-80">, {profile.age}</span> : ''}
                      </h1>
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-text-muted mb-4 sm:mb-5">@{profile.username}</p>

                  {profile.location_city && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 text-sm sm:text-base font-medium text-text-muted">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> {profile.location_city}
                    </div>
                  )}

                  {profile.is_connected && (
                    <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-2xl px-4 py-3 mb-5">
                      <span className="text-xs sm:text-sm font-bold text-primary">You're connected — start chatting now!</span>
                    </div>
                  )}

                  {!profile.is_connected && profile.liked_me && !profile.liked_by_me && (
                    <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-2xl px-4 py-3 mb-5">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-xs sm:text-sm font-bold text-primary">{profile.first_name} already liked you — like back to connect!</span>
                    </div>
                  )}

                  {profile.biography && <p className="text-sm sm:text-base text-text leading-relaxed mb-6 font-medium opacity-80">"{profile.biography}"</p>}
                </div>

                {(profile.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.tags.map((tag) => (
                      <span key={tag} className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold border border-primary/20">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {sorted.length > 1 && (
            <div className="bg-surface rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 border border-border shadow-sm animate-fade-in-up">
              <h3 className="text-lg sm:text-xl font-black text-text mb-4 sm:mb-6">More Photos</h3>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 scrollbar-thin snap-x">
                {sorted.map((photo, i) => (
                  <div key={photo.id} onClick={() => setActivePhoto(i)} className={`relative flex-shrink-0 w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden cursor-pointer snap-start transition-all duration-300 ${activePhoto === i ? 'ring-4 ring-primary ring-offset-2' : 'hover:opacity-80'}`}>
                    <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 border border-border shadow-sm animate-fade-in-up">
            <h3 className="text-lg sm:text-xl font-black text-text mb-5 sm:mb-6">About {profile.first_name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 sm:gap-y-6 gap-x-8">
              {[
                { label: 'City', value: profile.location_city },
                { label: 'Age', value: profile.age ? `${profile.age} years old` : null },
                { label: 'Gender', value: genderLabel },
                { label: 'Orientation', value: prefLabel },
              ].map(({ label, value }) => (
                <div key={label} className="border-b-2 border-background pb-3">
                  <p className="text-[0.65rem] sm:text-xs font-bold text-text-muted uppercase tracking-wider mb-1 sm:mb-1.5">{label}</p>
                  <p className={`text-sm sm:text-base font-bold ${value ? 'text-text' : 'text-border'}`}>{value ?? 'Not specified'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-1 flex flex-col gap-6 sm:gap-8 sticky top-8 animate-fade-in-up">
          <div className="bg-surface rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 border border-border shadow-sm flex flex-col gap-3 sm:gap-4">
            {actionError && <div className="bg-error/10 text-error text-xs sm:text-sm font-bold px-4 py-3 rounded-xl flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> {actionError}</div>}

            <button onClick={handleLike} disabled={likeLoading || profile.is_blocked_by_me} className={`w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl sm:rounded-[18px] font-black text-sm sm:text-base transition-all duration-300 active:scale-95 ${profile.is_blocked_by_me ? 'opacity-40 cursor-not-allowed bg-background text-text-muted' : profile.liked_by_me ? 'bg-surface text-primary border-2 border-primary hover:bg-primary/5' : 'bg-primary text-surface hover:bg-primary-hover hover:shadow-md border-2 border-primary'}`}>
              {likeLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={profile.liked_by_me ? "currentColor" : "none"} />}
              {profile.liked_by_me ? 'Unlike Profile' : profile.liked_me ? 'Match Now' : 'Send Like'}
            </button>

            <button onClick={() => navigate(`/chat/${profile.id}`)} disabled={!profile.is_connected} className={`w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl sm:rounded-[18px] font-black text-sm sm:text-base transition-all duration-300 ${profile.is_connected ? 'bg-text text-surface hover:opacity-90 active:scale-95 shadow-md cursor-pointer' : 'bg-background text-text-muted border-2 border-border opacity-60 cursor-not-allowed'}`}>
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /> {profile.is_connected ? 'Send Message' : 'Match to chat'}
            </button>

            <div className="h-0.5 bg-background my-2 sm:my-3" />

            <button onClick={() => setConfirm(profile.is_blocked_by_me ? 'unblock' : 'block')} disabled={blockLoading} className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${profile.is_blocked_by_me ? 'bg-error/10 text-error border-2 border-error/20 hover:bg-error/20' : 'bg-transparent text-text-muted hover:bg-background hover:text-text'}`}>
              <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {profile.is_blocked_by_me ? 'Unblock User' : 'Block User'}
            </button>

            <button onClick={() => !profile.is_fake_reported && setConfirm('report')} disabled={profile.is_fake_reported} className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${profile.is_fake_reported ? 'bg-background text-text-muted cursor-not-allowed border-2 border-border' : 'bg-transparent text-text-muted hover:bg-error/10 hover:text-error'}`}>
              <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {profile.is_fake_reported ? 'Account Reported' : 'Report Fake Account'}
            </button>
          </div>

          <div className="bg-surface rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-sm sm:text-base font-black text-text">Fame Rating</h3>
              <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-current" />
                <span className="text-sm sm:text-base font-black text-primary">{fame}</span>
              </div>
            </div>

            {/* Dynamic layout value passed safely via CSS variable to avoid standard inline style blocks */}
            <div className="h-2 sm:h-2.5 rounded-full bg-background overflow-hidden mb-6 sm:mb-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-1000 ease-out w-[var(--fame-width)]"
                style={{ '--fame-width': `${fame}%` } as React.CSSProperties}
              />
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between py-2 border-t-2 border-background">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-muted"><Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Profile views</div>
                <span className="text-xs sm:text-sm font-black text-text">Hidden</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t-2 border-background">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-text-muted"><Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Verified Member</div>
                <span className="text-xs sm:text-sm font-black text-text">Yes</span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate(-1)} className="w-full py-3 sm:py-4 rounded-2xl sm:rounded-[18px] border-2 border-border bg-surface text-text-muted text-sm sm:text-base font-black cursor-pointer hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
