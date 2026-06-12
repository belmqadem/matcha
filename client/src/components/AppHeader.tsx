// src/components/AppHeader.tsx
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, Search, MessageCircle, Bell, User,
  LogOut, Heart, Users, MapPin, X, Menu, CalendarDays
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { authService } from '@/services/authService';
import MatchaLogo from '@/components/Logo';

const NAV_ITEMS = [
  { to: '/browse',        label: 'Browse',        Icon: Compass,       badge: undefined },
  { to: '/search',        label: 'Search',        Icon: Search,        badge: undefined },
  { to: '/chat',          label: 'Chat',          Icon: MessageCircle, badge: 'messages' as const },
  { to: '/notifications', label: 'Notifications', Icon: Bell,          badge: 'notifications' as const },
  { to: '/likes',         label: 'Likes',         Icon: Heart,         badge: undefined },
  { to: '/visitors',      label: 'Visitors',      Icon: Users,         badge: undefined },
  { to: '/dates',         label: 'Dates',         Icon: CalendarDays,  badge: undefined },
  { to: '/map',           label: 'Map',           Icon: MapPin,        badge: undefined },
  { to: '/profile/me',    label: 'Profile',       Icon: User,          badge: undefined },
];

const BOTTOM_TAB_ITEMS = [NAV_ITEMS[0], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[6], NAV_ITEMS[8]];
const MORE_ITEMS = NAV_ITEMS.filter(item => !BOTTOM_TAB_ITEMS.includes(item));

const BadgeCounter = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-surface text-[9px] font-bold flex items-center justify-center leading-none border-2 border-surface shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadMessages, unreadNotifications, markNotificationsRead, markMessagesRead } = useSocket();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    if (location.pathname === '/notifications') markNotificationsRead();
    if (location.pathname.startsWith('/chat')) markMessagesRead();
  }, [location.pathname, markNotificationsRead, markMessagesRead]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch {
      setLoggingOut(false);
    }
  };

  const getBadge = (key?: 'messages' | 'notifications') => {
    if (key === 'messages') return unreadMessages;
    if (key === 'notifications') return unreadNotifications;
    return 0;
  };

  const DesktopNav = () => (
    <header className="hidden md:flex sticky top-0 z-50 w-full bg-surface border-b border-border shadow-sm h-16 px-6 items-center">
      <NavLink to="/browse" className="flex items-center gap-2 mr-8 group">
        <MatchaLogo to="" size="sm" className="group-hover:scale-105 transition-transform" />
        <span className="text-2xl font-black italic text-primary tracking-tight">Matcha</span>
      </NavLink>

      <nav className="flex items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, Icon, badge }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
          const count = getBadge(badge);
          return (
            <NavLink
              key={to}
              to={to}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary hover:bg-primary/5'
              }`}
            >
              <div className="relative flex">
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <BadgeCounter count={count} />
              </div>
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium text-text">
            Hi, {user.first_name}
          </span>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-text-muted hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? 'Leaving…' : 'Sign out'}
        </button>
      </div>
    </header>
  );

  const MobileNav = () => (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-50 w-full bg-surface border-b border-border shadow-sm h-14 px-4 flex items-center justify-between">
        <NavLink to="/browse" className="flex items-center gap-2">
          <MatchaLogo to="" size="sm" />
          <span className="text-xl font-black italic text-primary tracking-tight">Matcha</span>
        </NavLink>
        {(unreadMessages + unreadNotifications) > 0 && (
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/40" />
        )}
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex items-stretch h-16 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        {BOTTOM_TAB_ITEMS.map(({ to, label, Icon, badge }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
          const count = getBadge(badge);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <div className="relative flex">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isActive ? 2.2 : 1.8} />
                <BadgeCounter count={count} />
              </div>
              <span className="text-[0.65rem] font-semibold">{label}</span>
            </NavLink>
          );
        })}

        {/* More Dropdown Button */}
        <div ref={menuRef} className="flex-1 relative flex">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
              menuOpen ? 'text-primary' : 'text-text-muted'
            }`}
          >
            {menuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.8} />}
            <span className="text-[0.65rem] font-semibold">More</span>
          </button>

          {/* More Menu Flyout */}
          {menuOpen && (
            <div className="absolute bottom-[4.5rem] right-2 w-48 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden py-2 animate-fade-in-up">
              {MORE_ITEMS.map(({ to, label, Icon, badge }) => {
                const isActive = location.pathname === to;
                const count = getBadge(badge);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? 'text-primary bg-primary/10' : 'text-text hover:bg-border/50'
                    }`}
                  >
                    <div className="relative flex">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <BadgeCounter count={count} />
                    </div>
                    {label}
                  </NavLink>
                );
              })}
              <div className="h-[1px] bg-border my-1" />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error/10 transition-colors disabled:opacity-50 text-left"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
}
