import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id: number | null;
  profile_picture_url: string | null;
  fame_rating: string;
  is_online: boolean;
  lat: number;
  lng: number;
  location_city: string;
  distance_km: number;
  tags: string[];
}

interface MapResponse {
  users: MapUser[];
  total: number;
  radius_km: number;
  center: { lat: number; lng: number };
}

interface MyLocation {
  latitude: number;
  longitude: number;
  location_city: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

const AVATAR_COLORS = [
  "#e94057","#f5a623","#4a90e2","#7ed321",
  "#9013fe","#50e3c2","#d0021b","#bd10e0",
];
function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function makeUserIcon(user: MapUser): L.DivIcon {
  const color = avatarColor(user.id);
  const initials = getInitials(user.first_name, user.last_name);
  const inner = user.profile_picture_url && user.profile_picture_id && user.profile_picture_id > 0
    ? `<img src="${user.profile_picture_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:13px;font-weight:700;color:#fff;font-family:'Fraunces',serif;">${initials}</span>`;
  const onlineDot = user.is_online
    ? `<div style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid #fff;"></div>`
    : "";
  return L.divIcon({
    html: `<div style="width:40px;height:40px;border-radius:50%;background:${color};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);position:relative;cursor:pointer;overflow:hidden;">${inner}${onlineDot}</div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

function makeMeIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:46px;height:46px;border-radius:50%;background:#e94057;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 14px rgba(233,64,87,0.45);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    className: "",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const meMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const radiusCircleRef = useRef<L.Circle | null>(null);

  const [users, setUsers] = useState<MapUser[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "online">("all");
  const [likeStates, setLikeStates] = useState<Record<string, boolean>>({});

  // ── Init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [48.8566, 2.3522],
      zoom: 12,
      zoomControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Fetch map data ───────────────────────────────────────────────────────────
  const fetchMapData = useCallback(async (km = radiusKm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/browse/map?max_km=${km}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load map");
      }
      const data: MapResponse = await res.json();
      setUsers(data.users);
      setCenter(data.center);
      setRadiusKm(data.radius_km);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [radiusKm]);

  useEffect(() => { fetchMapData(); }, []);

  // ── GPS update location ──────────────────────────────────────────────────────
  const handleGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch("/api/profile/me/location/gps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
          });
          if (!res.ok) throw new Error("Failed to update location");
          await fetchMapData(radiusKm);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "GPS error");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => { setError(err.message); setGpsLoading(false); },
      { enableHighAccuracy: true }
    );
  };

  // ── Update "me" marker + radius circle ───────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !center) return;
    const map = mapRef.current;

    if (meMarkerRef.current) {
      meMarkerRef.current.setLatLng([center.lat, center.lng]);
    } else {
      meMarkerRef.current = L.marker([center.lat, center.lng], { icon: makeMeIcon(), zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip("You", { direction: "top", offset: [0, -10] });
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([center.lat, center.lng]);
      radiusCircleRef.current.setRadius(radiusKm * 1000);
    } else {
      radiusCircleRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: "#e94057",
        fillColor: "#e94057",
        fillOpacity: 0.04,
        weight: 1,
        dashArray: "6 4",
      }).addTo(map);
    }

    map.setView([center.lat, center.lng], 12, { animate: true });
  }, [center, radiusKm]);

  // ── Update user markers ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const existing = markersRef.current;

    // Remove stale markers
    existing.forEach((marker, id) => {
      if (!users.find(u => u.id === id)) {
        marker.remove();
        existing.delete(id);
      }
    });

    users.forEach(user => {
      if (existing.has(user.id)) {
        existing.get(user.id)!.setIcon(makeUserIcon(user));
      } else {
        const marker = L.marker([user.lat, user.lng], { icon: makeUserIcon(user) })
          .addTo(map)
          .on("click", () => setSelectedUser(user));
        existing.set(user.id, marker);
      }
    });
  }, [users]);

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filtered = filter === "online" ? users.filter(u => u.is_online) : users;

  // ── Like (optimistic) ────────────────────────────────────────────────────────
  const handleLike = async (userId: string) => {
    const already = likeStates[userId] ?? false;
    setLikeStates(prev => ({ ...prev, [userId]: !already }));
    try {
      if (already) {
        await fetch(`/api/likes/${userId}`, { method: "DELETE" });
      } else {
        const res = await fetch(`/api/likes/${userId}`, { method: "POST" });
        if (!res.ok && res.status !== 409) throw new Error();
      }
    } catch {
      setLikeStates(prev => ({ ...prev, [userId]: already })); // rollback
    }
  };

  // ── Radius change ────────────────────────────────────────────────────────────
  const handleRadiusChange = (km: number) => {
    setRadiusKm(km);
    fetchMapData(km);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--color-background)", fontFamily: "var(--font-primary)" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#fff", borderBottom: "1px solid var(--color-border)", flexShrink: 0, gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--color-primary)", fontSize: "20px" }}>♥</span>
          <h1 style={{ fontFamily: "var(--font-primary)", fontSize: "18px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
            Map
          </h1>
          {!loading && (
            <span style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "999px", background: "#fce8eb", color: "var(--color-primary)" }}>
              {users.length} nearby
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Radius selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Radius</span>
            {[10, 25, 50, 100].map(km => (
              <button
                key={km}
                onClick={() => handleRadiusChange(km)}
                style={{
                  padding: "3px 10px", borderRadius: "999px", fontSize: "12px", cursor: "pointer",
                  background: radiusKm === km ? "var(--color-primary)" : "transparent",
                  color: radiusKm === km ? "#fff" : "var(--color-text-muted)",
                  border: `1px solid ${radiusKm === km ? "var(--color-primary)" : "var(--color-border)"}`,
                  fontFamily: "var(--font-primary)",
                }}
              >
                {km}km
              </button>
            ))}
          </div>

          {/* Filter */}
          {(["all", "online"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "3px 12px", borderRadius: "999px", fontSize: "12px", cursor: "pointer",
              background: filter === f ? "#1a1a2e" : "transparent",
              color: filter === f ? "#fff" : "var(--color-text-muted)",
              border: `1px solid ${filter === f ? "#1a1a2e" : "var(--color-border)"}`,
              fontFamily: "var(--font-primary)",
            }}>
              {f === "all" ? "All" : "🟢 Online"}
            </button>
          ))}

          {/* GPS */}
          <button
            onClick={handleGps}
            disabled={gpsLoading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "5px 14px", borderRadius: "8px", fontSize: "12px", cursor: "pointer",
              background: "var(--color-primary)", color: "#fff", border: "none",
              fontFamily: "var(--font-primary)", opacity: gpsLoading ? 0.7 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {gpsLoading ? "Locating…" : "Use GPS"}
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div style={{ margin: "8px 16px", padding: "8px 14px", borderRadius: "8px", background: "#fce8eb", color: "var(--color-error)", fontSize: "13px", border: "1px solid #f5c0c8" }}>
          {error}
        </div>
      )}

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Map */}
        <div ref={mapContainerRef} style={{ flex: 1, height: "100%" }} />

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(247,247,247,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--color-primary)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)", fontFamily: "var(--font-primary)" }}>Loading map…</span>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside style={{ width: "280px", background: "#fff", borderLeft: "1px solid var(--color-border)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-border)", fontSize: "11px", color: "var(--color-text-muted)" }}>
            {filtered.length} {filter === "online" ? "online" : "people"} within {radiusKm}km
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 && !loading && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
                No {filter === "online" ? "online " : ""}users nearby
              </div>
            )}

            {filtered.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  if (mapRef.current) mapRef.current.setView([user.lat, user.lng], 14, { animate: true });
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "10px 16px", textAlign: "left",
                  background: selectedUser?.id === user.id ? "#fce8eb" : "transparent",
                  border: "none", borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer", fontFamily: "var(--font-primary)",
                  transition: "background 0.15s",
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%",
                    background: avatarColor(user.id),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "#fff", overflow: "hidden",
                  }}>
                    {user.profile_picture_url && user.profile_picture_id && user.profile_picture_id > 0
                      ? <img src={user.profile_picture_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      : getInitials(user.first_name, user.last_name)
                    }
                  </div>
                  {user.is_online && (
                    <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "9px", height: "9px", borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.first_name} {user.last_name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px", display: "flex", gap: "6px" }}>
                    <span>{fmtDist(user.distance_km)}</span>
                    <span>·</span>
                    <span>★ {parseFloat(user.fame_rating).toFixed(0)}</span>
                    {user.location_city && <><span>·</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.location_city}</span></>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Selected user popup card */}
        {selectedUser && (
          <div style={{
            position: "absolute", bottom: "24px", left: "24px", zIndex: 1000,
            background: "#fff", border: "1px solid var(--color-border)",
            borderRadius: "16px", padding: "16px", width: "300px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", fontFamily: "var(--font-primary)",
          }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: avatarColor(selectedUser.id),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: 700, color: "#fff", overflow: "hidden",
                }}>
                  {selectedUser.profile_picture_url && selectedUser.profile_picture_id && selectedUser.profile_picture_id > 0
                    ? <img src={selectedUser.profile_picture_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : getInitials(selectedUser.first_name, selectedUser.last_name)
                  }
                </div>
                {selectedUser.is_online && (
                  <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "12px", height: "12px", borderRadius: "50%", background: "#22c55e", border: "2px solid #fff" }} />
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text)" }}>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </span>
                  <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", fontSize: "18px", color: "var(--color-text-muted)", cursor: "pointer", lineHeight: 1, padding: "0 0 0 4px" }}>×</button>
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  @{selectedUser.username} · {selectedUser.location_city}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  {fmtDist(selectedUser.distance_km)} away · ★ {parseFloat(selectedUser.fame_rating).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Tags */}
            {selectedUser.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "10px" }}>
                {selectedUser.tags.slice(0, 5).map(tag => (
                  <span key={tag} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "999px", background: "#fce8eb", color: "var(--color-primary)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                onClick={() => handleLike(selectedUser.id)}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px", cursor: "pointer",
                  background: likeStates[selectedUser.id] ? "var(--color-primary)" : "transparent",
                  color: likeStates[selectedUser.id] ? "#fff" : "var(--color-primary)",
                  border: "1px solid var(--color-primary)",
                  fontFamily: "var(--font-primary)",
                }}
              >
                {likeStates[selectedUser.id] ? "♥ Liked" : "♡ Like"}
              </button>
              <a
                href={`/profile/${selectedUser.id}`}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px",
                  background: "#1a1a2e", color: "#fff", textDecoration: "none",
                  fontFamily: "var(--font-primary)", textAlign: "center", display: "block",
                }}
              >
                View profile
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
