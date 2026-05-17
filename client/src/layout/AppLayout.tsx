import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Compass,
  Search,
  MessageCircle,
  Bell,
  Heart,
  Users,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
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
  { to: '/browse',        label: 'Browse',        Icon: Compass,       badge: undefined },
  { to: '/search',        label: 'Search',        Icon: Search,        badge: undefined },
  { to: '/chat',          label: 'Messages',      Icon: MessageCircle, badge: 'messages' as BadgeKey },
  { to: '/likes',         label: 'Likes',         Icon: Heart,         badge: undefined },
  { to: '/visitors',      label: 'Visitors',      Icon: Users,         badge: undefined },
  { to: '/notifications', label: 'Notifications', Icon: Bell,          badge: 'notifications' as BadgeKey },
  { to: '/map',           label: 'Map',           Icon: MapPin,        badge: undefined },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useIsMobile(bp = 768) {
  const [v, setV] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return v;
}

function fameLabel(rating: number) {
  if (rating >= 80) return { text: 'very high', color: '#10b981' };
  if (rating >= 60) return { text: 'high',      color: '#34d399' };
  if (rating >= 40) return { text: 'average',   color: '#f59e0b' };
  if (rating >= 20) return { text: 'low',        color: '#f97316' };
  return               { text: 'new',        color: '#94a3b8' };
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span style={{
      position: 'absolute',
      top: '-4px',
      right: '-6px',
      minWidth: '16px',
      height: '16px',
      padding: '0 3px',
      borderRadius: '999px',
      background: 'var(--color-primary)',
      color: 'white',
      fontSize: '9px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1.5px solid white',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ─── Top Navbar ───────────────────────────────────────────────────────────────

function TopNav({
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
  const isMobile = useIsMobile(768);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const font    = 'var(--font-primary)';
  const primary = 'var(--color-primary)';
  const muted   = 'var(--color-text-muted)';
  const border  = 'var(--color-border)';
  const bg      = 'var(--color-background)';

  const avatar   = me?.photos?.find((p) => p.id === me.profile_picture_id)?.url ?? null;
  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() : '?';
  const fame     = me ? fameLabel(me.fame_rating ?? 0) : null;

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (mobileRef.current  && !mobileRef.current.contains(e.target as Node))  setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); setProfileOpen(false); }, [location.pathname]);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      backgroundColor: 'white',
      borderBottom: `1px solid ${border}`,
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 20px',
        height: '58px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>

        {/* ── Logo ── */}
        <NavLink to="/browse" style={{
          fontFamily: font,
          fontSize: '22px',
          fontWeight: 800,
          fontStyle: 'italic',
          color: primary,
          textDecoration: 'none',
          letterSpacing: '-0.5px',
          marginRight: '12px',
          flexShrink: 0,
        }}>
          Matcha
        </NavLink>

        {/* ── Desktop nav links ── */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
            {MAIN_NAV.map(({ to, label, Icon, badge }) => {
              const active = isActive(to);
              const count  = getBadge(badge as BadgeKey | undefined);
              return (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    fontFamily: font,
                    color: active ? primary : muted,
                    backgroundColor: active ? 'rgba(233,64,87,0.08)' : 'transparent',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
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
                  <span style={{ position: 'relative', display: 'flex' }}>
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                    <Badge count={count} />
                  </span>
                  {label}
                  {/* Active underline */}
                  {active && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: '12px',
                      right: '12px',
                      height: '2px',
                      borderRadius: '2px 2px 0 0',
                      backgroundColor: primary,
                    }} />
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* ── Spacer (mobile) ── */}
        {isMobile && <div style={{ flex: 1 }} />}

        {/* ── Profile dropdown (desktop) ── */}
        {!isMobile && me && (
          <div ref={profileRef} style={{ position: 'relative', marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 10px 5px 5px',
                borderRadius: '999px',
                border: `1px solid ${border}`,
                background: profileOpen ? bg : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                border: `2px solid ${primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {avatar
                  ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: font, fontSize: '11px', fontWeight: 700, color: primary }}>{initials}</span>
                }
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: font, fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                  {me.first_name}
                </div>
                {fame && (
                  <div style={{ fontFamily: font, fontSize: '10px', color: fame.color, fontWeight: 600 }}>
                    {fame.text}
                  </div>
                )}
              </div>
              <ChevronDown
                size={14}
                style={{
                  color: muted,
                  transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '200px',
                backgroundColor: 'white',
                border: `1px solid ${border}`,
                borderRadius: '14px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                padding: '6px',
              }}>
                <NavLink
                  to="/profile/me"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: font,
                    color: isActive('/profile/me') ? primary : 'var(--color-text)',
                    backgroundColor: isActive('/profile/me') ? 'rgba(233,64,87,0.06)' : 'transparent',
                  }}
                >
                  <User size={15} />
                  My Profile
                </NavLink>
                <div style={{ height: '1px', backgroundColor: border, margin: '4px 0' }} />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: font,
                    color: primary,
                    background: 'none',
                    border: 'none',
                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                    opacity: loggingOut ? 0.5 : 1,
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={15} />
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Mobile: unread pill + hamburger ── */}
        {isMobile && (
          <>
            {(counts.unread_messages + counts.unread_notifications) > 0 && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(233,64,87,0.1)',
                color: primary,
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: font,
              }}>
                {counts.unread_messages + counts.unread_notifications}
              </span>
            )}
            <div ref={mobileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: `1px solid ${border}`,
                  background: mobileMenuOpen ? bg : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: muted,
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Mobile dropdown */}
              {mobileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '230px',
                  backgroundColor: 'white',
                  border: `1px solid ${border}`,
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  padding: '8px',
                }}>
                  {/* Profile row */}
                  {me && (
                    <>
                      <NavLink
                        to="/profile/me"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          overflow: 'hidden', backgroundColor: '#f1f5f9',
                          border: `2px solid ${primary}`, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {avatar
                            ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 700, color: primary }}>{initials}</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontFamily: font, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {me.first_name} {me.last_name}
                          </div>
                          {fame && (
                            <div style={{ fontFamily: font, fontSize: '11px', color: fame.color, fontWeight: 600 }}>
                              {fame.text}
                            </div>
                          )}
                        </div>
                      </NavLink>
                      <div style={{ height: '1px', backgroundColor: border, margin: '4px 0' }} />
                    </>
                  )}

                  {/* Nav links */}
                  {MAIN_NAV.map(({ to, label, Icon, badge }) => {
                    const active = isActive(to);
                    const count  = getBadge(badge as BadgeKey | undefined);
                    return (
                      <NavLink
                        key={to}
                        to={to}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: active ? 700 : 500,
                          fontFamily: font,
                          color: active ? primary : 'var(--color-text)',
                          backgroundColor: active ? 'rgba(233,64,87,0.06)' : 'transparent',
                        }}
                      >
                        <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                        <span style={{ flex: 1 }}>{label}</span>
                        {count > 0 && (
                          <span style={{
                            minWidth: '18px', height: '18px', padding: '0 4px',
                            borderRadius: '999px', background: primary, color: 'white',
                            fontSize: '10px', fontWeight: 700, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}

                  <div style={{ height: '1px', backgroundColor: border, margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px', fontSize: '14px',
                      fontWeight: 500, fontFamily: font, color: primary,
                      background: 'none', border: 'none', cursor: 'pointer',
                      opacity: loggingOut ? 0.5 : 1, textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} />
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<NotifCounts>({ unread_messages: 0, unread_notifications: 0 });
  const [me, setMe] = useState<Me | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchMe().then(setMe);
    fetchCounts().then(setCounts);
    const id = setInterval(() => fetchCounts().then(setCounts), 8000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await doLogout(); } catch { /* ignore */ }
    navigate('/login');
  };

  const getBadge = (key?: BadgeKey) => {
    if (key === 'messages')     return counts.unread_messages;
    if (key === 'notifications') return counts.unread_notifications;
    return 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <TopNav
        me={me}
        counts={counts}
        getBadge={getBadge}
        handleLogout={handleLogout}
        loggingOut={loggingOut}
      />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
