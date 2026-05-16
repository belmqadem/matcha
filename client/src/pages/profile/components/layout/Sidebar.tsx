import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, User, Info, Tag, MapPin, Star, LogOut, Loader2,
} from 'lucide-react';
import type { UserProfile, SectionKey } from '../../types';
import { SECTION_TABS } from '../../types';
import { api } from "../../../../api/MyProfileApi";


// Map section keys to Lucide icons
const ICONS: Record<SectionKey, React.ElementType> = {
  photos:    Camera,
  identity:  User,
  about:     Info,
  interests: Tag,
  location:  MapPin,
  activity:  Star,
};

const NAV_GROUPS = [
  { label: 'Gallery',  keys: ['photos'] },
  { label: 'Profile',  keys: ['identity', 'about', 'interests', 'location'] },
  { label: 'Stats',    keys: ['activity'] },
] as const;

interface SidebarProps {
  open: boolean;
  user: UserProfile;
  active: SectionKey;
  onNavigate: (key: SectionKey) => void;
}

export function Sidebar({ open, user, active, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const mainPhoto =
    user.photos?.find((p) => p.id === user.profile_picture_id) ?? user.photos?.[0];
  const initials =
    `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.logout(); } catch { /* swallow */ }
    navigate('/login');
  };

  return (
    <aside
      className={`
        flex flex-col shrink-0 bg-white border-r border-(--color-border) overflow-hidden
        transition-all duration-250 ease-in-out
        ${open ? 'w-60' : 'w-0'}
      `}
      aria-hidden={!open}
    >
      {/* ── Profile summary ── */}
      <div className="flex flex-col items-center gap-2 px-4 py-5 border-b border-(--color-border)">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-(--color-background) border border-(--color-border) flex-shrink-0 shadow-sm">
          {mainPhoto ? (
            <img src={mainPhoto.url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-(--color-primary) text-lg font-bold">
              {initials}
            </div>
          )}
          {user.is_online && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
          )}
        </div>

        <p className="text-sm font-bold text-(--color-text) text-center whitespace-nowrap">
          {user.first_name} {user.last_name}
        </p>
        <p className="text-[11px] text-(--color-text-muted) whitespace-nowrap">@{user.username}</p>

        {/* Fame pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--color-primary)/10 border border-(--color-primary)/20">
          <Star size={10} className="text-(--color-primary)" />
          <span className="text-[11px] font-semibold text-(--color-primary) whitespace-nowrap">
            {user.fame_rating} fame
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map(({ label, keys }) => (
          <div key={label} className="mb-2">
            <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-(--color-text-muted)/50 px-3 py-1.5">
              {label}
            </p>
            {SECTION_TABS.filter((t) => (keys as readonly string[]).includes(t.key)).map((tab) => {
              const Icon = ICONS[tab.key];
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onNavigate(tab.key)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all whitespace-nowrap
                    ${isActive
                      ? 'bg-(--color-primary)/10 text-(--color-primary)'
                      : 'text-(--color-text-muted) hover:bg-(--color-background) hover:text-(--color-text)'
                    }
                  `}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="border-t border-(--color-border) p-2">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {loggingOut
            ? <Loader2 size={15} className="animate-spin" />
            : <LogOut size={15} />
          }
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
