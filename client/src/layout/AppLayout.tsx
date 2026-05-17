import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Compass,
  MessageCircle,
  Bell,
  Heart,
  Users,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
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
  fetch('/api/chat/unread/count', { credentials: 'include' })
    .then((r) => r.ok ? r.json() : { unread: 0 })
    .then((d) => ({ unread_messages: d.unread ?? 0, unread_notifications: 0 }))
    .catch(() => ({ unread_messages: 0, unread_notifications: 0 }));

const fetchMe = (): Promise<Me | null> =>
  fetch('/api/users/me', { credentials: 'include' })
    .then((r) => r.json()).then((d) => d.user ?? null).catch(() => null);

const doLogout = () =>
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

// ─── Nav links ────────────────────────────────────────────────────────────────

const MAIN_NAV = [
  { to: '/browse',   label: 'Browse',   Icon: Compass,       badge: undefined },
  { to: '/chat',     label: 'Messages', Icon: MessageCircle, badge: 'messages' as BadgeKey },
  { to: '/likes',    label: 'Likes',    Icon: Heart,         badge: undefined },
  { to: '/visitors', label: 'Visitors', Icon: Users,         badge: undefined },
  { to: '/map',      label: 'Map',      Icon: MapPin,        badge: undefined },
];

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

// ─── TopNav ───────────────────────────────────────────────────────────────────

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
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(900);

  const [profileOpen,    setProfileOpen]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal,      setSearchVal]      = useState('');
  const [searchFocused,  setSearchFocused]  = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileRef  = useRef<HTMLDivElement>(null);

  const avatar   = me?.photos?.find((p) => p.id === me.profile_picture_id)?.url ?? null;
  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() : '?';
  const notifCount  = getBadge('notifications');
  const totalUnread = counts.unread_messages + counts.unread_notifications;

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (mobileRef.current  && !mobileRef.current.contains(e.target as Node))  setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchVal.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate('/search');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr 180px',
        alignItems: 'center',
        height: '64px',
        padding: '0 24px',
        gap: '8px',
      }}>

        {/* ── LEFT: Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NavLink to="/browse" style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '28px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#e94057',
            textDecoration: 'none',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            Matcha
          </NavLink>
        </div>

        {/* ── CENTER: Nav links + Search ── */}
        {!isMobile ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
          }}>
            {MAIN_NAV.map(({ to, label, Icon, badge }) => {
              const active = isActive(to);
              const count  = getBadge(badge);
              return (
                <NavLink key={to} to={to} style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#e94057' : '#999',
                  background: active ? 'rgba(233,64,87,0.08)' : 'transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, background 0.15s',
                }}>
                  <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Icon size={15} strokeWidth={active ? 2.2 : 1.6} />
                    {count > 0 && (
                      <span style={{
                        position: 'absolute', top: '-5px', right: '-6px',
                        minWidth: '14px', height: '14px', padding: '0 3px',
                        borderRadius: '999px', background: '#e94057', color: '#fff',
                        fontSize: '8px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1.5px solid #fff',
                      }}>
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </span>
                  {label}
                </NavLink>
              );
            })}

            {/* ── Search ── */}
            <form onSubmit={handleSearch} style={{ marginLeft: '8px', flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 16px',
                height: '38px',
                borderRadius: '999px',
                border: `1.5px solid ${searchFocused ? '#e94057' : '#f0e8ea'}`,
                background: searchFocused ? '#fff' : '#fff6f7',
                boxShadow: searchFocused ? '0 0 0 3px rgba(233,64,87,0.10)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                cursor: 'text',
              }}>
                <Search size={14} style={{ color: '#e94057', flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search people…"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13.5px',
                    color: '#555',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </form>
          </div>
        ) : (
          <div />
        )}

        {/* ── RIGHT: Bell + Avatar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>

          {!isMobile && (
            <>
              {/* Bell */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <NavLink to="/notifications" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #f0f0f0',
                  background: '#fff',
                  color: notifCount > 0 ? '#e94057' : '#bbb',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}>
                  <Bell size={17} strokeWidth={1.8} />
                </NavLink>
                {notifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '0px', right: '0px',
                    minWidth: '14px', height: '14px', padding: '0 3px',
                    borderRadius: '999px', background: '#e94057', color: '#fff',
                    fontSize: '8px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #fff',
                  }}>
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </div>

              {/* Profile pill */}
              {me && (
                <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={() => setProfileOpen((o) => !o)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px 4px 4px',
                    borderRadius: '999px',
                    border: '1px solid #eee',
                    background: profileOpen ? '#fafafa' : '#fff',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        overflow: 'hidden', background: '#ffe4e8',
                        border: '2px solid #e94057',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {avatar
                          ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '12px', fontWeight: 700, color: '#e94057' }}>{initials}</span>
                        }
                      </div>
                      {totalUnread > 0 && (
                        <span style={{
                          position: 'absolute', top: '-2px', right: '-2px',
                          minWidth: '13px', height: '13px', padding: '0 2px',
                          borderRadius: '999px', background: '#e94057', color: '#fff',
                          fontSize: '7px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1.5px solid #fff',
                        }}>
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#333' }}>
                      {me.first_name}
                    </span>
                    <ChevronDown size={13} style={{
                      color: '#bbb',
                      transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      width: '210px', background: '#fff',
                      border: '1.5px solid #f0f0f0', borderRadius: '18px',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.10)', padding: '8px',
                    }}>
                      <div style={{ padding: '10px 12px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '50%',
                          overflow: 'hidden', background: '#ffe4e8',
                          border: '2px solid #e94057', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {avatar
                            ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '13px', fontWeight: 700, color: '#e94057' }}>{initials}</span>
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {me.first_name} {me.last_name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#bbb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            @{me.username}
                          </div>
                        </div>
                      </div>
                      <div style={{ height: '1px', background: '#f5f5f5', margin: '0 6px 6px' }} />
                      <NavLink to="/profile/me" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '10px', textDecoration: 'none',
                        fontSize: '13px', fontWeight: 500,
                        color: isActive('/profile/me') ? '#e94057' : '#444',
                        background: isActive('/profile/me') ? 'rgba(233,64,87,0.06)' : 'transparent',
                      }}>
                        <User size={14} /> My Profile
                      </NavLink>
                      <div style={{ height: '1px', background: '#f5f5f5', margin: '6px' }} />
                      <button onClick={handleLogout} disabled={loggingOut} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '10px', fontSize: '13px',
                        fontWeight: 500, color: '#e94057', background: 'none',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        opacity: loggingOut ? 0.5 : 1,
                      }}>
                        <LogOut size={14} />
                        {loggingOut ? 'Signing out…' : 'Sign out'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Mobile hamburger ── */}
          {isMobile && (
            <div ref={mobileRef} style={{ position: 'relative' }}>
              <button onClick={() => setMobileMenuOpen((o) => !o)} style={{
                width: '42px', height: '42px', borderRadius: '12px',
                border: '1.5px solid #eee', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#888',
              }}>
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {mobileMenuOpen && (
                <div style={{
                  position: 'absolute', top: '50px', right: 0, width: '240px',
                  background: '#fff', border: '1.5px solid #f0f0f0',
                  borderRadius: '18px', boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
                  padding: '8px',
                }}>
                  {me && (
                    <>
                      <NavLink to="/profile/me" style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '12px', textDecoration: 'none', marginBottom: '4px',
                      }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          overflow: 'hidden', background: '#ffe4e8',
                          border: '2px solid #e94057', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {avatar
                            ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '14px', fontWeight: 700, color: '#e94057' }}>{initials}</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#222' }}>{me.first_name} {me.last_name}</div>
                          <div style={{ fontSize: '11px', color: '#bbb' }}>@{me.username}</div>
                        </div>
                      </NavLink>
                      <div style={{ height: '1px', background: '#f5f5f5', margin: '4px 6px' }} />
                    </>
                  )}

                  {/* Mobile search */}
                  <form onSubmit={handleSearch} style={{ padding: '6px 12px 10px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '0 14px', height: '38px', borderRadius: '999px',
                      border: '1.5px solid #f0e8ea', background: '#fff6f7',
                    }}>
                      <Search size={14} style={{ color: '#e94057', flexShrink: 0 }} />
                      <input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        placeholder="Search people…"
                        style={{
                          border: 'none', background: 'transparent', outline: 'none',
                          fontSize: '13.5px', color: '#555', flex: 1, fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </form>

                  <div style={{ height: '1px', background: '#f5f5f5', margin: '0 6px 4px' }} />

                  {MAIN_NAV.map(({ to, label, Icon, badge }) => {
                    const active = isActive(to);
                    const count  = getBadge(badge);
                    return (
                      <NavLink key={to} to={to} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '12px', textDecoration: 'none',
                        fontSize: '14px', fontWeight: active ? 600 : 400,
                        color: active ? '#e94057' : '#444',
                        background: active ? 'rgba(233,64,87,0.06)' : 'transparent',
                      }}>
                        <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
                        <span style={{ flex: 1 }}>{label}</span>
                        {count > 0 && (
                          <span style={{
                            minWidth: '18px', height: '18px', padding: '0 4px',
                            borderRadius: '999px', background: '#e94057', color: '#fff',
                            fontSize: '10px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {count > 99 ? '99+' : count}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}

                  <NavLink to="/notifications" style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '12px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: isActive('/notifications') ? 600 : 400,
                    color: isActive('/notifications') ? '#e94057' : '#444',
                    background: isActive('/notifications') ? 'rgba(233,64,87,0.06)' : 'transparent',
                  }}>
                    <Bell size={16} strokeWidth={1.8} />
                    <span style={{ flex: 1 }}>Notifications</span>
                    {notifCount > 0 && (
                      <span style={{
                        minWidth: '18px', height: '18px', padding: '0 4px',
                        borderRadius: '999px', background: '#e94057', color: '#fff',
                        fontSize: '10px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {notifCount > 99 ? '99+' : notifCount}
                      </span>
                    )}
                  </NavLink>

                  <div style={{ height: '1px', background: '#f5f5f5', margin: '4px 6px' }} />
                  <button onClick={handleLogout} disabled={loggingOut} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '12px', fontSize: '14px',
                    fontWeight: 500, color: '#e94057', background: 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    opacity: loggingOut ? 0.5 : 1,
                  }}>
                    <LogOut size={16} />
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export default function AppLayout() {
  const navigate = useNavigate();
  const [counts, setCounts]         = useState<NotifCounts>({ unread_messages: 0, unread_notifications: 0 });
  const [me, setMe]                 = useState<Me | null>(null);
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
    if (key === 'messages')      return counts.unread_messages;
    if (key === 'notifications') return counts.unread_notifications;
    return 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9f9f9' }}>
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
