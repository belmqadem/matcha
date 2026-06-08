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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 size={32} className="text-primary animate-spin" /></div>;

  if (error || !profile) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background"><p className="text-sm font-medium text-text-muted">{error || 'Profile not found.'}</p><button onClick={() => navigate(-1)} className="text-sm font-bold text-primary bg-surface px-6 py-2 rounded-full shadow-sm">Go back</button></div>;

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
    <div className="min-h-screen bg-background font-primary pb-20">
      {confirm === 'block' && <ConfirmModal title="Block this user?" message="They will no longer appear in your search results or be able to chat with you." confirmLabel="Block" danger onConfirm={handleBlock} onClose={() => setConfirm(null)} />}
      {confirm === 'unblock' && <ConfirmModal title="Unblock this user?" message="They will be able to appear in your results and contact you again." confirmLabel="Unblock" onConfirm={handleBlock} onClose={() => setConfirm(null)} />}
      {confirm === 'report' && <ConfirmModal title="Report as fake?" message="You're about to report this profile as fake. This action cannot be undone." confirmLabel="Report" danger onConfirm={handleReport} onClose={() => setConfirm(null)} />}

      <div className="max-w-[1100px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8 items-start">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface rounded-[32px] border border-border shadow-sm overflow-hidden animate-[fadeUp_0.4s_ease-out]">
            <div className="flex flex-col sm:flex-row min-h-[340px]">
              <div className="relative w-full sm:w-[320px] bg-background flex-shrink-0">
                {sorted.length > 0 ? (
                  <img src={sorted[activePhoto]?.url ?? sorted[0].url} alt={profile.first_name} className="w-full h-full object-cover block" />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center text-text-muted text-6xl font-black bg-background opacity-50">{profile.first_name[0]}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4">
                  {profile.is_online ? (
                    <span className="flex items-center gap-1.5 bg-primary text-surface text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest shadow-lg">
                      <div className="w-1.5 h-1.5 bg-surface rounded-full animate-pulse" /> ONLINE
                    </span>
                  ) : profile.last_seen ? (
                    <span className="flex items-center gap-1.5 bg-text/40 backdrop-blur-md text-surface text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-surface/20">
                      <Clock size={12} /> {timeAgo(profile.last_seen)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-black text-text leading-tight tracking-tight">
                        {profile.first_name} {profile.last_name}{profile.age ? <span className="font-medium opacity-80">, {profile.age}</span> : ''}
                      </h1>
                      <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-text-muted mb-4">@{profile.username}</p>

                  {profile.location_city && (
                    <div className="flex items-center gap-1.5 mb-5 text-sm font-medium text-text-muted">
                      <MapPin size={16} className="text-primary" /> {profile.location_city}
                    </div>
                  )}

                  {profile.is_connected && (
                    <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-2xl px-4 py-3 mb-5">
                      <span className="text-[13px] font-bold text-primary">You're connected — start chatting now!</span>
                    </div>
                  )}

                  {!profile.is_connected && profile.liked_me && !profile.liked_by_me && (
                    <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/20 rounded-2xl px-4 py-3 mb-5">
                      <Heart size={18} className="text-primary" />
                      <span className="text-[13px] font-bold text-primary">{profile.first_name} already liked you — like back to connect!</span>
                    </div>
                  )}

                  {profile.biography && <p className="text-[15px] text-text leading-relaxed mb-6 font-medium opacity-80">"{profile.biography}"</p>}
                </div>

                {(profile.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.tags.map((tag) => (
                      <span key={tag} className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[13px] font-bold border-2 border-primary/10">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {sorted.length > 1 && (
            <div className="bg-surface rounded-[32px] p-7 border border-border shadow-sm animate-[fadeUp_0.5s_ease-out]">
              <h3 className="text-lg font-black text-text mb-5">More Photos</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                {sorted.map((photo, i) => (
                  <div key={photo.id} onClick={() => setActivePhoto(i)} className={`relative flex-shrink-0 w-[140px] h-[180px] rounded-2xl overflow-hidden cursor-pointer snap-start transition-all duration-300 ${activePhoto === i ? 'ring-4 ring-primary ring-offset-2' : 'hover:opacity-80'}`}>
                    <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface rounded-[32px] p-7 border border-border shadow-sm animate-[fadeUp_0.6s_ease-out]">
            <h3 className="text-[18px] font-black text-text mb-5">About {profile.first_name}</h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              {[
                { label: 'City', value: profile.location_city },
                { label: 'Age', value: profile.age ? `${profile.age} years old` : null },
                { label: 'Gender', value: genderLabel },
                { label: 'Orientation', value: prefLabel },
              ].map(({ label, value }) => (
                <div key={label} className="border-b-2 border-background pb-3">
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-[15px] font-bold ${value ? 'text-text' : 'text-border'}`}>{value ?? 'Not specified'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="flex flex-col gap-6 sticky top-8 animate-[fadeUp_0.7s_ease-out]">
          <div className="bg-surface rounded-[32px] p-6 border border-border shadow-sm flex flex-col gap-3">
            {actionError && <div className="bg-error/10 text-error text-[12px] font-bold px-4 py-3 rounded-xl flex items-center gap-2 mb-2"><AlertTriangle size={14} /> {actionError}</div>}

            <button onClick={handleLike} disabled={likeLoading || profile.is_blocked_by_me} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-black text-[15px] transition-all duration-300 active:scale-95 ${profile.is_blocked_by_me ? 'opacity-40 cursor-not-allowed bg-background text-text-muted' : profile.liked_by_me ? 'bg-surface text-primary border-2 border-primary hover:bg-primary/5' : 'bg-primary text-surface hover:shadow-md border-2 border-primary'}`}>
              {likeLoading ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={profile.liked_by_me ? "currentColor" : "none"} />}
              {profile.liked_by_me ? 'Unlike Profile' : profile.liked_me ? 'Match Now' : 'Send Like'}
            </button>

            <button onClick={() => navigate(`/chat/${profile.id}`)} disabled={!profile.is_connected} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-black text-[15px] transition-all duration-300 ${profile.is_connected ? 'bg-text text-surface hover:opacity-90 active:scale-95 shadow-md cursor-pointer' : 'bg-background text-text-muted border-2 border-border opacity-60 cursor-not-allowed'}`}>
              <MessageCircle size={18} /> {profile.is_connected ? 'Send Message' : 'Match to chat'}
            </button>

            <div className="h-0.5 bg-background my-2" />

            <button onClick={() => setConfirm(profile.is_blocked_by_me ? 'unblock' : 'block')} disabled={blockLoading} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] transition-all ${profile.is_blocked_by_me ? 'bg-error/10 text-error border-2 border-error/20 hover:bg-error/20' : 'bg-transparent text-text-muted hover:bg-background hover:text-text'}`}>
              <Ban size={16} /> {profile.is_blocked_by_me ? 'Unblock User' : 'Block User'}
            </button>

            <button onClick={() => !profile.is_fake_reported && setConfirm('report')} disabled={profile.is_fake_reported} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] transition-all ${profile.is_fake_reported ? 'bg-background text-text-muted cursor-not-allowed border-2 border-border' : 'bg-transparent text-text-muted hover:bg-error/10 hover:text-error'}`}>
              <Flag size={16} /> {profile.is_fake_reported ? 'Account Reported' : 'Report Fake Account'}
            </button>
          </div>

          <div className="bg-surface rounded-[32px] p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-black text-text">Fame Rating</h3>
              <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
                <Star size={14} className="text-primary fill-current" />
                <span className="text-[15px] font-black text-primary">{fame}</span>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-background overflow-hidden mb-6">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-1000 ease-out" style={{ width: `${fame}%` }} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between py-2 border-t-2 border-background">
                <div className="flex items-center gap-2 text-[13px] font-bold text-text-muted"><Eye size={16} className="text-primary" /> Profile views</div>
                <span className="text-[14px] font-black text-text">Hidden</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t-2 border-background">
                <div className="flex items-center gap-2 text-[13px] font-bold text-text-muted"><Shield size={16} className="text-primary" /> Verified Member</div>
                <span className="text-[14px] font-black text-text">Yes</span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate(-1)} className="w-full py-4 rounded-[18px] border-2 border-border bg-surface text-text-muted text-[14px] font-black cursor-pointer hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
