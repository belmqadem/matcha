// src/pages/MyProfilePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Edit2, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types/user';
import FloatingHearts from '@/components/FloatingHearts';
// import { FloatingHearts } from '@/components/FloatingHearts';
import { CityName } from '@/components/ui/CityName';
import { PhotosPanel } from '@/components/profile/PhotosPanel';
import { AboutPanel } from '@/components/profile/AboutPanel';
import { ActivityPanel } from '@/components/profile/ActivityPanel';
import { EditIdentityModal } from '@/components/profile/EditIdentityModal';
import { EditAboutModal } from '@/components/profile/EditAboutModal';
import { EditTagsModal } from '@/components/profile/EditTagsModal';
import { EditLocationModal } from '@/components/profile/EditLocationModal';

type ModalType = 'identity' | 'about' | 'tags' | 'location' | null;

const MyProfilePage = () => {
  const navigate     = useNavigate();
  const { logout: ctxLogout } = useAuth();
  const [user,       setUser]       = useState<UserProfile | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editModal,  setEditModal]  = useState<ModalType>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    userService.getMe()
      .then(setUser)
      .catch(e => setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await authService.logout(); } catch { /* ignore */ }
    ctxLogout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 size={32} className="text-primary animate-spin" />
    </div>
  );

  if (fetchError || !user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <p className="text-[15px] font-medium text-text-muted">{fetchError || 'Profile not found.'}</p>
      <button onClick={() => navigate('/login')} className="text-[14px] font-bold text-primary bg-white px-6 py-2 rounded-full shadow-sm">
        Back to login
      </button>
    </div>
  );

  const mainPhoto = user.photos?.find(p => p.id === user.profile_picture_id) ?? user.photos?.[0];

  return (
    <div className="relative min-h-screen bg-background font-sans pb-20">

      <FloatingHearts />

      {editModal === 'identity' && <EditIdentityModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'about'    && <EditAboutModal    user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'tags'     && <EditTagsModal     user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'location' && <EditLocationModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}

      <div className="relative z-10 max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Hero card */}
        <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden animate-[fadeUp_0.4s_ease-out]">
          <div className="flex flex-col sm:flex-row min-h-[280px]">

            {/* Photo */}
            <div className="relative w-full sm:w-[280px] bg-background shrink-0">
              {mainPhoto ? (
                <img src={mainPhoto.url} alt="Profile" className="w-full h-full object-cover block" />
              ) : (
                <div
                  className="w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 text-text-muted cursor-pointer hover:bg-border transition-colors"
                  onClick={() => setEditModal('identity')}
                >
                  <Camera size={40} />
                  <span className="text-[14px] font-bold">Add main photo</span>
                </div>
              )}
              {user.is_online && (
                <span className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> ONLINE
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-[28px] font-black text-text leading-tight tracking-tight">
                      {user.first_name} {user.last_name}
                      {user.birth_date && (
                        <span className="font-medium opacity-80">
                          , {new Date().getFullYear() - new Date(user.birth_date).getFullYear()}
                        </span>
                      )}
                    </h1>
                    <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
                  </div>
                  <button
                    onClick={() => setEditModal('identity')}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-primary bg-primary/10 px-4 py-2 rounded-full cursor-pointer hover:bg-primary/20 transition-colors shrink-0"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-[15px] font-bold text-text-muted">
                    {user.location_city
                      ? user.location_city
                      : user.latitude
                        ? <CityName lat={Number(user.latitude)} lng={Number(user.longitude)} fallback={null} />
                        : 'Location not set'
                    }
                  </span>
                  <button onClick={() => setEditModal('location')} className="text-primary hover:opacity-70 transition-opacity cursor-pointer p-1">
                    <Edit2 size={12} />
                  </button>
                </div>

                <div className="mb-6">
                  {user.biography ? (
                    <p className="text-[15px] text-text leading-relaxed font-medium opacity-80">"{user.biography}"</p>
                  ) : (
                    <button
                      onClick={() => setEditModal('about')}
                      className="text-[14px] font-bold text-text-muted border-2 border-dashed border-border rounded-xl px-5 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer"
                    >
                      + Add a bio about yourself
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                {(user.tags ?? []).length > 0
                  ? user.tags.map(tag => (
                      <span key={tag} className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[13px] font-bold border-2 border-primary/10">
                        {tag}
                      </span>
                    ))
                  : <span className="text-[13px] font-bold text-text-muted italic">No interests added yet</span>
                }
                <button
                  onClick={() => setEditModal('tags')}
                  className="px-4 py-1.5 rounded-full bg-background text-text-muted text-[13px] font-bold border-2 border-dashed border-border cursor-pointer hover:border-primary hover:text-primary transition-all"
                >
                  + Edit Interests
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-[fadeUp_0.5s_ease-out]">
          <PhotosPanel user={user} onUpdate={setUser} />
        </div>

        <div className="animate-[fadeUp_0.6s_ease-out]">
          <AboutPanel user={user} onEditAbout={() => setEditModal('about')} onEditLocation={() => setEditModal('location')} />
        </div>

        <div className="animate-[fadeUp_0.7s_ease-out]">
          <ActivityPanel user={user} />
        </div>

        {/* Logout */}
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm animate-[fadeUp_0.8s_ease-out]">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex justify-center items-center gap-3 py-5 text-[15px] font-black text-error hover:bg-error/5 cursor-pointer transition-colors disabled:opacity-50"
          >
            {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            {loggingOut ? 'Signing out safely…' : 'Sign out of your account'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MyProfilePage;
