import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  X,
  Check,
  Edit2,
  MapPin,
  Heart,
  Star,
  Eye,
  ChevronDown,
  Loader2,
  LogOut,
  AlertTriangle,
  Shield,
  Info,
  CheckCircle2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Photo {
  id: number;
  url: string;
  order_index: number;
  created_at: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender: string | null;
  sexual_preference: string | null;
  biography: string | null;
  location_city: string | null;
  latitude: number | null;
  longitude: number | null;
  fame_rating: number;
  tags: string[];
  photos: Photo[];
  profile_picture_id: number | null;
  is_online?: boolean;
  last_seen?: string | null;
}

interface Visitor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  visited_at: string;
}

interface Liker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  liked_at: string;
}

interface Conversation {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id: number | null;
  is_online: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageFromBirthDate(birth_date: string | null): number | null {
  if (!birth_date) return null;
  const dob = new Date(birth_date);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function birthDateFromAge(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return 'just now';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getMe: (signal?: AbortSignal) =>
    fetch('/api/users/me', { credentials: 'include', signal })
      .then((r) => r.json())
      .then((d) => d.user as UserProfile),

  patchUser: (body: object) =>
    fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.user as UserProfile;
    }),

  patchProfile: (body: object) =>
    fetch('/api/profile/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.user as UserProfile;
    }),

  updateTags: (tags: string[]) =>
    fetch('/api/profile/me/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tags }),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.tags as string[];
    }),

  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return fetch('/api/profile/me/photos', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.photo as Photo;
    });
  },

  deletePhoto: (id: number) =>
    fetch(`/api/profile/me/photos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
    }),

  setMainPhoto: (id: number) =>
    fetch(`/api/profile/me/photos/${id}/set-main`, {
      method: 'PATCH',
      credentials: 'include',
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
    }),

  getVisitors: (signal?: AbortSignal) =>
    fetch('/api/profile/me/visitors', { credentials: 'include', signal })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d.visitors) ? d.visitors : []) as Visitor[]),

  getLikedBy: (signal?: AbortSignal) =>
    fetch('/api/profile/me/liked-by', { credentials: 'include', signal })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d.likers) ? d.likers : []) as Liker[]),

  getConversations: (signal?: AbortSignal) =>
    fetch('/api/chat/conversations', { credentials: 'include', signal })
      .then((r) => r.json())
      .then((d) => (Array.isArray(d.conversations) ? d.conversations : []) as Conversation[]),

  updateLocation: (body: { latitude: number; longitude: number; location_city?: string } | { location_city: string }) =>
    fetch('/api/profile/me/location', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d;
    }),

  logout: () =>
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).then(async (r) => {
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error ?? 'Logout failed');
      }
    }),
};

// ─── Constants ────────────────────────────────────────────────────────────────

// These are tag suggestions only — not fake data. They're filtered against the
// user's real tags from the backend so only unselected ones appear.
const SUGGESTED_TAGS = [
  '#vegan', '#geek', '#piercing', '#fitness', '#travel', '#music',
  '#art', '#gaming', '#hiking', '#foodie', '#cinema', '#yoga',
  '#cooking', '#reading', '#photography',
];

const GENDERS = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

const PREFERENCES = [
  { value: 'heterosexual', label: 'Heterosexual' },
  { value: 'homosexual', label: 'Homosexual' },
  { value: 'bisexual', label: 'Bisexual' },
];

const DEFAULT_PREFERENCE = 'bisexual';

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '10px',
  border: '1.5px solid #f0f0f0',
  background: '#fafafa',
  padding: '9px 14px',
  fontSize: '13px',
  color: '#333',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#aaa',
  marginBottom: '5px',
};

// ─── SaveBar ─────────────────────────────────────────────────────────────────

function SaveBar({ saving, error, onSave, onCancel }: {
  saving: boolean; error: string; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #f5f5f5' }}>
      {error && (
        <p style={{ flex: 1, fontSize: '11px', color: '#e94057', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={10} aria-hidden="true" /> {error}
        </p>
      )}
      <button type="button" onClick={onCancel} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1.5px solid #eee', background: '#fff', color: '#888', cursor: 'pointer' }}>
        Cancel
      </button>
      <button type="button" onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', background: '#e94057', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saving ? <Loader2 size={10} aria-hidden="true" /> : <Check size={10} aria-hidden="true" />} Save
      </button>
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function EditModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', margin: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Edit modals ──────────────────────────────────────────────────────────────

function EditIdentityModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { setError('Name is required.'); return; }
    if (!form.username.trim()) { setError('Username is required.'); return; }
    setSaving(true); setError('');
    try { const u = await api.patchUser(form); onUpdate(u); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <EditModal title="Edit Identity" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {(['first_name', 'last_name'] as const).map(f => (
            <div key={f}>
              <label style={labelStyle} htmlFor={`identity-${f}`}>{f === 'first_name' ? 'First name' : 'Last name'}</label>
              <input
                id={`identity-${f}`}
                value={form[f]}
                onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div>
          <label style={labelStyle} htmlFor="identity-username">Username</label>
          <input id="identity-username" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="identity-email">Email</label>
          <input id="identity-email" value={form.email} type="email" onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
          <p style={{ fontSize: '10px', color: '#bbb', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={9} aria-hidden="true" /> Changing your email requires re-verification.
          </p>
        </div>
        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}

function EditAboutModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const currentAge = ageFromBirthDate(user.birth_date);
  const [form, setForm] = useState({
    gender: user.gender ?? '',
    sexual_preference: user.sexual_preference ?? '',
    biography: user.biography ?? '',
    ageInput: currentAge !== null ? String(currentAge) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (form.ageInput) {
      const age = parseInt(form.ageInput, 10);
      if (isNaN(age) || age < 18 || age > 120) {
        setError('Age must be between 18 and 120.');
        return;
      }
    }
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = {
        gender: form.gender || null,
        sexual_preference: form.sexual_preference || null,
        biography: form.biography || null,
      };
      if (form.ageInput) {
        body.birth_date = birthDateFromAge(parseInt(form.ageInput, 10));
      } else {
        body.birth_date = null;
      }
      const u = await api.patchProfile(body);
      onUpdate(u);
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <EditModal title="Edit About" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle} htmlFor="about-age">Age</label>
            <input
              id="about-age"
              value={form.ageInput}
              type="number"
              min={18}
              max={120}
              onChange={e => setForm(p => ({ ...p, ageInput: e.target.value }))}
              style={inputStyle}
              placeholder="Your age"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="about-gender">Gender</label>
            <div style={{ position: 'relative' }}>
              <select id="about-gender" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} style={{ ...inputStyle, appearance: 'none', paddingRight: '28px' }}>
                <option value="">Not specified</option>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              <ChevronDown size={12} aria-hidden="true" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
        <div>
          <label style={labelStyle} htmlFor="about-orientation">Sexual orientation</label>
          <div style={{ position: 'relative' }}>
            <select id="about-orientation" value={form.sexual_preference} onChange={e => setForm(p => ({ ...p, sexual_preference: e.target.value }))} style={{ ...inputStyle, appearance: 'none', paddingRight: '28px' }}>
              <option value="">Not specified (defaults to bisexual)</option>
              {PREFERENCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown size={12} aria-hidden="true" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
          </div>
          {!form.sexual_preference && (
            <p style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={9} aria-hidden="true" /> Will default to bisexual.
            </p>
          )}
        </div>
        <div>
          <label style={labelStyle} htmlFor="about-bio">Biography</label>
          <textarea
            id="about-bio"
            value={form.biography}
            onChange={e => setForm(p => ({ ...p, biography: e.target.value }))}
            maxLength={500}
            rows={4}
            placeholder="Tell others who you are…"
            style={{ ...inputStyle, resize: 'none' }}
          />
          <p style={{ textAlign: 'right', fontSize: '10px', color: '#ccc', marginTop: '2px' }}>{form.biography.length}/500</p>
        </div>
        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}

function EditTagsModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const [tags, setTags] = useState<string[]>(user.tags ?? []);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addTag = (raw: string) => {
    const n = raw.trim().toLowerCase();
    if (!n) return;
    const tag = n.startsWith('#') ? n : `#${n}`;
    if (tag === '#' || tag.length < 2) return;
    setTags(prev => {
      if (prev.includes(tag)) return prev;
      return [...prev, tag];
    });
    setInput('');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try { const t = await api.updateTags(tags); onUpdate({ ...user, tags: t }); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  // Only show suggestions that the user hasn't already added
  const available = SUGGESTED_TAGS.filter(t => !tags.includes(t));

  return (
    <EditModal title="Edit Interests" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); } }}
            placeholder="#sport, #music…"
            style={{ ...inputStyle, flex: 1 }}
            aria-label="Add a tag"
          />
          <button type="button" onClick={() => addTag(input)} style={{ padding: '9px 14px', borderRadius: '10px', background: '#e94057', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map(tag => (
              <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: '#e94057', color: '#fff', fontSize: '12px', fontWeight: 500 }}>
                {tag}
                <button
                  type="button"
                  onClick={() => setTags(t => t.filter(x => x !== tag))}
                  aria-label={`Remove ${tag}`}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  <X size={9} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
        {available.length > 0 && (
          <div>
            <p style={labelStyle}>Quick add</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {available.map(tag => (
                <button key={tag} type="button" onClick={() => addTag(tag)} style={{ padding: '4px 12px', borderRadius: '999px', border: '1.5px solid #eee', background: '#fff', color: '#888', fontSize: '12px', cursor: 'pointer' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}

function EditLocationModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const [cityInput, setCityInput] = useState(user.location_city ?? '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    user.latitude != null && user.longitude != null
      ? { lat: user.latitude, lng: user.longitude }
      : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setGpsLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      pos => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false); },
      () => { setError('Could not get GPS. Enter city manually.'); setGpsLoading(false); }
    );
  };

  const handleSave = async () => {
    const city = cityInput.trim();
    if (!gpsCoords && !city) { setError('Please provide a GPS location or enter a city.'); return; }
    setSaving(true); setError('');
    try {
      let body: Parameters<typeof api.updateLocation>[0];
      if (gpsCoords) {
        body = {
          latitude: gpsCoords.lat,
          longitude: gpsCoords.lng,
          ...(city ? { location_city: city } : {}),
        };
      } else {
        body = { location_city: city } as { location_city: string };
      }
      const result = await api.updateLocation(body);
      onUpdate({
        ...user,
        location_city: result.location_city ?? city ?? user.location_city,
        latitude: result.latitude ?? gpsCoords?.lat ?? user.latitude,
        longitude: result.longitude ?? gpsCoords?.lng ?? user.longitude,
      });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <EditModal title="Edit Location" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>GPS location</label>
          <button
            type="button"
            onClick={useGPS}
            disabled={gpsLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: `1.5px solid ${gpsCoords ? '#e94057' : '#eee'}`,
              background: gpsCoords ? 'rgba(233,64,87,0.06)' : '#fafafa',
              color: gpsCoords ? '#e94057' : '#888',
              fontSize: '13px',
              fontWeight: 500,
              cursor: gpsLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {gpsLoading ? <Loader2 size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}
            {gpsLoading ? 'Detecting…' : gpsCoords ? '✓ GPS detected' : 'Use my current location'}
          </button>
          <p style={{ fontSize: '10px', color: '#bbb', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={9} aria-hidden="true" /> Only used for matching. You consent by clicking above.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          <span style={{ fontSize: '10px', color: '#ccc', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="location-city">City (manual)</label>
          <input
            id="location-city"
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="e.g. Paris, Marais district"
            style={inputStyle}
          />
        </div>
        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}

// ─── Photos strip + upload ────────────────────────────────────────────────────

function PhotosPanel({ user, onUpdate }: { user: UserProfile; onUpdate: (u: UserProfile) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const photos = user.photos ?? [];
  const sorted = photos.slice().sort((a, b) => a.order_index - b.order_index);
  const emptyCount = Math.max(0, 5 - sorted.length);
  const slots: (Photo | null)[] = [...sorted, ...Array(emptyCount).fill(null)].slice(0, 5);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    if (photos.length + files.length > 5) { setError('Max 5 photos.'); return; }
    setUploading(true); setError('');
    try {
      const newPhotos = [...photos];
      let newProfilePictureId = user.profile_picture_id;
      for (const file of files) {
        const p = await api.uploadPhoto(file);
        newPhotos.push(p);
        if (!newProfilePictureId) newProfilePictureId = p.id;
      }
      onUpdate({ ...user, photos: newPhotos, profile_picture_id: newProfilePictureId });
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      await api.deletePhoto(id);
      const remaining = photos.filter(p => p.id !== id);
      const newPicId = id === user.profile_picture_id ? (remaining[0]?.id ?? null) : user.profile_picture_id;
      onUpdate({ ...user, photos: remaining, profile_picture_id: newPicId });
    } catch (e) { setError(e instanceof Error ? e.message : 'Delete failed.'); }
  };

  const handleSetMain = async (id: number) => {
    setError('');
    try {
      await api.setMainPhoto(id);
      onUpdate({ ...user, profile_picture_id: id });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to set main photo.'); }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 22px', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>Photos</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#bbb' }}>{photos.length}/5</span>
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ fontSize: '12px', fontWeight: 600, color: '#e94057', background: 'rgba(233,64,87,0.08)', border: 'none', borderRadius: '8px', padding: '5px 12px', cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              + Add photo
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {slots.map((photo, i) => (
          <div
            key={photo?.id ?? `empty-${i}`}
            style={{ position: 'relative', flexShrink: 0, width: '140px', height: '180px', borderRadius: '14px', overflow: 'hidden', background: '#f9f9f9', border: '1.5px solid #f0f0f0', cursor: photo ? 'default' : 'pointer' }}
            onClick={() => !photo && fileRef.current?.click()}
            role={!photo ? 'button' : undefined}
            aria-label={!photo ? 'Upload a photo' : undefined}
            tabIndex={!photo ? 0 : undefined}
            onKeyDown={!photo ? (e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); } : undefined}
          >
            {photo ? (
              <>
                <img src={photo.url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {photo.id === user.profile_picture_id && (
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#e94057', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.05em' }}>MAIN</span>
                )}
                <div
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                >
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                    {photo.id !== user.profile_picture_id && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSetMain(photo.id); }}
                        aria-label="Set as main photo"
                        style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e94057' }}
                      >
                        <Star size={12} aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                      aria-label="Delete photo"
                      style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ccc' }}>
                {uploading && i === photos.length
                  ? <Loader2 size={20} aria-hidden="true" />
                  : <Camera size={20} aria-hidden="true" />
                }
                <span style={{ fontSize: '11px', fontWeight: 500 }}>{uploading && i === photos.length ? 'Uploading…' : 'Add'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      {error && (
        <p style={{ fontSize: '11px', color: '#e94057', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={10} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── About panel ──────────────────────────────────────────────────────────────

function AboutPanel({ user, onEditAbout, onEditLocation }: {
  user: UserProfile;
  onEditAbout: () => void;
  onEditLocation: () => void;
}) {
  const genderLabel = GENDERS.find(g => g.value === user.gender)?.label;
  const prefLabel =
    PREFERENCES.find(p => p.value === user.sexual_preference)?.label ??
    `${PREFERENCES.find(p => p.value === DEFAULT_PREFERENCE)?.label} (default)`;
  const lat = user.latitude != null ? Number(user.latitude) : null;
  const lng = user.longitude != null ? Number(user.longitude) : null;
  const displayAge = ageFromBirthDate(user.birth_date);

  const rows: { label: string; value: string | null; action: () => void }[] = [
    { label: 'City', value: user.location_city ?? (lat != null ? `${lat.toFixed(3)}, ${lng?.toFixed(3)}` : null), action: onEditLocation },
    { label: 'Age', value: displayAge !== null ? `${displayAge} years old` : null, action: onEditAbout },
    { label: 'Gender', value: genderLabel ?? null, action: onEditAbout },
    { label: 'Orientation', value: prefLabel, action: onEditAbout },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 22px', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>About</h3>
        <button
          onClick={onEditAbout}
          style={{ fontSize: '12px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Edit2 size={11} aria-hidden="true" /> Edit
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
        {rows.map(({ label, value, action }) => (
          <div
            key={label}
            onClick={action}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') action(); }}
            aria-label={`Edit ${label}`}
            style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
          >
            <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '13px', fontWeight: 500, color: value ? '#333' : '#ddd' }}>
              {value ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity panel ───────────────────────────────────────────────────────────

function ActivityPanel({ user, visitors }: { user: UserProfile; visitors: Visitor[] }) {
  const navigate = useNavigate();
  const [likers, setLikers] = useState<Liker[]>([]);
  const [tab, setTab] = useState<'visitors' | 'likers'>('visitors');
  const [loading, setLoading] = useState(true);
  const fame = Math.min(100, Math.max(0, user.fame_rating ?? 0));

  useEffect(() => {
    const controller = new AbortController();
    api.getLikedBy(controller.signal)
      .then(setLikers)
      .catch((e) => { if (e.name !== 'AbortError') console.error('Failed to load likers', e); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const list = tab === 'visitors' ? visitors : likers;

  const goToProfile = (id: number, name: string) => {
    navigate(`/profile/${id}`);
  };

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 22px', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>Fame & Activity</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={12} style={{ color: '#e94057' }} aria-hidden="true" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#e94057' }} aria-label={`Fame rating: ${fame}`}>{fame}</span>
        </div>
      </div>

      <div style={{ height: '6px', borderRadius: '999px', background: '#f5f5f5', marginBottom: '16px', overflow: 'hidden' }} role="progressbar" aria-valuenow={fame} aria-valuemin={0} aria-valuemax={100} aria-label="Fame rating">
        <div style={{ height: '100%', borderRadius: '999px', background: '#e94057', width: `${fame}%`, transition: 'width 0.7s ease' }} />
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #f5f5f5', marginBottom: '12px' }} role="tablist">
        {[
          { key: 'visitors' as const, label: 'Visitors', icon: Eye, count: visitors.length },
          { key: 'likers' as const, label: 'Liked me', icon: Heart, count: likers.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 0', marginRight: '20px', fontSize: '12px', fontWeight: 600, color: tab === key ? '#e94057' : '#bbb', background: 'none', border: 'none', borderBottom: `2px solid ${tab === key ? '#e94057' : 'transparent'}`, cursor: 'pointer', marginBottom: '-1px' }}
          >
            <Icon size={11} aria-hidden="true" /> {label}
            <span style={{ marginLeft: '2px', padding: '1px 6px', borderRadius: '999px', background: tab === key ? '#e94057' : '#f5f5f5', color: tab === key ? '#fff' : '#aaa', fontSize: '9px', fontWeight: 700 }}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Loader2 size={16} style={{ color: '#ddd' }} aria-label="Loading" />
        </div>
      ) : list.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '200px', overflowY: 'auto' }}>
          {list.map(item => {
            const time = 'visited_at' in item ? item.visited_at : item.liked_at;
            return (
              <div
                key={item.id}
                onClick={() => goToProfile(item.id, item.first_name)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToProfile(item.id, item.first_name); }}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.first_name} ${item.last_name}'s profile`}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid #f9f9f9', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5', overflow: 'hidden', flexShrink: 0, border: '1.5px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#e94057' }}>
                  {item.profile_picture_url
                    ? <img src={item.profile_picture_url} alt={`${item.first_name}'s avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span aria-hidden="true">{item.first_name[0]}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.first_name} {item.last_name}
                  </p>
                  <p style={{ fontSize: '10px', color: '#bbb' }}>@{item.username}</p>
                </div>
                <span style={{ fontSize: '10px', color: '#ccc', flexShrink: 0 }}>{timeAgo(time)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Nothing here yet.</p>
      )}
    </div>
  );
}

// ─── Sidebar: Messages ────────────────────────────────────────────────────────

function MessagesSidebar() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    api.getConversations(controller.signal)
      .then(setConversations)
      .catch((e) => { if (e.name !== 'AbortError') console.error('Failed to load conversations', e); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>Messages</h3>
          <button
            onClick={() => navigate('/chat')}
            style={{ fontSize: '12px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            See all
          </button>
        </div>
      </div>

      <div style={{ padding: '0 0 8px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Loader2 size={16} style={{ color: '#ddd' }} aria-label="Loading conversations" />
          </div>
        ) : conversations.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
            No conversations yet.
          </p>
        ) : (
          conversations.map(chat => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/chat/${chat.id}`); }}
              aria-label={`Open conversation with ${chat.first_name} ${chat.last_name}`}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffe4e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#e94057', overflow: 'hidden' }}>
                  <span aria-hidden="true">{chat.first_name[0]}{chat.last_name[0]}</span>
                </div>
                {chat.is_online && (
                  <span
                    style={{ position: 'absolute', bottom: 0, right: 0, width: '11px', height: '11px', borderRadius: '50%', background: '#4ade80', border: '2px solid #fff' }}
                    aria-label="Online"
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#222', marginBottom: '1px' }}>
                  {chat.first_name} {chat.last_name}
                </p>
                <p style={{ fontSize: '11px', color: '#bbb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.last_message ?? 'No messages yet'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                {chat.last_message_at && (
                  <span style={{ fontSize: '10px', color: '#ccc' }}>{timeAgo(chat.last_message_at)}</span>
                )}
                {chat.unread_count > 0 && (
                  <span style={{ padding: '1px 6px', borderRadius: '999px', background: '#e94057', color: '#fff', fontSize: '9px', fontWeight: 700 }}>
                    {chat.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Sidebar: Recent visitors ─────────────────────────────────────────────────

function RecentVisitorsSidebar({ visitors }: { visitors: Visitor[] }) {
  const navigate = useNavigate();
  // Show up to 8 most-recent visitors
  const recent = visitors.slice(0, 8);

  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', padding: '18px 20px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222', marginBottom: '14px' }}>Recent visitors</h3>
      {recent.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
          {recent.map((v) => (
            <div
              key={v.id}
              onClick={() => navigate(`/profile/${v.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/profile/${v.id}`); }}
              aria-label={`View ${v.first_name} ${v.last_name}'s profile`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#ffe4e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#e94057',
                overflow: 'hidden',
                border: '2px solid #ffd6db',
              }}>
                {v.profile_picture_url
                  ? <img src={v.profile_picture_url} alt={`${v.first_name}'s avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span aria-hidden="true">{v.first_name[0]}</span>
                }
              </div>
              <span style={{ fontSize: '10px', color: '#888', textAlign: 'center', maxWidth: '44px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {v.first_name}
              </span>
              <span style={{ fontSize: '9px', color: '#ccc' }}>
                {timeAgo(v.visited_at)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#ccc', fontStyle: 'italic' }}>No recent visitors.</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [editModal, setEditModal] = useState<'identity' | 'about' | 'tags' | 'location' | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.getMe(controller.signal),
      api.getVisitors(controller.signal),
    ])
      .then(([me, v]) => { setUser(me); setVisitors(v); })
      .catch(e => {
        if (e.name === 'AbortError') return;
        setFetchError(e instanceof Error ? e.message : 'Failed to load profile.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await api.logout();
      navigate('/login');
    } catch (e) {
      setLogoutError(e instanceof Error ? e.message : 'Sign out failed. Please try again.');
      setLoggingOut(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} style={{ color: '#e94057' }} aria-label="Loading profile" />
    </div>
  );

  if (fetchError || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '14px', color: '#aaa' }}>{fetchError || 'Profile not found.'}</p>
      <button onClick={() => navigate('/login')} style={{ fontSize: '13px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: 'pointer' }}>
        Back to login
      </button>
    </div>
  );

  const mainPhoto = user.photos?.find(p => p.id === user.profile_picture_id) ?? user.photos?.[0];
  const displayAge = ageFromBirthDate(user.birth_date);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4f4', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* ── Edit modals ── */}
      {editModal === 'identity' && <EditIdentityModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'about' && <EditAboutModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'tags' && <EditTagsModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'location' && <EditLocationModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Hero card ── */}
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '260px' }}>

              {/* Profile photo */}
              <div style={{ position: 'relative', background: '#f5f5f5' }}>
                {mainPhoto ? (
                  <img src={mainPhoto.url} alt="Your profile photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div
                    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ccc', minHeight: '260px', cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label="Add a profile photo"
                  >
                    <Camera size={32} aria-hidden="true" />
                    <span style={{ fontSize: '12px' }}>Add photo</span>
                  </div>
                )}
                {user.is_online && (
                  <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#4ade80', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.05em' }}>
                    ● ONLINE
                  </span>
                )}
              </div>

              {/* Name / bio / tags */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Name row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>
                        {user.first_name} {user.last_name}{displayAge !== null ? `, ${displayAge}` : ''}
                      </h1>
                      <CheckCircle2 size={18} style={{ color: '#e94057', flexShrink: 0 }} aria-label="Verified profile" />
                    </div>
                    <button
                      onClick={() => setEditModal('identity')}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#e94057', background: 'rgba(233,64,87,0.08)', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Edit2 size={10} aria-hidden="true" /> Edit
                    </button>
                  </div>

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
                    <MapPin size={12} style={{ color: '#e94057' }} aria-hidden="true" />
                    <span style={{ fontSize: '13px', color: '#aaa' }}>
                      {user.location_city ?? (user.latitude != null ? `${Number(user.latitude).toFixed(2)}, ${Number(user.longitude).toFixed(2)}` : 'Location not set')}
                    </span>
                    <button
                      onClick={() => setEditModal('location')}
                      aria-label="Edit location"
                      style={{ marginLeft: '4px', fontSize: '10px', color: '#e94057', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center' }}
                    >
                      <Edit2 size={9} aria-hidden="true" />
                    </button>
                  </div>

                  {/* Bio */}
                  <div style={{ marginBottom: '18px' }}>
                    {user.biography ? (
                      <p style={{ fontSize: '13.5px', color: '#555', lineHeight: 1.6 }}>{user.biography}</p>
                    ) : (
                      <button
                        onClick={() => setEditModal('about')}
                        style={{ fontSize: '13px', color: '#bbb', fontStyle: 'italic', background: 'none', border: '1.5px dashed #eee', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer' }}
                      >
                        + Add a bio
                      </button>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', alignItems: 'center' }}>
                    {(user.tags ?? []).length > 0 ? (
                      user.tags.map(tag => (
                        <span key={tag} style={{ padding: '4px 13px', borderRadius: '999px', background: '#fff0f2', color: '#e94057', fontSize: '12px', fontWeight: 500, border: '1px solid #ffd6db' }}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#ddd', fontStyle: 'italic' }}>No interests yet</span>
                    )}
                    <button
                      onClick={() => setEditModal('tags')}
                      style={{ padding: '4px 10px', borderRadius: '999px', background: '#fafafa', color: '#bbb', fontSize: '12px', fontWeight: 600, border: '1.5px dashed #eee', cursor: 'pointer' }}
                    >
                      + Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Photos strip ── */}
          <PhotosPanel user={user} onUpdate={setUser} />

          {/* ── About ── */}
          <AboutPanel user={user} onEditAbout={() => setEditModal('about')} onEditLocation={() => setEditModal('location')} />

          {/* ── Activity ── */}
          <ActivityPanel user={user} visitors={visitors} />

          {/* ── Logout ── */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            {logoutError && (
              <p style={{ fontSize: '11px', color: '#e94057', padding: '10px 22px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={10} aria-hidden="true" /> {logoutError}
              </p>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 22px', fontSize: '13px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer', opacity: loggingOut ? 0.6 : 1 }}
            >
              {loggingOut ? <Loader2 size={15} aria-hidden="true" /> : <LogOut size={15} aria-hidden="true" />}
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '88px' }}>
          <MessagesSidebar />
          <RecentVisitorsSidebar visitors={visitors} />
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
