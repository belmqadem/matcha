import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── API ──────────────────────────────────────────────────────────────────────

async function handleResponse(res) {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body;
}

const browseApi = {
  getUsers: (params) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) q.set(k, String(v));
    });
    return fetch(`/api/browse?${q}`, { credentials: "include" }).then(handleResponse);
  },
  like: (id) =>
    fetch(`/api/likes/${id}`, { method: "POST", credentials: "include" }).then(handleResponse),
  unlike: (id) =>
    fetch(`/api/likes/${id}`, { method: "DELETE", credentials: "include" }).then(handleResponse),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return "Offline";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function calcAge(birth_date) {
  if (!birth_date) return null;
  return Math.floor((Date.now() - new Date(birth_date).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function getPhoto(user) {
  if (!user.photos?.length) return null;
  const main = user.photos.find((p) => p.id === user.profile_picture_id);
  return (main ?? user.photos[0])?.url ?? null;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

function FameBadge({ rating }) {
  const color = rating >= 80 ? "#e94057" : rating >= 55 ? "#f59e0b" : "#9ca3af";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color,
      background: `${color}18`, border: `1px solid ${color}35`,
      borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap",
    }}>★ {rating}</span>
  );
}

function Spinner({ size = 16, color = "#e94057" }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid ${color}30`, borderTop: `2px solid ${color}`,
      borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0,
    }} />
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ width: "100%", paddingBottom: "133%", position: "relative", background: "#f3f4f6" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, width: "55%", marginBottom: 8 }} />
        <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "35%" }} />
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user }) {
  const [err, setErr] = useState(false);
  const photo = getPhoto(user);
  if (photo && !err) {
    return <img src={photo} alt={user.first_name} onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  }
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: "#d1d5db", background: "#f3f4f6", letterSpacing: "-1px" }}>
      {(user.first_name?.[0] ?? "?")}{(user.last_name?.[0] ?? "")}
    </div>
  );
}

// ─── UserCard ─────────────────────────────────────────────────────────────────

function UserCard({ user, onLike, onUnlike }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const age = calcAge(user.birth_date);

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try { await onLike(user.id); } finally { setBusy(false); }
  };

  const handleUnlikeClick = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try { await onUnlike(user.id); } finally { setBusy(false); }
  };

  return (
    <div
      onClick={() => navigate(`/profile/${user.id}`)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #e5e7eb", display: "flex", flexDirection: "column",
        cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(233,64,87,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Photo */}
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#f3f4f6" }}>
        <Avatar user={user} />

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,26,46,0.82) 0%, rgba(26,26,46,0.06) 55%, transparent 100%)", pointerEvents: "none" }} />

        {/* Online */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: user.is_online ? "#22c55e" : "#9ca3af", border: "2px solid white", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "white", fontWeight: 500, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {user.is_online ? "Online" : timeAgo(user.last_seen)}
          </span>
        </div>

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          {user.is_connected && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", background: "#e94057", color: "white", borderRadius: 999, padding: "3px 9px" }}>
              MATCH
            </span>
          )}
          {!user.is_connected && user.liked_me && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(233,64,87,0.18)", color: "#e94057", border: "1px solid rgba(233,64,87,0.35)", borderRadius: 999, padding: "3px 9px" }}>
              Likes you
            </span>
          )}
        </div>

        {/* Name / location */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, color: "white", fontSize: 17, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.first_name}{age !== null ? `, ${age}` : ""}
              </p>
              {(user.distance_km != null || user.location_city) && (
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.72)", fontSize: 12, display: "flex", alignItems: "center", gap: 3 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {user.distance_km != null && <span>{user.distance_km < 1 ? "< 1 km" : `${Number(user.distance_km).toFixed(1)} km`}</span>}
                  {user.distance_km != null && user.location_city && <span>·</span>}
                  {user.location_city && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.location_city}</span>}
                </p>
              )}
            </div>
            <FameBadge rating={user.fame_rating} />
          </div>
        </div>
      </div>

      {/* Tags + actions */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 22 }}>
          {(user.tags ?? []).slice(0, 3).map((tag) => (
            <span key={tag} style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 999, padding: "3px 8px" }}>
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {user.liked_by_me ? (
            <button
              onClick={user.is_connected ? (e) => { e.stopPropagation(); navigate(`/chat/${user.id}`); } : handleUnlikeClick}
              disabled={busy}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 10,
                border: "1.5px solid #e94057", background: "#e94057",
                color: "white", fontSize: 13, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                opacity: busy ? 0.7 : 1, transition: "opacity 0.15s",
              }}
            >
              {busy ? <Spinner color="white" size={14} /> : user.is_connected ? "💬 Chat" : "♥ Liked"}
            </button>
          ) : (
            <button
              onClick={handleLikeClick}
              disabled={busy}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 10,
                border: "1.5px solid #e94057", background: "transparent",
                color: "#e94057", fontSize: 13, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                opacity: busy ? 0.7 : 1, transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.background = "#e94057"; e.currentTarget.style.color = "white"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e94057"; }}
            >
              {busy ? <Spinner size={14} /> : "♡ Like"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FilterPanel ──────────────────────────────────────────────────────────────

const EMPTY_FILTERS = { age_min: "", age_max: "", fame_min: "", fame_max: "", max_km: "", tags: "" };

function FilterPanel({ filters, onApply, onClose }) {
  const [local, setLocal] = useState(filters);
  const set = (key) => (e) => setLocal((p) => ({ ...p, [key]: e.target.value }));

  const inputStyle = {
    padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8,
    fontSize: 13, fontFamily: "inherit", color: "#1a1a2e",
    background: "#f7f7f7", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  const focus = (e) => (e.target.style.borderColor = "#e94057");
  const blur  = (e) => (e.target.style.borderColor = "#e5e7eb");
  const label = (text) => (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 7, letterSpacing: "0.07em", textTransform: "uppercase" }}>
      {text}
    </label>
  );

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Filters</h3>
        <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20, lineHeight: 1, fontFamily: "inherit", padding: 0 }}>✕</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <div>
          {label("Age range")}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="number" placeholder="18" min={18} max={120} value={local.age_min} onChange={set("age_min")} onFocus={focus} onBlur={blur} style={{ ...inputStyle, width: 64 }} />
            <span style={{ color: "#d1d5db" }}>—</span>
            <input type="number" placeholder="80" min={18} max={120} value={local.age_max} onChange={set("age_max")} onFocus={focus} onBlur={blur} style={{ ...inputStyle, width: 64 }} />
          </div>
        </div>

        <div>
          {label("Fame rating")}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="number" placeholder="0" min={0} max={100} value={local.fame_min} onChange={set("fame_min")} onFocus={focus} onBlur={blur} style={{ ...inputStyle, width: 64 }} />
            <span style={{ color: "#d1d5db" }}>—</span>
            <input type="number" placeholder="100" min={0} max={100} value={local.fame_max} onChange={set("fame_max")} onFocus={focus} onBlur={blur} style={{ ...inputStyle, width: 64 }} />
          </div>
        </div>

        <div>
          {label("Max distance (km)")}
          <input type="number" placeholder="50" min={1} value={local.max_km} onChange={set("max_km")} onFocus={focus} onBlur={blur} style={{ ...inputStyle, width: "100%" }} />
        </div>

        <div>
          {label("Interest tags")}
          <input type="text" placeholder="#vegan, #geek…" value={local.tags} onChange={set("tags")} onFocus={focus} onBlur={blur} style={{ ...inputStyle, width: "100%" }} />
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={() => setLocal(EMPTY_FILTERS)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "none", color: "#6b7280", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
          Reset
        </button>
        <button onClick={() => { onApply(local); onClose(); }} style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: "#e94057", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── BrowsePage ───────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "distance", label: "Distance" },
  { value: "age",      label: "Age"      },
  { value: "fame",     label: "Fame"     },
  { value: "tags",     label: "Common Tags" },
];

export default function BrowsePage() {
  const [users, setUsers]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState(null);
  const [sort, setSort]               = useState("distance");
  const [order, setOrder]             = useState("asc");
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab]     = useState("all");
  const abortRef = useRef(null);

  const buildParams = useCallback((pageNum) => {
    const p = { sort, order, page: pageNum, limit: 20 };
    if (filters.age_min)  p.age_min  = filters.age_min;
    if (filters.age_max)  p.age_max  = filters.age_max;
    if (filters.fame_min) p.fame_min = filters.fame_min;
    if (filters.fame_max) p.fame_max = filters.fame_max;
    if (filters.max_km)   p.max_km   = filters.max_km;
    if (filters.tags)     p.tags     = filters.tags.replace(/#/g, "").replace(/\s+/g, "");
    return p;
  }, [sort, order, filters]);

  // Refetch on sort / order / filter change
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setPage(1);

    browseApi.getUsers(buildParams(1))
      .then((data) => {
        if (ctrl.signal.aborted) return;
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => { if (!ctrl.signal.aborted) setError(err.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });

    return () => ctrl.abort();
  }, [buildParams]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const data = await browseApi.getUsers(buildParams(next));
      setUsers((prev) => [...prev, ...(data.users ?? [])]);
      setPage(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (id) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: true, is_connected: u.liked_me } : u));
    try {
      const res = await browseApi.like(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_connected: res.connected } : u));
    } catch (err) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u));
      setError(err.message);
    }
  };

  const handleUnlike = async (id) => {
    const original = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: false, is_connected: false } : u));
    try {
      await browseApi.unlike(id);
    } catch (err) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, liked_by_me: original?.liked_by_me ?? false, is_connected: original?.is_connected ?? false } : u));
      setError(err.message);
    }
  };

  const displayed = users.filter((u) => {
    if (activeTab === "liked")   return u.liked_by_me;
    if (activeTab === "matches") return u.is_connected;
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasMore = users.length < total;

  return (
    <div style={{ background: "#f7f7f7", fontFamily: "'Fraunces', serif", minHeight: "100%" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Page title ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.5px" }}>
            Discover people
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
            {loading ? "Loading…" : `${total} profiles match your preferences`}
          </p>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#dc2626" }}>⚠ {error}</span>
            <button onClick={() => setError(null)} style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontSize: 16, lineHeight: 1, fontFamily: "inherit", padding: 0 }}>✕</button>
          </div>
        )}

        {/* ── Tabs + Controls ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 3, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 3 }}>
            {[["all", "All"], ["liked", "Liked"], ["matches", "Matches"]].map(([val, label]) => (
              <button key={val} onClick={() => setActiveTab(val)} style={{
                padding: "6px 16px", borderRadius: 7, border: "none",
                background: activeTab === val ? "#e94057" : "none",
                color: activeTab === val ? "white" : "#6b7280",
                fontSize: 13, fontWeight: activeTab === val ? 600 : 400,
                fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>

          {/* Sort + Filter */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "7px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, color: "#1a1a2e", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button onClick={() => setOrder((o) => o === "asc" ? "desc" : "asc")} style={{ padding: "7px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, color: "#1a1a2e", fontFamily: "inherit", cursor: "pointer" }}>
              {order === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>

            <button onClick={() => setShowFilters((f) => !f)} style={{
              padding: "7px 14px",
              border: `1.5px solid ${showFilters || activeFilterCount > 0 ? "#e94057" : "#e5e7eb"}`,
              borderRadius: 8,
              background: showFilters ? "#fdf2f4" : "#fff",
              color: showFilters || activeFilterCount > 0 ? "#e94057" : "#1a1a2e",
              fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              ⚙ Filters
              {activeFilterCount > 0 && (
                <span style={{ background: "#e94057", color: "white", borderRadius: 999, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Filter panel ── */}
        {showFilters && (
          <FilterPanel filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />
        )}

        {/* ── Grid / States ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {displayed.map((user) => (
                <div key={user.id} style={{ animation: "fadeUp 0.25s ease both" }}>
                  <UserCard user={user} onLike={handleLike} onUnlike={handleUnlike} />
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && activeTab === "all" && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    padding: "11px 36px", borderRadius: 10,
                    border: "1.5px solid #e94057", background: "none",
                    color: "#e94057", fontSize: 14, fontWeight: 600,
                    fontFamily: "inherit", cursor: loadingMore ? "default" : "pointer",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    opacity: loadingMore ? 0.7 : 1, transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!loadingMore) { e.currentTarget.style.background = "#e94057"; e.currentTarget.style.color = "white"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#e94057"; }}
                >
                  {loadingMore
                    ? <><Spinner size={14} /> Loading…</>
                    : `Load more · ${total - users.length} remaining`}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div style={{ textAlign: "center", padding: "72px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 16, opacity: 0.2 }}>✦</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
              {activeTab === "matches" ? "No matches yet" : activeTab === "liked" ? "You haven't liked anyone yet" : "No profiles found"}
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 20px" }}>
              {activeFilterCount > 0 ? "Try loosening your filters." : "Check back soon — new people join every day."}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={() => setFilters(EMPTY_FILTERS)} style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid #e94057", background: "none", color: "#e94057", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
