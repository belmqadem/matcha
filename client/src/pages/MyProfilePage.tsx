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
} from 'lucide-react';

import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types/user';

import { CityName } from '@/components/ui/CityName';
import { PhotosPanel } from '@/components/profile/PhotosPanel';
import { EditFullProfileModal } from '@/components/profile/EditFullProfileModal';
import { GENDERS, PREFERENCES, DEFAULT_PREFERENCE } from '@/components/profile/profileConstants';

type ModalType = 'identity' | 'about' | 'tags' | 'location' | null;

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { logout: ctxLogout } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editModal, setEditModal] = useState<ModalType>(null);
  const [loggingOut, setLoggingOut] = useState(false);
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

  const age = user.birth_date
    ? new Date().getFullYear() - new Date(user.birth_date).getFullYear()
    : null;

  const genderLabel = GENDERS.find((g) => g.value === user.gender)?.label;
  const prefLabel =
    PREFERENCES.find((p) => p.value === user.sexual_preference)?.label ??
    PREFERENCES.find((p) => p.value === DEFAULT_PREFERENCE)?.label;

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-transparent p-4 font-primary">
      {editModal && (
        <EditFullProfileModal
          user={user}
          onUpdate={setUser}
          initialTab={editModal}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Main Unified Profile Card */}
      <div className="w-full max-w-[880px] bg-surface border border-border/80 rounded-3xl shadow-premium flex flex-col md:h-[580px] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-end px-5 py-3 border-b border-border/60 bg-surface/85 backdrop-blur-md relative z-30 gap-2">
          {/* 3 Dots Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`w-8 h-8 rounded-full border bg-surface flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                showMenu
                  ? 'border-primary text-primary shadow-sm shadow-primary/20'
                  : 'border-border/80 text-text-muted hover:border-primary hover:text-primary'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-surface border border-border/80 rounded-2xl shadow-premium py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150 text-text">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setEditModal('identity');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <div className="h-[1px] bg-border/40 my-1" />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-error hover:bg-error/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  {loggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto md:overflow-y-hidden px-6 py-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-stretch">
            
            {/* Left Column (Photos) */}
            <div className="md:col-span-6 flex flex-col h-full min-h-0 shrink-0">
              <PhotosPanel user={user} onUpdate={setUser} />
            </div>

            {/* Right Column (Details) */}
            <div className="md:col-span-6 flex flex-col justify-between gap-4 h-full min-h-0">
              
              {/* Top part: identity, location, bio, tags */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-text tracking-tight flex items-center gap-1.5 truncate">
                      {user.first_name} {user.last_name}
                      {age ? <span className="font-normal text-text-muted">, {age}</span> : ''}
                    </h2>
                    <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shadow-sm shrink-0">
                      <Flame className="w-3.5 h-3.5 text-primary fill-primary/10" />
                      <span className="text-[11px] font-black text-primary">
                        {Math.round(user.fame_rating)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-text-muted">@{user.username}</p>

                  <div className="flex items-center gap-1 mt-1 text-xs font-bold text-text-muted">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
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
                  </div>
                </div>

                {/* Bio */}
                <div className="relative bg-primary/5 border-l-4 border-primary rounded-r-2xl p-3.5 my-1.5 overflow-hidden shadow-sm">
                  <Quote className="absolute right-2 top-2 w-10 h-10 text-primary/10 -rotate-12 pointer-events-none" />
                  <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-1 relative z-10">Biography</p>
                  <div className="max-h-[96px] overflow-y-auto scrollbar-thin pr-1 relative z-10">
                    {user.biography ? (
                      <p className="text-xs sm:text-sm text-text leading-relaxed font-semibold italic opacity-95">
                        "{user.biography}"
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted italic">No biography added yet.</p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="pt-3 border-t border-border/55">
                  <h3 className="text-xs font-black text-text-muted uppercase tracking-wider mb-2">My Tags</h3>
                  {(user.tags ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto scrollbar-thin">
                      {user.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-background border border-border text-text-muted text-[11px] font-bold"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic">No tags added yet.</p>
                  )}
                </div>
              </div>

              {/* Bottom part: profile info grid */}
              <div className="pt-3 border-t border-border/55 space-y-2">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-2.5">Profile Info</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">Gender</p>
                      <p className="text-xs font-bold text-text mt-0.5 truncate leading-tight">{genderLabel ?? 'Not set'}</p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">Looking for</p>
                      <p className="text-xs font-bold text-text mt-0.5 truncate leading-tight">{prefLabel ?? 'Not set'}</p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Calendar size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">Age</p>
                      <p className="text-xs font-bold text-text mt-0.5 truncate leading-tight">{user.birth_date ? `${age} yrs` : 'Not set'}</p>
                    </div>
                  </div>
                  <div className="bg-background/40 border border-border/50 p-2.5 rounded-2xl hover:scale-102 transition-transform duration-200 shadow-sm flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Flame size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">Fame Rating</p>
                      <p className="text-xs font-bold text-primary mt-0.5 truncate leading-tight">{Math.round(user.fame_rating ?? 0)} pts</p>
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
};

export default MyProfilePage;
