import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Compass,
  Search,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Heart,
  Users,
  MapPin,
  Menu,
  X,
  Settings,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotifCounts {
  unread_messages: number;
  unread_notifications: number;
}

interface Me {
  first_name: string;
  last_name: string;
  username: string;
  fame_rating: number;
  profile_picture_id: number | null;
  photos: { id: number; url: string }[];
}

type BadgeKey = 'messages' | 'notifications';

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchCounts = (): Promise<NotifCounts> =>
  Promise.all([
    fetch('/api/chat/unread/count', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.unread ?? 0)
      .catch(() => 0),
    fetch('/api/notifications/unread/count', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.unread ?? 0)
      .catch(() => 0),
  ]).then(([unread_messages, unread_notifications]) => ({ unread_messages, unread_notifications }));

const fetchMe = (): Promise<Me | null> =>
  fetch('/api/users/me', { credentials: 'include' })
    .then((r) => r.json())
    .then((d) => d.user ?? null)
    .catch(() => null);

const doLogout = () => fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

// ─── Nav config ───────────────────────────────────────────────────────────────

const MAIN_NAV = [
  { to: '/browse', label: 'Browse', Icon: Compass, badge: undefined },
  { to: '/search', label: 'Search', Icon: Search, badge: undefined },
  { to: '/chat', label: 'Messages', Icon: MessageCircle, badge: 'messages' as BadgeKey },
  { to: '/likes', label: 'Likes', Icon: Heart, badge: undefined },
  { to: '/visitors', label: 'Visitors', Icon: Users, badge: undefined },
  { to: '/notifications', label: 'Notifications', Icon: Bell, badge: 'notifications' as BadgeKey },
  { to: '/map', label: 'Map', Icon: MapPin, badge: undefined },
];

const BOTTOM_NAV = [{ to: '/profile/me', label: 'Profile', Icon: User }];

// Mobile bottom bar (5 items)
const MOBILE_TABS = [MAIN_NAV[0], MAIN_NAV[2], MAIN_NAV[3], MAIN_NAV[5], BOTTOM_NAV[0]];

// ─── useIsMobile ──────────────────────────────────────────────────────────────

function useIsMobile(bp = 900) {
  const [v, setV] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return v;
}

// ─── Badge dot ────────────────────────────────────────────────────────────────

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        minWidth: '18px',
        height: '18px',
        padding: '0 4px',
        borderRadius: '999px',
        background: 'var(--color-primary)',
        color: 'white',
        fontSize: '10px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
        flexShrink: 0,
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function DotBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        position: 'absolute',
        top: '2px',
        right: '2px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--color-primary)',
        border: '1.5px solid white',
      }}
    />
  );
}

// ─── Fame label ───────────────────────────────────────────────────────────────

