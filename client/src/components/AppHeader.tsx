import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, Search, MessageCircle, Bell, User,
  LogOut, Heart, Users, MapPin, X, Menu,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotifCounts {
  unread_messages: number;
  unread_notifications: number;
}

type BadgeKey = 'messages' | 'notifications';

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchCounts = (): Promise<NotifCounts> =>
  Promise.all([
    fetch('/api/chat/unread/count', { credentials: 'include' })
      .then(r => r.json()).then(d => d.unread ?? 0).catch(() => 0),
    fetch('/api/notifications/unread/count', { credentials: 'include' })
      .then(r => r.json()).then(d => d.unread ?? 0).catch(() => 0),
  ]).then(([unread_messages, unread_notifications]) => ({ unread_messages, unread_notifications }));

const doLogout = () =>
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/browse',        label: 'Browse',        Icon: Compass,       badge: undefined                   },
  { to: '/search',        label: 'Search',        Icon: Search,        badge: undefined                   },
  { to: '/chat',          label: 'Chat',          Icon: MessageCircle, badge: 'messages' as BadgeKey      },
  { to: '/notifications', label: 'Notifications', Icon: Bell,          badge: 'notifications' as BadgeKey },
  { to: '/likes',         label: 'Likes',         Icon: Heart,         badge: undefined                   },
  { to: '/visitors',      label: 'Visitors',      Icon: Users,         badge: undefined                   },
  { to: '/map',           label: 'Map',           Icon: MapPin,        badge: undefined                   },
  { to: '/profile/me',    label: 'Profile',       Icon: User,          badge: undefined                   },
];

// 5 items pinned to the mobile bottom bar
const BOTTOM_TAB_ITEMS = [
  NAV_ITEMS[0], // Browse
  NAV_ITEMS[2], // Chat
  NAV_ITEMS[3], // Notifications
  NAV_ITEMS[5], // Visitors
  NAV_ITEMS[7], // Profile
];

// Items that go in the "More" dropdown on mobile
const MORE_ITEMS = NAV_ITEMS.filter(item => !BOTTOM_TAB_ITEMS.includes(item));

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span style={{
      position: 'absolute', top: '-5px', right: '-7px',
      minWidth: '15px', height: '15px', padding: '0 3px',
      borderRadius: '999px', background: 'var(--color-primary)',
      color: 'white', fontSize: '9px', fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      lineHeight: 1, border: '1.5px solid white',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ─── useIsMobile ──────────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── AppHeader ────────────────────────────────────────────────────────────────

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [counts, setCounts] = useState<NotifCounts>({ unread_messages: 0, unread_notifications: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCounts().then(setCounts);
    const id = setInterval(() => fetchCounts().then(setCounts), 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await doLogout(); } catch { /* ignore */ }
    navigate('/login');
  };

  const getBadge = (key?: BadgeKey) => {
    if (key === 'messages') return counts.unread_messages;
    if (key === 'notifications') return counts.unread_notifications;
    return 0;
  };

  const font = 'var(--font-primary)';
  const primary = 'var(--color-primary)';
  const muted = 'var(--color-text-muted)';
  const border = 'var(--color-border)';

  // ── Desktop ────────────────────────────────────────────────────────────────

  if (!isMobile) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        width: '100%', backgroundColor: 'white',
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center',
        height: '60px', padding: '0 28px', gap: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {/* Logo */}
        <NavLink to="/browse" style={{
          fontFamily: font, fontSize: '24px', fontWeight: 800,
          fontStyle: 'italic', color: primary, textDecoration: 'none',
          marginRight: '20px', flexShrink: 0, letterSpacing: '-0.5px',
        }}>
          Matcha
        </NavLink>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
          {NAV_ITEMS.map(({ to, label, Icon, badge }) => {
            const count = getBadge(badge);
            const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <NavLink key={to} to={to} style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                gap: '6px', padding: '7px 11px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, fontFamily: font,
                textDecoration: 'none', whiteSpace: 'nowrap',
                color: isActive ? primary : muted,
                backgroundColor: isActive ? 'rgba(233,64,87,0.08)' : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              }}>
                <span style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  <Badge count={count} />
                </span>
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 13px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600, fontFamily: font,
            color: muted, background: 'none', border: 'none',
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            flexShrink: 0, whiteSpace: 'nowrap',
            opacity: loggingOut ? 0.5 : 1,
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = primary;
            e.currentTarget.style.backgroundColor = 'rgba(233,64,87,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = muted;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={14} />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </header>
    );
  }

  // ── Mobile ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Slim top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        width: '100%', backgroundColor: 'white',
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center',
        height: '50px', padding: '0 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <NavLink to="/browse" style={{
          fontFamily: font, fontSize: '20px', fontWeight: 800,
          fontStyle: 'italic', color: primary, textDecoration: 'none',
          letterSpacing: '-0.3px',
        }}>
          Matcha
        </NavLink>
        <div style={{ flex: 1 }} />
        {/* Total unread dot */}
        {(counts.unread_messages + counts.unread_notifications) > 0 && (
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: primary, marginRight: '12px',
          }} />
        )}
      </header>

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: 'white', borderTop: `1px solid ${border}`,
        display: 'flex', alignItems: 'stretch', height: '62px',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}>
        {BOTTOM_TAB_ITEMS.map(({ to, label, Icon, badge }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
          const count = getBadge(badge);
          return (
            <NavLink key={to} to={to} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', textDecoration: 'none',
              color: isActive ? primary : muted,
              fontSize: '10px', fontWeight: 600, fontFamily: font,
              transition: 'color 0.15s',
            }}>
              <span style={{ position: 'relative', display: 'flex' }}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                <Badge count={count} />
              </span>
              {label}
            </NavLink>
          );
        })}

        {/* More button */}
        <div ref={menuRef} style={{ flex: 1, position: 'relative', display: 'flex' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', background: 'none', border: 'none', cursor: 'pointer',
              color: menuOpen ? primary : muted,
              fontSize: '10px', fontWeight: 600, fontFamily: font,
            }}
          >
            {menuOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.6} />}
            More
          </button>

          {/* More dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute', bottom: '66px', right: 0,
              width: '200px', backgroundColor: 'white',
              border: `1px solid ${border}`, borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden', padding: '6px 0',
            }}>
              {MORE_ITEMS.map(({ to, label, Icon, badge }) => {
                const isActive = location.pathname === to;
                const count = getBadge(badge);
                return (
                  <NavLink key={to} to={to} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: 500, fontFamily: font,
                    color: isActive ? primary : 'var(--color-text)',
                    backgroundColor: isActive ? 'rgba(233,64,87,0.06)' : 'transparent',
                  }}>
                    <span style={{ position: 'relative', display: 'flex' }}>
                      <Icon size={18} />
                      <Badge count={count} />
                    </span>
                    {label}
                  </NavLink>
                );
              })}
              <div style={{ borderTop: `1px solid ${border}`, margin: '4px 0' }} />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '12px', padding: '12px 16px',
                  fontSize: '14px', fontWeight: 500, fontFamily: font,
                  color: primary, background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  opacity: loggingOut ? 0.5 : 1,
                }}
              >
                <LogOut size={18} />
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer so page content clears the bottom nav */}
      <div style={{ height: '62px' }} />
    </>
  );
}
