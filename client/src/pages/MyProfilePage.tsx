import { useState, useRef, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_TAGS = ["#vegan","#geek","#piercing","#fitness","#travel","#music","#art","#gaming","#hiking","#foodie","#coffee","#books","#cinema","#yoga","#cooking"];
const GENDERS = [{ value: "male", label: "Man" },{ value: "female", label: "Woman" },{ value: "non_binary", label: "Non-binary" },{ value: "other", label: "Other" }];
const PREFERENCES = [{ value: "heterosexual", label: "Heterosexual" },{ value: "homosexual", label: "Homosexual" },{ value: "bisexual", label: "Bisexual" }];

// ─── Fix: useNavigate returns a navigate function directly ────────────────────
const useNavigate = () => {
  return (path) => console.log("navigate to", path);
};

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getMe: () =>
    fetch("/api/users/me", { credentials: "include" })
      .then(r => r.json()).then(d => d.user),
  patchUser: (body) =>
    fetch("/api/users/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); return d.user; }),
  patchProfile: (body) =>
    fetch("/api/profile/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); return d.user; }),
  updateTags: (tags) =>
    fetch("/api/profile/me/tags", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ tags }) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); return d.tags; }),
  uploadPhoto: (file) => {
    const fd = new FormData(); fd.append("photo", file);
    return fetch("/api/profile/me/photos", { method: "POST", credentials: "include", body: fd })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); return d.photo; });
  },
  deletePhoto: (id) =>
    fetch(`/api/profile/me/photos/${id}`, { method: "DELETE", credentials: "include" })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); }),
  setMainPhoto: (id) =>
    fetch(`/api/profile/me/photos/${id}/set-main`, { method: "PATCH", credentials: "include" })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); }),
  getVisitors: () =>
    fetch("/api/profile/me/visitors", { credentials: "include" }).then(r => r.json()).then(d => d.visitors ?? []),
  getLikedBy: () =>
    fetch("/api/profile/me/liked-by", { credentials: "include" }).then(r => r.json()).then(d => d.likers ?? []),
  updateLocation: (body) =>
    fetch("/api/profile/me/location", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); return d; }),
  logout: () =>
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(async r => { if (!r.ok) throw new Error("Logout failed"); }),
};

// ─── Mock user for preview ────────────────────────────────────────────────────
const MOCK_USER = {
  id: 1, first_name: "Sophie", last_name: "Laurent", username: "sophielau",
  email: "sophie@matcha.app", gender: "female", sexual_preference: "bisexual",
  biography: "Coffee-fueled wanderer. I collect sunsets and mismatched socks. Probably thinking about pasta right now.",
  location_city: "Paris", latitude: 48.85, longitude: 2.35,
  fame_rating: 72, profile_picture_id: null,
  photos: [], tags: ["#coffee", "#travel", "#cinema", "#yoga", "#art"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getCompletion(user) {
  const items = [
    { label: "Gender",    ok: Boolean(user.gender) },
    { label: "Bio",       ok: Boolean(user.biography?.trim()) },
    { label: "Location",  ok: Boolean(user.location_city?.trim() || (user.latitude != null && user.longitude != null)) },
    { label: "Interests", ok: (user.tags ?? []).length > 0 },
    { label: "Photos",    ok: (user.photos ?? []).length > 0 },
  ];
  return { score: Math.round(items.filter(i => i.ok).length / items.length * 100), items };
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  P:        "#C84B7A",
  P2:       "#E8789E",
  PL:       "#fdf0f5",
  PB:       "#f2cedd",
  PM:       "#f7dfe8",
  TEXT:     "#1a0e14",
  TEXT2:    "#9e7486",
  TEXT3:    "#c4a8b4",
  BG:       "#faf5f7",
  CARD:     "#ffffff",
  BORDER:   "rgba(200,75,122,0.12)",
  GREEN:    "#16a37f",
  SHADOW:   "0 2px 24px rgba(200,75,122,0.07)",
};

const styles = {
  inp: {
    width: "100%", padding: "11px 15px", borderRadius: 12,
    border: `1.5px solid ${T.PB}`, background: T.CARD, fontSize: 13.5,
    color: T.TEXT, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
  },
  lbl: {
    display: "block", fontSize: 10.5, fontWeight: 700,
    letterSpacing: "0.12em", textTransform: "uppercase",
    color: T.TEXT3, marginBottom: 7,
  },
  pill: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "5px 14px", borderRadius: 100,
    background: T.PL, color: T.P, fontSize: 12.5, fontWeight: 600,
    border: `1px solid ${T.PB}`, letterSpacing: "0.01em",
  },
  btnP: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "10px 22px", borderRadius: 100,
    background: T.P, color: "#fff", fontSize: 12.5, fontWeight: 700,
    border: "none", cursor: "pointer", fontFamily: "inherit",
    letterSpacing: "0.02em", transition: "background 0.15s, transform 0.1s",
  },
  btnO: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "10px 22px", borderRadius: 100,
    background: T.CARD, color: T.P, fontSize: 12.5, fontWeight: 700,
    border: `1.5px solid ${T.PB}`, cursor: "pointer", fontFamily: "inherit",
    letterSpacing: "0.02em", transition: "border-color 0.15s, background 0.15s",
  },
  card: {
    background: T.CARD, border: `1px solid ${T.BORDER}`,
    borderRadius: 22, overflow: "hidden", boxShadow: T.SHADOW,
  },
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SaveBar({ saving, error, onSave, onCancel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 9, paddingTop: 18, marginTop: 18, borderTop: `1px solid ${T.BORDER}` }}>
      {error && <span style={{ fontSize: 12, color: "#c0392b", flex: 1 }}>{error}</span>}
      <button onClick={onCancel} style={styles.btnO}>Discard</button>
      <button onClick={onSave} disabled={saving} style={{ ...styles.btnP, opacity: saving ? 0.65 : 1 }}>
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}

