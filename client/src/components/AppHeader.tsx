// src/components/AppHeader.tsx
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
  Menu,
  X,
  Search,
  CalendarDays,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { authService } from '@/services/authService';
import MatchaLogo from '@/components/Logo';

type BadgeKey = 'messages' | 'notifications';

const MAIN_NAV = [
  { to: '/browse', label: 'Browse', Icon: Compass, badge: undefined },
  { to: '/chat', label: 'Messages', Icon: MessageCircle, badge: 'messages' as BadgeKey },
  { to: '/map', label: 'Map', Icon: MapPin, badge: undefined },
  { to: '/dates', label: 'Dates', Icon: CalendarDays, badge: undefined },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  // Separation of Concerns: Global state from Context instead of local fetches
  const { user: me, logout: ctxLogout } = useAuth();
  const { unreadMessages, unreadNotifications, markNotificationsRead, markMessagesRead } =
    useSocket();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const avatar = me?.photos?.find((p) => p.id === me.profile_picture_id)?.url ?? null;
  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() : '?';

  const getBadge = (key?: BadgeKey) => {
    if (key === 'messages') return unreadMessages;
    if (key === 'notifications') return unreadNotifications;
    return 0;
  };
  const notifCount = getBadge('notifications');

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  // Handle click outside for dropdowns
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node))
        setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close dropdowns and clear badges on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileOpen(false);
    setMobileMenuOpen(false);

    if (location.pathname === '/notifications') markNotificationsRead();
    if (location.pathname.startsWith('/chat')) markMessagesRead();
  }, [location.pathname, markNotificationsRead, markMessagesRead]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchVal.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate('/search');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // silent fail
    }
    ctxLogout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-100 w-full border-b border-border bg-surface/80 shadow-sm backdrop-blur-md">
      <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[180px_1fr_180px] items-center h-16 px-4 md:px-6 gap-2">
        {/* ── LEFT: Logo ── */}
        <div className="flex items-center">
          <MatchaLogo size="sm" showText={true} />
        </div>

        {/* ── CENTER: Nav links + Search ── */}
        <div className="hidden lg:flex items-center justify-center gap-0.5">
          {MAIN_NAV.map(({ to, label, Icon, badge }) => {
            const active = isActive(to);
            const count = getBadge(badge);
            return (
              <NavLink
                key={to}
                to={to}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] whitespace-nowrap transition-all duration-300 hover:scale-[1.03] active:scale-95 ${
                  active
                    ? 'font-semibold text-surface bg-gradient-to-r from-primary-light to-primary shadow-sm shadow-primary/20'
                    : 'font-normal text-text-muted hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <span className="relative flex items-center">
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.6} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-primary text-surface text-[8px] font-bold flex items-center justify-center border-[1.5px] border-surface">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </span>
                {label}
              </NavLink>
            );
          })}

          {/* ── Search ── */}
          <form onSubmit={handleSearch} className="ml-2 flex-1 min-w-[200px]">
            <div
              className={`flex items-center gap-2 px-4 h-[38px] rounded-full border-[1.5px] transition-all cursor-text ${
                searchFocused
                  ? 'border-primary bg-surface ring-2 ring-primary/10'
                  : 'border-primary/10 bg-primary/5'
              }`}
            >
              <Search size={14} className="text-primary shrink-0" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search people…"
                className="border-none bg-transparent outline-none text-[13.5px] text-text w-full placeholder-text-muted"
              />
            </div>
          </form>
        </div>

        {/* ── RIGHT: Bell + Avatar ── */}
        <div className="flex items-center justify-end gap-2">
          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Bell */}
            <div className="relative shrink-0">
              <NavLink
                to="/notifications"
                className={`flex items-center justify-center w-10 h-10 rounded-full border bg-surface transition-colors ${
                  notifCount > 0
                    ? 'text-primary border-primary/20'
                    : 'text-text-muted border-border hover:bg-background'
                }`}
              >
                <Bell size={17} strokeWidth={1.8} />
              </NavLink>
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-primary text-surface text-[8px] font-bold flex items-center justify-center border-2 border-surface">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </div>

            {/* Profile pill */}
            {me && (
              <div ref={profileRef} className="relative shrink-0">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className={`flex items-center gap-2 p-1 pr-3 rounded-full border cursor-pointer transition-colors ${
                    profileOpen
                      ? 'bg-background border-border shadow-inner'
                      : 'bg-surface border-border hover:bg-background'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-[34px] h-[34px] rounded-full overflow-hidden bg-primary/10 border-2 border-primary flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{initials}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[13.5px] font-medium text-text">{me.first_name}</span>
                  <ChevronDown
                    size={13}
                    className={`text-text-muted transition-transform duration-200 ${
                      profileOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-[210px] bg-surface border-[1.5px] border-border rounded-[18px] shadow-xl p-2 animate-fade-in-up origin-top-right">
                    <div className="p-2.5 pb-3 flex items-center gap-2.5">
                      <div className="w-[38px] h-[38px] rounded-full overflow-hidden bg-primary/10 border-2 border-primary shrink-0 flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[13px] font-bold text-primary">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-text truncate">
                          {me.first_name} {me.last_name}
                        </div>
                        <div className="text-[11px] text-text-muted truncate">@{me.username}</div>
                      </div>
                    </div>
                    <div className="h-[1px] bg-border mx-1.5 mb-1.5" />
                    <NavLink
                      to="/profile/me"
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline text-[13px] font-medium transition-colors ${
                        isActive('/profile/me')
                          ? 'text-primary bg-primary/10'
                          : 'text-text hover:bg-background'
                      }`}
                    >
                      <User size={14} /> My Profile
                    </NavLink>
                    <div className="h-[1px] bg-border m-1.5" />
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-primary hover:bg-primary/5 transition-colors text-left disabled:opacity-50 active:scale-95"
                    >
                      <LogOut size={14} />
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <div className="lg:hidden relative" ref={mobileRef}>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="w-[42px] h-[42px] rounded-xl border-[1.5px] border-border bg-surface flex items-center justify-center cursor-pointer text-text-muted hover:bg-background active:scale-95 transition-all"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              {notifCount + getBadge('messages') > 0 && !mobileMenuOpen && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary animate-pulse shadow-sm" />
              )}
            </button>

            {mobileMenuOpen && (
              <div className="absolute top-[50px] right-0 w-[240px] bg-surface border-[1.5px] border-border rounded-[18px] shadow-xl p-2 animate-fade-in-up origin-top-right">
                {me && (
                  <>
                    <NavLink
                      to="/profile/me"
                      className="flex items-center gap-3 p-2.5 rounded-xl mb-1 hover:bg-background transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border-2 border-primary shrink-0 flex items-center justify-center">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text truncate">
                          {me.first_name} {me.last_name}
                        </div>
                        <div className="text-[11px] text-text-muted truncate">@{me.username}</div>
                      </div>
                    </NavLink>
                    <div className="h-[1px] bg-border mx-1.5 my-1" />
                  </>
                )}

                {/* Mobile search */}
                <form onSubmit={handleSearch} className="px-3 py-2.5">
                  <div className="flex items-center gap-2 px-3.5 h-[38px] rounded-full border-[1.5px] border-primary/10 bg-primary/5 focus-within:border-primary focus-within:bg-surface transition-colors">
                    <Search size={14} className="text-primary shrink-0" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      placeholder="Search people…"
                      className="border-none bg-transparent outline-none text-[13.5px] text-text flex-1 placeholder-text-muted"
                    />
                  </div>
                </form>

                <div className="h-[1px] bg-border mx-1.5 mb-1" />

                {MAIN_NAV.map(({ to, label, Icon, badge }) => {
                  const active = isActive(to);
                  const count = getBadge(badge);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all duration-300 ${
                        active
                          ? 'font-semibold text-surface bg-gradient-to-r from-[#f27183] to-[#e94057] shadow-sm shadow-[#e94057]/20'
                          : 'font-normal text-text hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
                      <span className="flex-1">{label}</span>
                      {count > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-surface text-[10px] font-bold flex items-center justify-center">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </NavLink>
                  );
                })}

                <NavLink
                  to="/notifications"
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all duration-300 ${
                    isActive('/notifications')
                      ? 'font-semibold text-surface bg-gradient-to-r from-primary-light to-primary shadow-sm shadow-primary/20'
                      : 'font-normal text-text hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Bell size={16} strokeWidth={1.8} />
                  <span className="flex-1">Notifications</span>
                  {notifCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-surface text-[10px] font-bold flex items-center justify-center">
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </NavLink>

                <div className="h-[1px] bg-border mx-1.5 my-1" />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors text-left disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <LogOut size={16} />
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
