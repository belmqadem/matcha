import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  MessageCircle,
  Bell,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  Search,
  CalendarDays,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { authService } from '@/services/authService';
import MatchaLogo from '@/components/Logo';

type BadgeKey = 'messages' | 'notifications' | 'dates';

const MAIN_NAV = [
  { to: '/browse', label: 'Browse', Icon: Compass, badge: undefined },
  { to: '/chat', label: 'Messages', Icon: MessageCircle, badge: 'messages' as BadgeKey },
  { to: '/map', label: 'Map', Icon: MapPin, badge: undefined },
  { to: '/dates', label: 'Dates', Icon: CalendarDays, badge: 'dates' as BadgeKey },
];

const BOTTOM_NAV = [
  { to: '/browse', label: 'Browse', Icon: Compass, badge: undefined },
  { to: '/search', label: 'Search', Icon: Search, badge: undefined },
  { to: '/chat', label: 'Messages', Icon: MessageCircle, badge: 'messages' as BadgeKey },
  { to: '/dates', label: 'Dates', Icon: CalendarDays, badge: 'dates' as BadgeKey },
  { to: '/profile/me', label: 'Profile', Icon: User, badge: undefined },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user: me, logout: ctxLogout } = useAuth();
  const {
    unreadMessages,
    unreadNotifications,
    pendingDates,
    markNotificationsRead,
    markMessagesRead,
    clearPendingDates,
  } = useSocket();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.classList.contains('light-theme') ? 'light' : 'dark',
  );

  const profileRef = useRef<HTMLDivElement>(null);

  const avatar = me?.photos?.find((p) => p.id === me.profile_picture_id)?.url ?? null;
  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() : '?';

  const getBadge = (key?: BadgeKey) => {
    if (key === 'messages') return unreadMessages;
    if (key === 'notifications') return unreadNotifications;
    if (key === 'dates') return pendingDates;
    return 0;
  };
  const notificationCount = getBadge('notifications');

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('light-theme', next === 'light');
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileOpen(false);
    if (location.pathname === '/notifications') markNotificationsRead();
    if (location.pathname.startsWith('/chat')) markMessagesRead();
    if (location.pathname === '/dates') clearPendingDates();
  }, [location.pathname, markNotificationsRead, markMessagesRead, clearPendingDates]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      /* silent */
    }
    ctxLogout();
    navigate('/login');
  };

  return (
    <>
      {/* ── Top header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="grid grid-cols-2 lg:grid-cols-3 items-center h-14 px-4 md:px-6 gap-4">
          {/* Logo */}
          <MatchaLogo size="sm" showText={true} />

          {/* Desktop nav (center) */}
          <nav className="hidden lg:flex items-center justify-center gap-1">
            {MAIN_NAV.map(({ to, label, Icon, badge }) => {
              const active = isActive(to);
              const count = getBadge(badge);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:bg-border/50 hover:text-text'
                  }`}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.7} />
                  {label}
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search link (desktop) */}
            <NavLink
              to="/search"
              className={`hidden lg:flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                isActive('/search')
                  ? 'text-primary border-primary/30 bg-primary/5'
                  : 'text-text-muted border-border hover:bg-border/50 hover:text-text'
              }`}
              title="Search"
            >
              <Search size={15} strokeWidth={1.8} />
            </NavLink>

            {/* Notifications bell */}
            <div className="relative">
              <NavLink
                to="/notifications"
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                  notificationCount > 0 || isActive('/notifications')
                    ? 'text-primary border-primary/30 bg-primary/5'
                    : 'text-text-muted border-border hover:bg-border/50 hover:text-text'
                }`}
                title="notifications"
              >
                <Bell size={15} strokeWidth={1.8} />
              </NavLink>
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center border-2 border-surface">
                  ●
                </span>
              )}
            </div>

            {/* Theme toggle */}
            <ThemeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />

            {/* Avatar / profile dropdown (desktop only) */}
            {me && (
              <div ref={profileRef} className="hidden lg:block relative shrink-0">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors cursor-pointer ${
                    profileOpen
                      ? 'bg-background border-primary/30'
                      : 'border-border hover:bg-border/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] font-bold text-primary">{initials}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-text">{me.first_name}</span>
                  <ChevronDown
                    size={12}
                    className={`text-text-muted transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-surface border border-border rounded-2xl shadow-xl p-1.5 animate-fade-in-up origin-top-right">
                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border-2 border-primary shrink-0 flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text truncate">
                          {me.first_name} {me.last_name}
                        </p>
                        <p className="text-xs text-text-muted truncate">@{me.username}</p>
                      </div>
                    </div>
                    <div className="h-px bg-border mx-1.5 mb-1" />
                    <NavLink
                      to="/profile/me"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive('/profile/me')
                          ? 'text-primary bg-primary/10'
                          : 'text-text hover:bg-background'
                      }`}
                    >
                      <User size={14} /> My Profile
                    </NavLink>
                    <div className="h-px bg-border mx-1.5 my-1" />
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left disabled:opacity-50"
                    >
                      <LogOut size={14} />
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border flex items-stretch h-16">
        {BOTTOM_NAV.map(({ to, label, Icon, badge }) => {
          const active = isActive(to);
          const count = getBadge(badge);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                active ? 'text-primary' : 'text-text-muted'
              }`}
            >
              {active && (
                <span className="absolute top-0 inset-x-0 h-0.5 rounded-full bg-primary" />
              )}
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center border border-surface">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
