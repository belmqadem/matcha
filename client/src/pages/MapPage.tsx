import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrowseUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: string;
  biography: string;
  fame_rating: number;
  location_city: string;
  is_online: boolean;
  last_seen: string;
  profile_picture_id: string | null;
  birth_date: string;
  distance_km: number;
  photos: { id: string; url: string; order_index: number }[];
  tags: string[];
  liked_by_me: boolean;
  liked_me: boolean;
  is_connected: boolean;
  // lat/lng may be missing on browse users — we approximate via distance
  latitude?: number;
  longitude?: number;
}

interface BrowseResponse {
  users: BrowseUser[];
  total: number;
  page: number;
  limit: number;
}

interface MyLocation {
  latitude: number;
  longitude: number;
  location_city: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_KM_OPTIONS = [5, 10, 25, 50, 100];
const API = '/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAge(birth_date: string): number {
  const today = new Date();
  const dob = new Date(birth_date);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/** Scatter users in a small radius around the current user's position so pins don't stack. */
function scatterAround(lat: number, lng: number, distKm: number): [number, number] {
  const angle = Math.random() * 2 * Math.PI;
  // Rough km → degrees: 1° lat ≈ 111 km, 1° lng ≈ 111 * cos(lat) km
  const dLat = (distKm * Math.cos(angle)) / 111;
  const dLng = (distKm * Math.sin(angle)) / (111 * Math.cos((lat * Math.PI) / 180));
  return [lat + dLat, lng + dLng];
}

function buildAvatarHtml(user: BrowseUser): string {
  const photoUrl = user.photos?.[0]?.url;
  if (photoUrl) {
    return `<img src="${photoUrl}" alt="${user.first_name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  }
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
  return `<span style="font-family:'Fraunces',serif;font-size:14px;color:#fff;font-weight:600;">${initials}</span>`;
}

function createUserIcon(user: BrowseUser): L.DivIcon {
  const online = user.is_online;
  const connected = user.is_connected;
  const color = connected ? '#e94057' : online ? '#10b981' : '#9ca3af';
  const ring = user.liked_me ? '3px solid #e94057' : `3px solid ${color}`;

  return L.divIcon({
    className: '',
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -58],
    html: `
      <div style="
        position:relative;
        width:48px;
        display:flex;
        flex-direction:column;
        align-items:center;
      ">
        <div style="
          width:44px;height:44px;
          border-radius:50%;
          border:${ring};
          background:#e5e7eb;
          overflow:hidden;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 14px rgba(0,0,0,0.18);
          background:#fff;
        ">${buildAvatarHtml(user)}</div>
        ${online ? `<div style="
          position:absolute;top:30px;right:2px;
          width:11px;height:11px;
          border-radius:50%;
          background:#10b981;
          border:2px solid #fff;
        "></div>` : ''}
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-top:8px solid ${connected ? '#e94057' : '#fff'};
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));
          margin-top:-1px;
        "></div>
      </div>
    `,
  });
}

function createMeIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `
      <div style="
        width:20px;height:20px;border-radius:50%;
        background:#e94057;
        border:3px solid #fff;
        box-shadow:0 0 0 3px rgba(233,64,87,0.3), 0 4px 12px rgba(233,64,87,0.4);
        animation: pulse-me 2s infinite;
      "></div>
      <style>
        @keyframes pulse-me {
          0%,100% { box-shadow:0 0 0 3px rgba(233,64,87,0.3),0 4px 12px rgba(233,64,87,0.4); }
          50% { box-shadow:0 0 0 8px rgba(233,64,87,0.1),0 4px 12px rgba(233,64,87,0.4); }
        }
      </style>
    `,
  });
}

// ─── UserPopup (rendered to HTML string for Leaflet) ─────────────────────────

function popupHtml(user: BrowseUser): string {
  const age = getAge(user.birth_date);
  const photoUrl = user.photos?.[0]?.url;
  const tagsHtml = user.tags
    .slice(0, 3)
    .map(
      (t) =>
        `<span style="
        background:rgba(233,64,87,0.08);color:#e94057;
        padding:2px 8px;border-radius:99px;font-size:11px;
        font-family:'Fraunces',serif;
      ">#${t}</span>`
    )
    .join('');

  return `
    <div style="
      font-family:'Fraunces',serif;
      width:220px;
      border-radius:16px;
      overflow:hidden;
    ">
      ${
        photoUrl
          ? `<div style="height:130px;overflow:hidden;">
          <img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;" />
        </div>`
          : `<div style="
          height:100px;
          background:linear-gradient(135deg,#e94057,#f27121);
          display:flex;align-items:center;justify-content:center;
          font-size:36px;color:#fff;font-weight:700;
        ">${user.first_name[0]}${user.last_name[0]}</div>`
      }
      <div style="padding:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:15px;font-weight:700;color:#1a1a2e;">
            ${user.first_name}, ${age}
          </span>
          ${
            user.is_online
              ? `<span style="font-size:11px;color:#10b981;font-weight:600;">● Online</span>`
              : `<span style="font-size:11px;color:#9ca3af;">Offline</span>`
          }
        </div>
        <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">
          📍 ${user.distance_km < 1 ? '<1' : Math.round(user.distance_km)} km away
          ${user.location_city ? `· ${user.location_city}` : ''}
        </div>
        ${tagsHtml ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${tagsHtml}</div>` : ''}
        ${
          user.biography
            ? `<p style="font-size:12px;color:#374151;line-height:1.4;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
          ${user.biography}
        </p>`
            : ''
        }
        <button
          onclick="window.__matchaViewProfile('${user.id}')"
          style="
            width:100%;padding:8px;
            background:#e94057;color:#fff;
            border:none;border-radius:10px;
            font-family:'Fraunces',serif;font-size:13px;font-weight:600;
            cursor:pointer;
          "
        >View Profile</button>
      </div>
    </div>
  `;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const meMarkerRef = useRef<L.Marker | null>(null);

  const [myLocation, setMyLocation] = useState<MyLocation | null>(null);
  const [users, setUsers] = useState<BrowseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [locError, setLocError] = useState<string | null>(null);

  // Filters
  const [maxKm, setMaxKm] = useState(25);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  // Stats
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectedCount, setConnectedCount] = useState(0);

  // ── Register global navigate for popup buttons ────────────────────────────
  useEffect(() => {
    (window as any).__matchaViewProfile = (id: string) => navigate(`/profile/${id}`);
    return () => {
      delete (window as any).__matchaViewProfile;
    };
  }, [navigate]);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [48.8566, 2.3522], // fallback: Paris
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Fetch my location ─────────────────────────────────────────────────────
  const fetchMyLocation = useCallback(async () => {
    // 1. Try IP-based location
    try {
      const res = await fetch(`${API}/profile/me/location/ip`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMyLocation(data);
        return data;
      }
    } catch (_) {}

    // 2. Fall back to stored location on the user's profile
    try {
      const res = await fetch(`${API}/users/me`, { credentials: 'include' });
      if (res.ok) {
        const { user } = await res.json();
        if (user?.latitude && user?.longitude) {
          const loc: MyLocation = {
            latitude: user.latitude,
            longitude: user.longitude,
            location_city: user.location_city ?? '',
          };
          setMyLocation(loc);
          return loc;
        }
      }
    } catch (_) {}

    setLocError('Could not determine your location. Set your location in your profile settings.');
    return null;
  }, []);

  // ── Fetch users from browse ───────────────────────────────────────────────
  const fetchUsers = useCallback(
    async (loc: MyLocation) => {
      try {
        const params = new URLSearchParams({
          sort: 'distance',
          order: 'asc',
          max_km: String(maxKm),
          limit: '50',
        });
        const res = await fetch(`${API}/browse?${params}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data: BrowseResponse = await res.json();
        setUsers(data.users);
        setOnlineCount(data.users.filter((u) => u.is_online).length);
        setConnectedCount(data.users.filter((u) => u.is_connected).length);
        return data.users;
      } catch (_) {
        return [];
      }
    },
    [maxKm]
  );

  // ── Place markers on map ──────────────────────────────────────────────────
  const placeMarkers = useCallback(
    (usersToPlace: BrowseUser[], loc: MyLocation) => {
      const map = mapRef.current;
      if (!map) return;

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Me marker
      if (meMarkerRef.current) meMarkerRef.current.remove();
      meMarkerRef.current = L.marker([loc.latitude, loc.longitude], {
        icon: createMeIcon(),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip('You', { permanent: false, direction: 'top' });

      const filtered = usersToPlace.filter((u) => {
        if (showOnlineOnly && !u.is_online) return false;
        if (showConnectedOnly && !u.is_connected) return false;
        return true;
      });

      filtered.forEach((user) => {
        const [lat, lng] = scatterAround(loc.latitude, loc.longitude, user.distance_km);
        const marker = L.marker([lat, lng], { icon: createUserIcon(user) })
          .addTo(map)
          .bindPopup(popupHtml(user), {
            maxWidth: 240,
            className: 'matcha-popup',
          });
        markersRef.current.push(marker);
      });

      // Fit bounds
      if (filtered.length > 0) {
        const allLatLngs: L.LatLngTuple[] = [
          [loc.latitude, loc.longitude],
          ...markersRef.current.map((m) => [m.getLatLng().lat, m.getLatLng().lng] as L.LatLngTuple),
        ];
        map.fitBounds(L.latLngBounds(allLatLngs), { padding: [48, 48], maxZoom: 14 });
      } else {
        map.setView([loc.latitude, loc.longitude], 13);
      }
    },
    [showOnlineOnly, showConnectedOnly]
  );

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const loc = await fetchMyLocation();
      if (!loc || !alive) return;
      const fetchedUsers = await fetchUsers(loc);
      if (!alive) return;
      placeMarkers(fetchedUsers, loc);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [fetchMyLocation]);

  // ── Re-fetch on filter change ─────────────────────────────────────────────
  useEffect(() => {
    if (!myLocation) return;
    let alive = true;
    setLoading(true);
    (async () => {
      const fetchedUsers = await fetchUsers(myLocation);
      if (!alive) return;
      setUsers(fetchedUsers);
      setOnlineCount(fetchedUsers.filter((u) => u.is_online).length);
      setConnectedCount(fetchedUsers.filter((u) => u.is_connected).length);
      placeMarkers(fetchedUsers, myLocation);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [maxKm]);

  // ── Re-place markers when filters change (no refetch needed) ─────────────
  useEffect(() => {
    if (!myLocation || users.length === 0) return;
    placeMarkers(users, myLocation);
  }, [showOnlineOnly, showConnectedOnly, placeMarkers]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[var(--color-background)]">

      {/* ── Popup style injection ── */}
      <style>{`
        .matcha-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border: none;
        }
        .matcha-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .matcha-popup .leaflet-popup-tip-container {
          display: none;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          font-family: 'Fraunces', serif !important;
          color: #1a1a2e !important;
          background: #fff !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f7f7f7 !important;
        }
      `}</style>

      {/* ── Map container ── */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* ── Top control bar ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-4">
        {/* Radius picker */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2 border border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)] font-medium mr-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Radius
          </span>
          {MAX_KM_OPTIONS.map((km) => (
            <button
              key={km}
              onClick={() => setMaxKm(km)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-150 ${
                maxKm === km
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:bg-gray-100'
              }`}
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* ── Side filter panel ── */}
      <div className="absolute top-20 left-4 z-[999] flex flex-col gap-2">
        <button
          onClick={() => setShowOnlineOnly((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg text-sm font-semibold transition-all duration-150 border ${
            showOnlineOnly
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white/95 backdrop-blur-sm text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-gray-50'
          }`}
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          <span className="w-2 h-2 rounded-full bg-current opacity-80" />
          Online only
        </button>

        <button
          onClick={() => setShowConnectedOnly((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg text-sm font-semibold transition-all duration-150 border ${
            showConnectedOnly
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'bg-white/95 backdrop-blur-sm text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-gray-50'
          }`}
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          <span>♥</span>
          Matches only
        </button>
      </div>

      {/* ── Stats panel (bottom-left) ── */}
      <div className="absolute bottom-6 left-4 z-[999]">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-3 border border-[var(--color-border)] min-w-[160px]">
          <p
            className="text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-widest"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Nearby
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-[var(--color-text-muted)]" style={{ fontFamily: 'Fraunces, serif' }}>
                Total
              </span>
              <span className="text-sm font-bold text-[var(--color-text)]" style={{ fontFamily: 'Fraunces, serif' }}>
                {users.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-emerald-500" style={{ fontFamily: 'Fraunces, serif' }}>
                Online
              </span>
              <span className="text-sm font-bold text-emerald-500" style={{ fontFamily: 'Fraunces, serif' }}>
                {onlineCount}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-[var(--color-primary)]" style={{ fontFamily: 'Fraunces, serif' }}>
                Matched
              </span>
              <span className="text-sm font-bold text-[var(--color-primary)]" style={{ fontFamily: 'Fraunces, serif' }}>
                {connectedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="absolute bottom-6 right-16 z-[999]">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-3 border border-[var(--color-border)]">
          <p
            className="text-xs text-[var(--color-text-muted)] mb-2 uppercase tracking-widest"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Legend
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              { color: '#e94057', label: 'Matched' },
              { color: '#10b981', label: 'Online' },
              { color: '#9ca3af', label: 'Offline' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ background: color }}
                />
                <span
                  className="text-xs text-[var(--color-text-muted)]"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {label}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-[var(--color-border)]">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#e94057', boxShadow: '0 0 0 3px rgba(233,64,87,0.25)' }}
              />
              <span
                className="text-xs text-[var(--color-text-muted)]"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                You
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading overlay ── */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[var(--color-background)]/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)]/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-primary)]"
                style={{ animation: 'spin 0.9s linear infinite' }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
            <p
              className="text-sm text-[var(--color-text-muted)] italic"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Finding people near you…
            </p>
          </div>
        </div>
      )}

      {/* ── Location error ── */}
      {locError && !loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4 text-center border border-[var(--color-border)]">
            <div className="text-4xl mb-3">📍</div>
            <h2
              className="text-lg font-bold text-[var(--color-text)] mb-2"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Location unavailable
            </h2>
            <p
              className="text-sm text-[var(--color-text-muted)] mb-5"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {locError}
            </p>
            <button
              onClick={() => navigate('/profile/edit')}
              className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Update location in settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
