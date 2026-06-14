// src/pages/MyProfilePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Edit2,
  CheckCircle2,
  Loader2,
  LogOut,
  Image,
  User,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';

import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types/user';

import { CityName } from '@/components/ui/CityName';
import { PhotosPanel } from '@/components/profile/PhotosPanel';
import { AboutPanel } from '@/components/profile/AboutPanel';
import { ActivityPanel } from '@/components/profile/ActivityPanel';
import { EditIdentityModal } from '@/components/profile/EditIdentityModal';
import { EditAboutModal } from '@/components/profile/EditAboutModal';
import { EditTagsModal } from '@/components/profile/EditTagsModal';
import { EditLocationModal } from '@/components/profile/EditLocationModal';

type ModalType = 'identity' | 'about' | 'tags' | 'location' | null;
type TabType = 'photos' | 'about' | 'activity';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { logout: ctxLogout } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editModal, setEditModal] = useState<ModalType>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('photos');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const isLight = document.documentElement.classList.contains('light-theme');
    return isLight ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'light') {
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
      }
      return next;
    });
  };

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if ((user?.photos ?? []).length >= 5) {
      alert('Maximum 5 photos allowed. Please delete a photo from the gallery tab first.');
      return;
    }

    setAvatarUploading(true);
    try {
      const p = await userService.uploadPhoto(file);
      await userService.setMainPhoto(p.id);
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          photos: [...(prev.photos ?? []), p],
          profile_picture_id: p.id,
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to change avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  useEffect(() => {
    userService
      .getMe()
      .then(setUser)
      .catch((e) => setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
      </div>
    );

  if (fetchError || !user)
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm sm:text-base font-medium text-text-muted">
          {fetchError || 'Profile not found.'}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="text-sm sm:text-base font-bold text-primary bg-surface px-6 py-2.5 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          Back to login
        </button>
      </div>
    );

  const mainPhoto = user.photos?.find((p) => p.id === user.profile_picture_id) ?? user.photos?.[0];
  const age = user.birth_date
    ? new Date().getFullYear() - new Date(user.birth_date).getFullYear()
    : null;

  return (
    <div className="min-h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4rem)] flex flex-col bg-transparent font-primary overflow-y-auto md:overflow-hidden">
      {editModal === 'identity' && (
        <EditIdentityModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />
      )}
      {editModal === 'about' && (
        <EditAboutModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />
      )}
      {editModal === 'tags' && (
        <EditTagsModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />
      )}
      {editModal === 'location' && (
        <EditLocationModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />
      )}

      <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row gap-6 md:h-full md:min-h-0">
        {/* LEFT COLUMN: Sidebar Profile Summary */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4 md:h-full md:min-h-0">
          <div className="bg-surface/85 backdrop-blur-md rounded-3xl border border-border/70 shadow-premium p-6 flex flex-col items-center text-center animate-fade-in-up relative overflow-hidden group">
            {/* Photo Avatar */}
            <div className="relative w-36 h-36 rounded-full overflow-hidden bg-background/50 border-4 border-primary/20 shadow-md group/avatar">
              {avatarUploading ? (
                <div className="w-full h-full flex items-center justify-center bg-background/80">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : mainPhoto ? (
                <img
                  src={mainPhoto.url}
                  alt="Profile"
                  className="w-full h-full object-cover block transition-transform duration-500 group-hover/avatar:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-text-muted cursor-pointer hover:bg-border/30 transition-colors"
                  onClick={() => avatarFileRef.current?.click()}
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Photo</span>
                </div>
              )}
              {!avatarUploading && (
                <button
                  onClick={() => avatarFileRef.current?.click()}
                  className="absolute inset-0 bg-text/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-surface text-xs font-black transition-opacity duration-300 cursor-pointer"
                >
                  Change Photo
                </button>
              )}
            </div>

            {/* Online indicator */}
            {user.is_online && (
              <span className="mt-3.5 flex items-center gap-1.5 bg-success text-surface text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest shadow-md shadow-success/20 animate-pulse">
                <div className="w-1 h-1 bg-surface rounded-full shadow-[0_0_6px_white]" /> ONLINE
              </span>
            )}

            {/* Name and Age */}
            <h1 className="text-xl sm:text-2xl font-black text-text leading-tight tracking-tight mt-3 flex items-center gap-1.5 justify-center">
              {user.first_name} {user.last_name}
              {age && <span className="font-medium opacity-80">, {age}</span>}
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 animate-[floatSlow_6s_ease-in-out_infinite]" />
            </h1>
            <p className="text-xs font-medium text-text-muted mt-1">@{user.username}</p>

            {/* Location */}
            <div className="flex items-center gap-1 mt-2.5 bg-primary/5 border border-primary/10 rounded-full px-3 py-1.5 max-w-full">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-bold text-text-muted truncate">
                {user.location_city ? (
                  user.location_city
                ) : user.latitude ? (
                  <CityName
                    lat={Number(user.latitude)}
                    lng={Number(user.longitude)}
                    fallback={null}
                  />
                ) : (
                  'Location not set'
                )}
              </span>
              <button
                onClick={() => setEditModal('location')}
                className="text-primary hover:opacity-75 transition-opacity cursor-pointer p-0.5"
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Bio summary */}
            <div className="w-full mt-4 text-center border-t border-background/50 pt-4">
              {user.biography ? (
                <p className="text-xs sm:text-sm text-text leading-relaxed italic opacity-85 line-clamp-3">
                  "{user.biography}"
                </p>
              ) : (
                <p className="text-xs text-text-muted italic">No biography added yet.</p>
              )}
              <button
                onClick={() => setEditModal('about')}
                className="mt-2 text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Edit Bio
              </button>
            </div>
          </div>

          {/* Theme Switcher Card */}
          <div className="bg-surface/85 backdrop-blur-md rounded-3xl border border-border/70 overflow-hidden shadow-premium animate-fade-in-up shrink-0">
            <button
              onClick={toggleTheme}
              className="w-full flex justify-center items-center gap-2 py-3.5 text-xs font-black text-text hover:bg-primary/5 transition-colors cursor-pointer active:scale-95"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-primary" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-primary" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Logout Card */}
          <div className="bg-surface/85 backdrop-blur-md rounded-3xl border border-border/70 overflow-hidden shadow-premium animate-fade-in-up shrink-0">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex justify-center items-center gap-2 py-3.5 text-xs font-black text-error hover:bg-error/5 cursor-pointer transition-colors disabled:opacity-50 active:scale-95"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              {loggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Content Container */}
        <div className="flex-1 flex flex-col min-w-0 md:h-full md:min-h-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-1.5 bg-surface/80 backdrop-blur-md border border-border/70 rounded-2xl p-1.5 shadow-sm mb-4 shrink-0 animate-fade-in-up">
            {(
              [
                ['photos', 'Photos & Gallery', Image],
                ['about', 'Profile Details', User],
                ['activity', 'Activity & Fame', Activity],
              ] as [TabType, string, typeof Image][]
            ).map(([tabKey, label, Icon]) => {
              const active = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-none text-xs sm:text-sm font-black cursor-pointer transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-primary to-[#ff758c] text-surface shadow-md hover:brightness-105'
                      : 'bg-transparent text-text-muted hover:bg-primary/5 hover:text-text'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="inline sm:hidden">{label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 bg-surface/85 backdrop-blur-md border border-border/70 rounded-3xl p-5 sm:p-6 shadow-premium md:overflow-y-auto scrollbar-thin md:min-h-0 animate-fade-in-up">
            {activeTab === 'photos' && <PhotosPanel user={user} onUpdate={setUser} />}
            {activeTab === 'about' && (
              <AboutPanel
                user={user}
                onEditAbout={() => setEditModal('about')}
                onEditLocation={() => setEditModal('location')}
              />
            )}
            {activeTab === 'activity' && <ActivityPanel user={user} />}
          </div>
        </div>
      </div>
      <input
        ref={avatarFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarChange}
        className="hidden"
      />
    </div>
  );
};

export default MyProfilePage;