function fameLabel(rating: number) {
  if (rating >= 80) return { text: 'very high', color: '#10b981' };
  if (rating >= 60) return { text: 'high', color: '#34d399' };
  if (rating >= 40) return { text: 'average', color: '#f59e0b' };
  if (rating >= 20) return { text: 'low', color: '#f97316' };
  return { text: 'new', color: '#94a3b8' };
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  me,
  counts,
  getBadge,
  handleLogout,
  loggingOut,
}: {
  me: Me | null;
  counts: NotifCounts;
  getBadge: (k?: BadgeKey) => number;
  handleLogout: () => void;
  loggingOut: boolean;
}) {
  const location = useLocation();
  const fame = me ? fameLabel(me.fame_rating ?? 0) : null;
  const avatar = me?.photos?.find((p) => p.id === me.profile_picture_id)?.url ?? null;
  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() : '?';
  const font = 'var(--font-primary)';
  const primary = 'var(--color-primary)';
  const muted = 'var(--color-text-muted)';
  const border = 'var(--color-border)';
  const bg = 'var(--color-background)';

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRight: `1px solid ${border}`,
        padding: '24px 12px 16px',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <NavLink
        to="/browse"
        style={{
          fontFamily: font,
          fontSize: '26px',
          fontWeight: 800,
          fontStyle: 'italic',
          color: primary,
          textDecoration: 'none',
          letterSpacing: '-0.5px',
          display: 'block',
          marginBottom: '24px',
          paddingLeft: '8px',
        }}
      >
        Matcha
      </NavLink>

      {/* Profile card */}
      {me && (
        <NavLink
          to="/profile/me"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            borderRadius: '16px',
            backgroundColor: bg,
            textDecoration: 'none',
            marginBottom: '20px',
            border: `1px solid ${border}`,
            transition: 'box-shadow 0.2s',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9',
              border: `3px solid ${primary}`,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontFamily: font, fontSize: '18px', fontWeight: 700, color: primary }}>
                {initials}
              </span>
            )}
          </div>
          {/* Name */}
          <span
            style={{
              fontFamily: font,
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '2px',
            }}
          >
            {me.first_name} {me.last_name}
          </span>
          {/* Fame */}
          {fame && (
            <span style={{ fontFamily: font, fontSize: '11px', color: muted }}>
              Popularity: <span style={{ color: fame.color, fontWeight: 700 }}>{fame.text}</span>
            </span>
          )}
        </NavLink>
      )}

      {/* Main nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
        {MAIN_NAV.map(({ to, label, Icon, badge }) => {
          const active = isActive(to);
          const count = getBadge(badge as BadgeKey | undefined);
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: active ? 700 : 500,
                fontFamily: font,
                textDecoration: 'none',
                color: active ? primary : muted,
                backgroundColor: active ? 'rgba(233,64,87,0.08)' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = bg;
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = muted;
                }
              }}
            >
              {/* Active indicator bar */}
              <span
                style={{
                  width: '3px',
                  height: '18px',
                  borderRadius: '2px',
                  flexShrink: 0,
                  backgroundColor: active ? primary : 'transparent',
                  transition: 'background 0.15s',
                }}
              />
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ flex: 1 }}>{label}</span>
              <Badge count={count} />
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          borderTop: `1px solid ${border}`,
          paddingTop: '12px',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <NavLink
          to="/profile/me"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: font,
            textDecoration: 'none',
            color: isActive('/profile/me') ? primary : muted,
            backgroundColor: isActive('/profile/me') ? 'rgba(233,64,87,0.08)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          <span
            style={{
              width: '3px',
              height: '18px',
              borderRadius: '2px',
              flexShrink: 0,
              backgroundColor: isActive('/profile/me') ? primary : 'transparent',
            }}
          />
          <User size={16} strokeWidth={1.8} />
          <span style={{ flex: 1 }}>Profile</span>
        </NavLink>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: font,
            color: muted,
            background: 'none',
            border: 'none',
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            opacity: loggingOut ? 0.5 : 1,
            transition: 'all 0.15s',
            textAlign: 'left',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = primary;
            e.currentTarget.style.backgroundColor = 'rgba(233,64,87,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = muted;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ width: '3px', height: '18px', flexShrink: 0 }} />
          <LogOut size={16} strokeWidth={1.8} />
          <span>{loggingOut ? 'Signing out…' : 'Sign out'}</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile header + bottom nav ───────────────────────────────────────────────