function SectionWrap({ title, subtitle, badge, onEdit, editing, children }) {
  return (
    <div style={styles.card}>
      <div style={{ padding: "26px 30px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <p style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: T.TEXT3, margin: 0 }}>{title}</p>
              {badge && <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 100, background: T.PL, color: T.P, fontWeight: 700, border: `1px solid ${T.PB}` }}>{badge}</span>}
            </div>
            {subtitle && <p style={{ fontSize: 13, color: T.TEXT2, margin: "5px 0 0", fontWeight: 400 }}>{subtitle}</p>}
          </div>
          {onEdit && !editing && (
            <button onClick={onEdit} style={{ ...styles.btnO, padding: "7px 16px", fontSize: 11.5 }}>Edit</button>
          )}
        </div>
      </div>
      <div style={{ padding: "0 30px 28px" }}>{children}</div>
    </div>
  );
}

// ─── Photos ───────────────────────────────────────────────────────────────────

function PhotosSection({ user, onUpdate }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [hovId, setHovId] = useState(null);
  const photos = user.photos ?? [];
  const sorted = [...photos].sort((a, b) => a.order_index - b.order_index);
  const main   = sorted.find(p => p.id === user.profile_picture_id) ?? sorted[0] ?? null;
  const others = sorted.filter(p => p.id !== main?.id);
  // All 5 slots in a single uniform grid (no oversized main)
  const slots  = [main, ...others, ...Array(Math.max(0, 5 - sorted.length)).fill(null)].slice(0, 5);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    if (photos.length + files.length > 5) { setError("Max 5 photos."); return; }
    setUploading(true); setError("");
    try {
      let updated = { ...user };
      for (const file of files) {
        const p = await api.uploadPhoto(file);
        updated = { ...updated, photos: [...updated.photos, p] };
      }
      onUpdate(updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setUploading(false); }
  };

  const handleDelete  = async (id) => { try { await api.deletePhoto(id); onUpdate({ ...user, photos: photos.filter(p => p.id !== id) }); } catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); } };
  const handleSetMain = async (id) => { try { await api.setMainPhoto(id); onUpdate({ ...user, profile_picture_id: id }); } catch (e) { setError(e instanceof Error ? e.message : "Failed."); } };

  return (
    <div style={styles.card}>
      <div style={{ padding: "26px 30px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <p style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: T.TEXT3, margin: 0 }}>Photos</p>
              <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 100, background: T.PL, color: T.P, fontWeight: 700, border: `1px solid ${T.PB}` }}>{photos.length}/5</span>
            </div>
            <p style={{ fontSize: 13, color: T.TEXT2, margin: "5px 0 0" }}>Hover to set main or remove</p>
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={styles.btnP}>
            {uploading ? "Uploading..." : "+ Add photo"}
          </button>
        </div>
      </div>
      <div style={{ padding: "0 30px 28px" }}>
        {/* Uniform 5-column grid — all photos the same size */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {slots.map((ph, i) => (
            <div
              key={ph?.id ?? `e-${i}`}
              style={{ aspectRatio: "1" }}
              onMouseEnter={() => setHovId(ph?.id ?? `e-${i}`)}
              onMouseLeave={() => setHovId(null)}
            >
              <SlotBox
                photo={ph}
                isMain={ph?.id === user.profile_picture_id || (i === 0 && !user.profile_picture_id && ph != null)}
                hovered={hovId === (ph?.id ?? `e-${i}`)}
                onSetMain={handleSetMain}
                onDelete={handleDelete}
                onAdd={() => fileRef.current?.click()}
                uploading={uploading}
              />
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} style={{ display: "none" }} />
        {error && <p style={{ fontSize: 12, color: "#c0392b", marginTop: 10 }}>{error}</p>}
      </div>
    </div>
  );
}

function SlotBox({ photo, isMain, hovered, onSetMain, onDelete, onAdd, uploading }) {
  const base = {
    width: "100%", height: "100%", position: "relative",
    borderRadius: 14, overflow: "hidden",
    background: T.PL,
    border: photo ? (isMain ? `2px solid ${T.P}` : `1px solid ${T.PB}`) : `2px dashed ${T.PB}`,
    transition: "box-shadow 0.2s",
    boxShadow: hovered && photo ? `0 4px 16px rgba(200,75,122,0.18)` : "none",
  };
  return (
    <div style={base}>
      {photo ? (
        <>
          {photo.url
            ? <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: T.PB }}>[ ]</div>}
          {isMain && (
            <div style={{ position: "absolute", top: 6, left: 6 }}>
              <span style={{ background: T.P, color: "#fff", fontSize: 8.5, fontWeight: 800, padding: "2px 8px", borderRadius: 100, letterSpacing: "0.08em", textTransform: "uppercase" }}>Main</span>
            </div>
          )}
          {hovered && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(26,14,20,0.45)", backdropFilter: "blur(2px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {!isMain && <button onClick={() => onSetMain(photo.id)} style={{ ...styles.btnP, padding: "5px 11px", fontSize: 10 }}>Set main</button>}
              <button onClick={() => onDelete(photo.id)} style={{ ...styles.btnO, padding: "5px 11px", fontSize: 10, background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>Remove</button>
            </div>
          )}
        </>
      ) : (
        <button onClick={onAdd} disabled={uploading}
          style={{ width: "100%", height: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, color: T.PB, fontFamily: "inherit" }}>
          <span style={{ fontSize: 18, lineHeight: 1, color: T.TEXT3 }}>+</span>
          <span style={{ fontSize: 10, color: T.TEXT3 }}>Add</span>
        </button>
      )}
    </div>
  );
}

// ─── Identity ─────────────────────────────────────────────────────────────────

function IdentitySection({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try { const u = await api.patchUser(form); onUpdate(u); setEditing(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to save."); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setForm({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email }); setEditing(false); setError(""); };

  return (
    <SectionWrap title="Identity" subtitle="Your name, username & email" onEdit={() => setEditing(true)} editing={editing}>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {["first_name","last_name"].map(f => (
              <div key={f}>
                <label style={styles.lbl}>{f === "first_name" ? "First name" : "Last name"}</label>
                <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} style={styles.inp} />
              </div>
            ))}
          </div>
          {[{k:"username",l:"Username",t:"text"},{k:"email",l:"Email address",t:"email"}].map(({k,l,t}) => (
            <div key={k}>
              <label style={styles.lbl}>{l}</label>
              <input value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} type={t} style={styles.inp} />
            </div>
          ))}
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div>
          {[
            ["Full name", `${user.first_name} ${user.last_name}`],
            ["Username",  `@${user.username}`],
            ["Email",     user.email],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "140px 1fr", padding: "13px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.BORDER}` : "none" }}>
              <span style={{ fontSize: 12.5, color: T.TEXT3, fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13.5, color: T.TEXT, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </SectionWrap>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function AboutSection({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ gender: user.gender ?? "", sexual_preference: user.sexual_preference ?? "", biography: user.biography ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try { const u = await api.patchProfile(form); onUpdate(u); setEditing(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to save."); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setForm({ gender: user.gender ?? "", sexual_preference: user.sexual_preference ?? "", biography: user.biography ?? "" }); setEditing(false); setError(""); };

  const gL = GENDERS.find(g => g.value === user.gender)?.label;
  const pL = PREFERENCES.find(p => p.value === user.sexual_preference)?.label;

  return (
    <SectionWrap title="About me" subtitle="Gender, preference & bio" onEdit={() => setEditing(true)} editing={editing}>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[{ label: "Gender", key: "gender", opts: GENDERS },{ label: "Attracted to", key: "sexual_preference", opts: PREFERENCES }].map(({ label, key, opts }) => (
              <div key={key}>
                <label style={styles.lbl}>{label}</label>
                <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ ...styles.inp, appearance: "none" }}>
                  <option value="">Select...</option>
                  {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div>
            <label style={styles.lbl}>Bio <span style={{ fontSize: 10, color: T.TEXT3, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— {form.biography.length}/500</span></label>
            <textarea value={form.biography} onChange={e => setForm(p => ({ ...p, biography: e.target.value }))} maxLength={500} rows={5} placeholder="Tell people who you are..." style={{ ...styles.inp, resize: "none", lineHeight: 1.6 }} />
          </div>
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 16 }}>
            {gL && <span style={styles.pill}>{gL}</span>}
            {pL && <span style={{ ...styles.pill, background: "#f3eafd", color: "#7b3f99", borderColor: "#d9b8f0" }}>{pL}</span>}
            {!gL && !pL && <span style={{ fontSize: 13, color: T.TEXT3, fontStyle: "italic" }}>Not filled in yet.</span>}
          </div>
          {user.biography
            ? <p style={{ fontSize: 14, color: T.TEXT2, lineHeight: 1.75, margin: 0, fontWeight: 400 }}>{user.biography}</p>
            : <p style={{ fontSize: 13, color: T.TEXT3, fontStyle: "italic", margin: 0 }}>No bio yet — tell the world about yourself!</p>}
        </div>
      )}
    </SectionWrap>
  );
}

// ─── Interests ────────────────────────────────────────────────────────────────

function InterestsSection({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState(user.tags ?? []);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addTag = (tag) => {
    const n = tag.trim().startsWith("#") ? tag.trim().toLowerCase() : `#${tag.trim().toLowerCase()}`;
    if (!n || n === "#" || tags.includes(n)) return;
    setTags(t => [...t, n]); setInput("");
  };
  const handleSave = async () => {
    setSaving(true); setError("");
    try { const t = await api.updateTags(tags); onUpdate({ ...user, tags: t }); setEditing(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to save."); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setTags(user.tags ?? []); setInput(""); setEditing(false); setError(""); };

  return (
    <SectionWrap title="Interests" subtitle="Things you're passionate about" badge={`${(user.tags ?? []).length} tags`} onEdit={() => setEditing(true)} editing={editing}>
      {editing ? (
        <div>
          <div style={{ display: "flex", gap: 9, marginBottom: 14 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); }}}
              placeholder="Type and press Enter..." style={{ ...styles.inp, flex: 1 }} />
            <button onClick={() => addTag(input)} style={styles.btnP}>Add</button>
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {tags.map(tag => (
                <span key={tag} style={{ ...styles.pill, background: T.P, color: "#fff", borderColor: T.P }}>
                  {tag}
                  <button onClick={() => setTags(t => t.filter(x => x !== tag))} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: 14, padding: 0, lineHeight: 1, display: "flex", marginLeft: 2 }}>x</button>
                </span>
              ))}
            </div>
          )}
          <p style={{ ...styles.lbl, marginBottom: 10 }}>Quick add</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
              <button key={tag} onClick={() => addTag(tag)} style={{ ...styles.pill, cursor: "pointer", background: "transparent", transition: "background 0.12s" }}>{tag}</button>
            ))}
          </div>
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(user.tags ?? []).length > 0
            ? user.tags.map(tag => <span key={tag} style={styles.pill}>{tag}</span>)
            : <span style={{ fontSize: 13, color: T.TEXT3, fontStyle: "italic" }}>No interests yet. Add some!</span>}
        </div>
      )}
    </SectionWrap>
  );
}

// ─── Location ─────────────────────────────────────────────────────────────────

function LocationSection({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState(user.location_city ?? "");
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsOk, setGpsOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const useGPS = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsOk(true); setGpsLoading(false); },
      () => { setError("Could not get location."); setGpsLoading(false); }
    );
  };
  const handleSave = async () => {
    if (!city.trim() && !gpsCoords) { setError("Please provide a city or use GPS."); return; }
    setSaving(true); setError("");
    try {
      const body = {};
      if (gpsCoords) { body.latitude = gpsCoords.lat; body.longitude = gpsCoords.lng; }
      if (city.trim()) body.location_city = city.trim();
      await api.updateLocation(body);
      onUpdate({ ...user, location_city: city.trim() || user.location_city, latitude: gpsCoords?.lat ?? user.latitude, longitude: gpsCoords?.lng ?? user.longitude });
      setEditing(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save."); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setCity(user.location_city ?? ""); setGpsOk(false); setGpsCoords(null); setEditing(false); setError(""); };

  const lat = user.latitude != null ? Number(user.latitude) : null;
  const lng = user.longitude != null ? Number(user.longitude) : null;

  return (
    <SectionWrap title="Location" subtitle="Used for nearby match suggestions" onEdit={() => setEditing(true)} editing={editing}>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={useGPS} disabled={gpsLoading}
            style={{ ...styles.btnO, justifyContent: "center", padding: "13px", borderColor: gpsOk ? T.P : T.PB, color: gpsOk ? T.P : T.TEXT2, width: "100%" }}>
            {gpsLoading ? "Detecting..." : gpsOk ? "GPS detected" : "Use my current location"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: T.PM }} />
            <span style={{ fontSize: 10.5, color: T.TEXT3, letterSpacing: "0.08em", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.PM }} />
          </div>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Type your city" style={styles.inp} />
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.PL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, border: `1px solid ${T.PB}`, color: T.P, fontWeight: 700 }}>Loc</div>
          {user.location_city
            ? <div><p style={{ fontSize: 15, fontWeight: 700, color: T.TEXT, margin: 0 }}>{user.location_city}</p><p style={{ fontSize: 12, color: T.TEXT3, margin: "3px 0 0" }}>Your primary location</p></div>
            : lat
              ? <span style={{ fontSize: 13, color: T.TEXT2 }}>{lat.toFixed(3)}, {lng?.toFixed(3)}</span>
              : <p style={{ fontSize: 13, color: T.TEXT3, fontStyle: "italic", margin: 0 }}>No location set yet</p>}
        </div>
      )}
    </SectionWrap>
  );
}

// ─── Activity ─────────────────────────────────────────────────────────────────

function ActivitySection({ user }) {
  const [visitors, setVisitors] = useState([]);
  const [likers, setLikers] = useState([]);
  const [tab, setTab] = useState("visitors");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getVisitors(), api.getLikedBy()])
      .then(([v, l]) => { setVisitors(v); setLikers(l); })
      .finally(() => setLoading(false));
  }, []);

  const fame = Math.min(100, Math.max(0, user.fame_rating ?? 0));
  const list = tab === "visitors" ? visitors : likers;

  const stat = (n, label, color = T.P) => (
    <div style={{ background: T.BG, borderRadius: 18, padding: "20px 16px", textAlign: "center", border: `1px solid ${T.BORDER}` }}>
      <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10.5, color: T.TEXT3, marginTop: 7, fontWeight: 500, letterSpacing: "0.03em" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={styles.card}>
        <div style={{ padding: "26px 30px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: T.TEXT3, margin: 0 }}>Fame score</p>
            <span style={{ fontSize: 36, fontWeight: 900, color: T.P, lineHeight: 1 }}>{fame}</span>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: T.PM, overflow: "hidden", marginBottom: 22 }}>
            <div style={{ height: "100%", width: `${fame}%`, background: `linear-gradient(90deg, ${T.P2}, ${T.P})`, borderRadius: 100, transition: "width 0.9s ease" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {stat(likers.length, "Likes received")}
            {stat(visitors.length, "Profile views")}
            {stat(0, "Connections", T.GREEN)}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ padding: "26px 30px 0" }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
            {[["visitors","Visitors", visitors.length],["likers","Liked me", likers.length]].map(([key, label, count]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", marginRight: 4, fontSize: 12.5, fontWeight: 700, color: tab === key ? T.P : T.TEXT3, background: tab === key ? T.PL : "none", border: `1.5px solid ${tab === key ? T.PB : "transparent"}`, borderRadius: 100, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {label}
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: tab === key ? T.P : T.PM, color: tab === key ? "#fff" : T.TEXT3, fontWeight: 800 }}>{count}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 30px 24px", maxHeight: 340, overflowY: "auto" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: T.TEXT3, fontSize: 13, padding: "32px 0" }}>Loading...</p>
          ) : list.length > 0 ? list.map(item => {
            const time = "visited_at" in item ? item.visited_at : item.liked_at;
            const initials = `${item.first_name[0]}${item.last_name[0]}`.toUpperCase();
            return (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: `1px solid ${T.BORDER}` }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.PL, border: `1.5px solid ${T.PB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: 800, color: T.P, flexShrink: 0, overflow: "hidden" }}>
                  {item.profile_picture_url ? <img src={item.profile_picture_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: T.TEXT, margin: 0 }}>{item.first_name} {item.last_name}</p>
                  <p style={{ fontSize: 11.5, color: T.TEXT3, margin: "2px 0 0" }}>@{item.username}</p>
                </div>
                <span style={{ fontSize: 11.5, color: T.TEXT3 }}>{timeAgo(time)}</span>
              </div>
            );
          }) : (
            <p style={{ textAlign: "center", color: T.TEXT3, fontSize: 13, fontStyle: "italic", padding: "32px 0" }}>Nothing here yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { key: "photos",    icon: "Cam",  label: "My photos" },
  { key: "identity",  icon: "Id",   label: "Identity" },
  { key: "about",     icon: "Me",   label: "About me" },
  { key: "interests", icon: "#",    label: "Interests" },
  { key: "location",  icon: "Loc",  label: "Location" },
  { key: "activity",  icon: "Act",  label: "Activity" },
];

function Sidebar({ user, active, onSection, onLogout, logoutLoading }) {
  const mainPhoto = user.photos?.find(p => p.id === user.profile_picture_id) ?? user.photos?.[0];
  const initials  = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
  const { score, items } = getCompletion(user);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Profile card */}
      <div style={styles.card}>
        <div style={{ padding: "22px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 18, marginBottom: 14, borderBottom: `1px solid ${T.BORDER}` }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", background: T.PL, border: `3px solid ${T.PB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: T.P }}>
                {mainPhoto?.url ? <img src={mainPhoto.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
              </div>
              <span style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, background: T.GREEN, borderRadius: "50%", border: `2.5px solid #fff` }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15.5, fontWeight: 800, color: T.TEXT, margin: 0, letterSpacing: "-0.02em" }}>{user.first_name} {user.last_name}</p>
              <p style={{ fontSize: 12, color: T.TEXT3, margin: "3px 0 0" }}>@{user.username}</p>
            </div>
            {/* Fame bar */}
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: T.TEXT3, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Fame</span>
                <span style={{ color: T.P, fontWeight: 800 }}>{user.fame_rating ?? 0}</span>
              </div>
              <div style={{ height: 5, background: T.PM, borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, user.fame_rating ?? 0)}%`, background: `linear-gradient(90deg, ${T.P2}, ${T.P})`, borderRadius: 100 }} />
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav>
            {NAV.map(({ key, label }) => {
              const isActive = active === key;
              return (
                <button key={key} onClick={() => onSection(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "10px 12px", borderRadius: 13,
                    background: isActive ? T.PL : "transparent",
                    color: isActive ? T.P : T.TEXT2,
                    fontSize: 13.5, fontWeight: isActive ? 700 : 400,
                    border: isActive ? `1px solid ${T.PB}` : "1px solid transparent",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    marginBottom: 3, transition: "all 0.13s",
                  }}>
                  {label}
                  {isActive && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.P }} />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Profile strength */}
      <div style={styles.card}>
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: T.TEXT3, margin: 0 }}>Profile strength</p>
            <span style={{ fontSize: 11, color: score === 100 ? T.GREEN : T.P, fontWeight: 700 }}>
              {score === 100 ? "Complete!" : `${score}%`}
            </span>
          </div>
          <div style={{ height: 6, background: T.PM, borderRadius: 100, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ height: "100%", width: `${score}%`, background: score === 100 ? T.GREEN : `linear-gradient(90deg, ${T.P2}, ${T.P})`, borderRadius: 100, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {items.map(item => (
              <div key={item.label} style={{
                fontSize: 11, padding: "6px 10px", borderRadius: 10,
                background: item.ok ? T.PL : T.BG,
                color: item.ok ? T.P : T.TEXT3,
                border: `1px solid ${item.ok ? T.PB : T.BORDER}`,
                textAlign: "center", fontWeight: item.ok ? 700 : 400,
              }}>
                {item.ok ? "✓ " : "○ "}{item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div style={styles.card}>
        <button onClick={onLogout} disabled={logoutLoading}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "15px 20px", background: "none", border: "none", cursor: "pointer", fontSize: 13.5, color: T.TEXT2, fontWeight: 500, fontFamily: "inherit", transition: "color 0.13s" }}>
          {logoutLoading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("photos");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    // Try real API, fall back to mock for preview
    api.getMe()
      .then(setUser)
      .catch(() => setUser(MOCK_USER))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try { await api.logout(); } catch {}
    navigate("/login");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.BG }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: T.TEXT3, fontSize: 13.5, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>Loading your profile...</p>
      </div>
    </div>
  );

  if (fetchError && !user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.BG }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: T.TEXT3, fontSize: 13.5, marginBottom: 14 }}>{fetchError}</p>
        <button onClick={() => navigate("/login")} style={styles.btnP}>Back to login</button>
      </div>
    </div>
  );

  const sectionMap = {
    photos:    <PhotosSection    user={user} onUpdate={setUser} />,
    identity:  <IdentitySection  user={user} onUpdate={setUser} />,
    about:     <AboutSection     user={user} onUpdate={setUser} />,
    interests: <InterestsSection user={user} onUpdate={setUser} />,
    location:  <LocationSection  user={user} onUpdate={setUser} />,
    activity:  <ActivitySection  user={user} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: T.BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.PB}; border-radius: 100px; }
        input:focus, select:focus, textarea:focus {
          border-color: ${T.P} !important;
          box-shadow: 0 0 0 3px rgba(200,75,122,0.1) !important;
          outline: none;
        }
        button:hover:not(:disabled) { opacity: 0.88; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-enter { animation: fadeUp 0.22s ease both; }
      `}</style>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(250,245,247,0.9)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.BORDER}`,
        padding: "14px 40px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <button onClick={() => navigate("/browse")}
          style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${T.PB}`, background: T.CARD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: T.P, flexShrink: 0 }}>
          &larr;
        </button>
        <span style={{ fontSize: 16, fontWeight: 800, color: T.TEXT, flex: 1, letterSpacing: "-0.02em" }}>My Profile</span>
        <span style={{ fontSize: 18, fontWeight: 900, color: T.P, fontStyle: "italic", letterSpacing: "-0.04em" }}>Matcha</span>
      </header>

      {/* Layout */}
      <div style={{
        maxWidth: "100%",
        margin: "0 auto",
        padding: "28px 40px 80px",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 24,
        alignItems: "start",
      }}>
        {/* Sticky sidebar */}
        <div style={{ position: "sticky", top: 78 }}>
          <Sidebar user={user} active={active} onSection={setActive} onLogout={handleLogout} logoutLoading={logoutLoading} />
        </div>

        {/* Content */}
        <div className="section-enter" key={active}>
          {sectionMap[active]}
        </div>
      </div>
    </div>
  );
}
