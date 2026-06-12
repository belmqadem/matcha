// src/pages/MyProfilePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Edit2, CheckCircle2, Loader2, LogOut } from 'lucide-react';

import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types/user';

import FloatingHearts from '@/components/FloatingHearts';
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
  const navigate = useNavigate();
  const { logout: ctxLogout } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editModal, setEditModal] = useState<ModalType>(null);
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
    <div className="min-h-[100dvh] flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
    </div>
  );

  if (fetchError || !user) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-background">
      <p className="text-sm sm:text-base font-medium text-text-muted">{fetchError || 'Profile not found.'}</p>
      <button onClick={() => navigate('/login')} className="text-sm sm:text-base font-bold text-primary bg-surface px-6 py-2.5 rounded-full shadow-sm active:scale-95 transition-transform">
        Back to login
      </button>
    </div>
  );

  const mainPhoto = user.photos?.find(p => p.id === user.profile_picture_id) ?? user.photos?.[0];

  return (
    <div className="relative min-h-[100dvh] bg-background font-primary pb-20">
      <FloatingHearts />

      {editModal === 'identity' && <EditIdentityModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'about'    && <EditAboutModal    user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'tags'     && <EditTagsModal     user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'location' && <EditLocationModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">

        {/* Hero card */}
        <div className="bg-surface rounded-3xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden animate-fade-in-up">
          <div className="flex flex-col md:flex-row min-h-[16rem] sm:min-h-[18rem]">
            {/* Photo */}
            <div className="relative w-full md:w-72 bg-background shrink-0 aspect-square md:aspect-auto">
              {mainPhoto ? (
                <img src={mainPhoto.url} alt="Profile" className="w-full h-full object-cover block" />
              ) : (
                <div
                  className="w-full h-full min-h-[16rem] flex flex-col items-center justify-center gap-3 text-text-muted cursor-pointer hover:bg-border/50 transition-colors"
                  onClick={() => setEditModal('identity')}
                >
                  <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Add main photo</span>
                </div>
              )}
              {user.is_online && (
                <span className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 flex items-center gap-1.5 bg-primary text-surface text-[0.65rem] sm:text-xs font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-widest shadow-lg">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-surface rounded-full animate-pulse" /> ONLINE
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-text leading-tight tracking-tight">
                      {user.first_name} {user.last_name}
                      {user.birth_date && (
                        <span className="font-medium opacity-80">
                          , {new Date().getFullYear() - new Date(user.birth_date).getFullYear()}
                        </span>
                      )}
                    </h1>
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  </div>
                  <button
                    onClick={() => setEditModal('identity')}
                    className="flex items-center gap-1.5 text-[0.65rem] sm:text-xs font-bold text-primary bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer hover:bg-primary/20 transition-colors shrink-0 active:scale-95"
                  >
                    <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Edit
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-sm sm:text-base font-bold text-text-muted">
                    {user.location_city
                      ? user.location_city
                      : user.latitude
                        ? <CityName lat={Number(user.latitude)} lng={Number(user.longitude)} fallback={null} />
                        : 'Location not set'
                    }
                  </span>
                  <button onClick={() => setEditModal('location')} className="text-primary hover:opacity-70 transition-opacity cursor-pointer p-1">
                    <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                <div className="mb-6 sm:mb-8">
                  {user.biography ? (
                    <p className="text-sm sm:text-base text-text leading-relaxed font-medium opacity-80">"{user.biography}"</p>
                  ) : (
                    <button
                      onClick={() => setEditModal('about')}
                      className="text-xs sm:text-sm font-bold text-text-muted border-2 border-dashed border-border rounded-xl px-4 sm:px-5 py-3 hover:border-primary hover:text-primary transition-all cursor-pointer w-full text-left"
                    >
                      + Add a bio about yourself
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                {(user.tags ?? []).length > 0
                  ? user.tags.map(tag => (
                      <span key={tag} className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold border border-primary/20">
                        {tag}
                      </span>
                    ))
                  : <span className="text-xs sm:text-sm font-bold text-text-muted italic">No interests added yet</span>
                }
                <button
                  onClick={() => setEditModal('tags')}
                  className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-background text-text-muted text-xs sm:text-sm font-bold border-2 border-dashed border-border cursor-pointer hover:border-primary hover:text-primary transition-all active:scale-95"
                >
                  + Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up">
          <PhotosPanel user={user} onUpdate={setUser} />
        </div>

        <div className="animate-fade-in-up">
          <AboutPanel user={user} onEditAbout={() => setEditModal('about')} onEditLocation={() => setEditModal('location')} />
        </div>

        <div className="animate-fade-in-up">
          <ActivityPanel user={user} />
        </div>

        {/* Logout */}
        <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-sm animate-fade-in-up">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex justify-center items-center gap-2 sm:gap-3 py-4 sm:py-5 text-sm sm:text-base font-black text-error hover:bg-error/5 cursor-pointer transition-colors disabled:opacity-50 active:scale-95"
          >
            {loggingOut ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />}
            {loggingOut ? 'Signing out safely…' : 'Sign out of your account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