function MobileLayout({
  me,
  counts,
  getBadge,
  handleLogout,
  loggingOut,
}: {
  me: Me | null;
  counts: NotifCounts;
  getBadge: (k?: BadgeKey) => number;
  handleLogout: () => void;
  loggingOut: boolean;
}) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const font = 'var(--font-primary)';
  const primary = 'var(--color-primary)';
  const muted = 'var(--color-text-muted)';
  const border = 'var(--color-border)';
  const bg = 'var(--color-background)';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const avatar = me?.photos?.find((p) => p.id === me.profile_picture_id)?.url ?? null;
  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() : '?';
  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');
  const totalUnread = counts.unread_messages + counts.unread_notifications;

  return (
    <>
      {/* Top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          backgroundColor: 'white',
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          height: '52px',
          padding: '0 16px',
          gap: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Avatar */}
        <NavLink
          to="/profile/me"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#f1f5f9',
            border: `2px solid ${primary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            textDecoration: 'none',
            position: 'relative',
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontFamily: font, fontSize: '12px', fontWeight: 700, color: primary }}>
              {initials}
            </span>
          )}
        </NavLink>

        {/* Logo */}
        <NavLink
          to="/browse"
          style={{
            fontFamily: font,
            fontSize: '20px',
            fontWeight: 800,
            fontStyle: 'italic',
            color: primary,
            textDecoration: 'none',
            letterSpacing: '-0.3px',
            flex: 1,
          }}
        >
          Matcha
        </NavLink>

        {/* Unread dot */}
        {totalUnread > 0 && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(233,64,87,0.1)',
              color: primary,
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: font,
            }}
          >
            {totalUnread}
          </span>
        )}

        {/* Hamburger */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: menuOpen ? bg : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: muted,
            }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '220px',
                backgroundColor: 'white',
                border: `1px solid ${border}`,
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                padding: '8px 0',
                zIndex: 100,
              }}
            >
              {[
                ...MAIN_NAV,
                { to: '/profile/me', label: 'Profile', Icon: User, badge: undefined },
              ].map(({ to, label, Icon, badge }) => {
                const active = isActive(to);
                const count = getBadge(badge as BadgeKey | undefined);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 16px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: active ? 700 : 500,
                      fontFamily: font,
                      color: active ? primary : 'var(--color-text)',
                      backgroundColor: active ? 'rgba(233,64,87,0.06)' : 'transparent',
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {count > 0 && (
                      <span
                        style={{
                          minWidth: '18px',
                          height: '18px',
                          padding: '0 4px',
                          borderRadius: '999px',
                          background: primary,
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
              <div style={{ borderTop: `1px solid ${border}`, margin: '6px 0' }} />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: font,
                  color: primary,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: loggingOut ? 0.5 : 1,
                }}
              >
                <LogOut size={17} />
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'white',
          borderTop: `1px solid ${border}`,
          display: 'flex',
          height: '62px',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {MOBILE_TABS.map(({ to, label, Icon, badge }) => {
          const active = isActive(to);
          const count = getBadge(badge as BadgeKey | undefined);
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                textDecoration: 'none',
                color: active ? primary : muted,
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                fontFamily: font,
                position: 'relative',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ position: 'relative', display: 'flex' }}>
                <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
                <DotBadge count={count} />
              </span>
              {label === 'Notifications' ? 'Notifs' : label}
              {/* Active underline dot */}
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: primary,
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom spacer */}
      <div style={{ height: '62px' }} />
    </>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const [counts, setCounts] = useState<NotifCounts>({
    unread_messages: 0,
    unread_notifications: 0,
  });
  const [me, setMe] = useState<Me | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('matcha_sidebar_visible') === 'true';
  });

  useEffect(() => {
    fetchMe().then(setMe);
    fetchCounts().then(setCounts);
    const id = setInterval(() => fetchCounts().then(setCounts), 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('matcha_sidebar_visible', sidebarVisible ? 'true' : 'false');
    }
  }, [sidebarVisible]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await doLogout();
    } catch {
      /* ignore */
    }
    navigate('/login');
  };

  const getBadge = (key?: BadgeKey) => {
    if (key === 'messages') return counts.unread_messages;
    if (key === 'notifications') return counts.unread_notifications;
    return 0;
  };

  const sharedProps = { me, counts, getBadge, handleLogout, loggingOut };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Desktop sidebar area */}
      {!isMobile && (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <div
            style={{
              width: '60px',
              minWidth: '60px',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '16px',
              backgroundColor: 'white',
              borderRight: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={() => setSidebarVisible((v) => !v)}
              title={sidebarVisible ? 'Hide sidebar' : 'Open sidebar'}
              aria-label={sidebarVisible ? 'Hide sidebar' : 'Open sidebar'}
              style={{
                width: '42px',
                height: '42px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '14px',
                border: '1px solid var(--color-border)',
                background: sidebarVisible ? 'rgba(233,64,87,0.08)' : 'white',
                color: sidebarVisible ? 'var(--color-primary)' : 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              {sidebarVisible ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {sidebarVisible && <Sidebar {...sharedProps} />}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile header */}
        {isMobile && <MobileLayout {...sharedProps} />}

        {/* Page content */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
