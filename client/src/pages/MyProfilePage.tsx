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
  age: number | null;
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

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getMe: () =>
    fetch('/api/users/me', { credentials: 'include' })
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
      return d.user as UserProfile;
    }),

  getVisitors: () =>
    fetch('/api/profile/me/visitors', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.visitors as Visitor[]),

  getLikedBy: () =>
    fetch('/api/profile/me/liked-by', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.likers as Liker[]),

  updateLocation: (body: object) =>
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
      if (!r.ok) throw new Error('Logout failed');
    }),
};

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.address?.city
      ?? data.address?.town
      ?? data.address?.village
      ?? data.address?.county
      ?? null;
  } catch {
    return null;
  }
}
function CityName({ lat, lng, fallback }: { lat: number; lng: number; fallback: string | null }) {
  const [city, setCity] = useState<string | null>(fallback);

  useEffect(() => {
    if (!fallback && lat && lng) {
      reverseGeocode(lat, lng).then(c => { if (c) setCity(c); });
    }
  }, [lat, lng, fallback]);

  return <span>{city ?? `${lat.toFixed(2)}, ${lng.toFixed(2)}`}</span>;
}
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
          <AlertTriangle size={10} /> {error}
        </p>
      )}
      <button type="button" onClick={onCancel} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1.5px solid #eee', background: '#fff', color: '#888', cursor: 'pointer' }}>
        Cancel
      </button>
      <button type="button" onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', background: '#e94057', color: '#fff', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saving ? <Loader2 size={10} /> : <Check size={10} />} Save
      </button>
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function EditModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', margin: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>{title}</h3>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}>
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Edit modals ──────────────────────────────────────────────────────────────

function EditIdentityModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // const handleSave = async () => {
  //   if (!form.first_name.trim() || !form.last_name.trim()) { setError('Name is required.'); return; }
  //   setSaving(true); setError('');
  //   try { const u = await api.patchUser(form); onUpdate(u); onClose(); }
  //   catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
  //   finally { setSaving(false); }
  // };
const handleSave = async () => {
  if (!form.first_name.trim() || !form.last_name.trim()) { setError('Name is required.'); return; }

  const emailChanged = form.email !== user.email;

  if (emailChanged) {
    const confirmed = window.confirm('Changing your email will sign you out. You will need to verify your new email before logging back in. Continue?');
    if (!confirmed) return;
  }

  setSaving(true); setError('');
  try {
    const u = await api.patchUser(form);
    if (emailChanged) {
      await api.logout();
      navigate('/login');
      return;
    }
    onUpdate(u);
    onClose();
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Failed to save.');
  } finally {
    setSaving(false);
  }
};
  return (
    <EditModal title="Edit Identity" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {(['first_name', 'last_name'] as const).map(f => (
            <div key={f}>
              <label style={labelStyle}>{f === 'first_name' ? 'First name' : 'Last name'}</label>
              <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
        </div>
        <div>
          <label style={labelStyle}>Username</label>
          <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input value={form.email} type="email" onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
          <p style={{ fontSize: '10px', color: '#bbb', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={9} /> Changing your email requires re-verification.</p>
        </div>
        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}

function EditAboutModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const [form, setForm] = useState({ gender: user.gender ?? '', sexual_preference: user.sexual_preference ?? '', biography: user.biography ?? '', age: user.birth_date
    ? String(new Date().getFullYear() - new Date(user.birth_date).getFullYear())
    : ''  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

const handleSave = async () => {
  setSaving(true); setError('');
  try {
    const birthDate = form.age
      ? new Date(new Date().getFullYear() - parseInt(form.age), 0, 1).toISOString().split('T')[0]
      : null;
    const u = await api.patchProfile({
      ...form,
      birth_date: birthDate,
      age: undefined
    });
    onUpdate(u);
    onClose();
  }
  catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
  finally { setSaving(false); }
};

  return (
    <EditModal title="Edit About" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Age</label>
            <input value={form.age} type="number" min={18} max={99} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} style={inputStyle} placeholder="Your age" />
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <div style={{ position: 'relative' }}>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} style={{ ...inputStyle, appearance: 'none', paddingRight: '28px' }}>
                <option value="">Not specified</option>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Sexual orientation</label>
          <div style={{ position: 'relative' }}>
            <select value={form.sexual_preference} onChange={e => setForm(p => ({ ...p, sexual_preference: e.target.value }))} style={{ ...inputStyle, appearance: 'none', paddingRight: '28px' }}>
              <option value="">Not specified (defaults to bisexual)</option>
              {PREFERENCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
          </div>
          {!form.sexual_preference && <p style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={9} /> Will default to bisexual.</p>}
        </div>
        <div>
          <label style={labelStyle}>Biography</label>
          <textarea value={form.biography} onChange={e => setForm(p => ({ ...p, biography: e.target.value }))} maxLength={500} rows={4} placeholder="Tell others who you are…" style={{ ...inputStyle, resize: 'none' }} />
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

  const addTag = (tag: string) => {
    const n = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!n || n === '#' || tags.includes(n) || n.length < 2) return;
    setTags(t => [...t, n]); setInput('');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try { const t = await api.updateTags(tags); onUpdate({ ...user, tags: t }); onClose(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const available = SUGGESTED_TAGS.filter(t => !tags.includes(t));

  return (
    <EditModal title="Edit Interests" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input.trim()); } }}
            placeholder="#sport, #music…" style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => addTag(input.trim())} style={{ padding: '9px 14px', borderRadius: '10px', background: '#e94057', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Add</button>
        </div>
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map(tag => (
              <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', background: '#e94057', color: '#fff', fontSize: '12px', fontWeight: 500 }}>
                {tag}
                <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={9} /></button>
              </span>
            ))}
          </div>
        )}
        {available.length > 0 && (
          <div>
            <p style={labelStyle}>Quick add</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {available.map(tag => (
                <button key={tag} type="button" onClick={() => addTag(tag)} style={{ padding: '4px 12px', borderRadius: '999px', border: '1.5px solid #eee', background: '#fff', color: '#888', fontSize: '12px', cursor: 'pointer' }}>{tag}</button>
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
    user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null
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
    if (!cityInput.trim() && !gpsCoords) { setError('Location is required for matching.'); return; }
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = {};
      if (gpsCoords) { body.latitude = gpsCoords.lat; body.longitude = gpsCoords.lng; }
      if (cityInput.trim()) body.location_city = cityInput.trim();
      await api.updateLocation(body);
      onUpdate({ ...user, location_city: cityInput.trim() || user.location_city, latitude: gpsCoords?.lat ?? user.latitude, longitude: gpsCoords?.lng ?? user.longitude });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <EditModal title="Edit Location" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>GPS location</label>
          <button type="button" onClick={useGPS} disabled={gpsLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: `1.5px solid ${gpsCoords ? '#e94057' : '#eee'}`, background: gpsCoords ? 'rgba(233,64,87,0.06)' : '#fafafa', color: gpsCoords ? '#e94057' : '#888', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            {gpsLoading ? <Loader2 size={14} /> : <MapPin size={14} />}
            {gpsLoading ? 'Detecting…' : gpsCoords ? '✓ GPS detected' : 'Use my current location'}
          </button>
          <p style={{ fontSize: '10px', color: '#bbb', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={9} /> Only used for matching. You consent by clicking above.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          <span style={{ fontSize: '10px', color: '#ccc', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
        </div>
        <div>
          <label style={labelStyle}>City (manual)</label>
          <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="e.g. Paris, Marais district" style={inputStyle} />
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
  const slots: (Photo | null)[] = [...sorted, ...Array(5 - sorted.length).fill(null)].slice(0, 5);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    if (photos.length + files.length > 5) { setError('Max 5 photos.'); return; }
    setUploading(true); setError('');
    try {
      let updated = { ...user };
      for (const file of files) {
        const p = await api.uploadPhoto(file);
        updated = { ...updated, photos: [...updated.photos, p] };
        if (!updated.profile_picture_id) updated.profile_picture_id = p.id;
      }
      onUpdate(updated);
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deletePhoto(id);
      const remaining = photos.filter(p => p.id !== id);
      const newPicId = id === user.profile_picture_id ? (remaining[0]?.id ?? null) : user.profile_picture_id;
      onUpdate({ ...user, photos: remaining, profile_picture_id: newPicId });
    } catch (e) { setError(e instanceof Error ? e.message : 'Delete failed.'); }
  };

  // const handleSetMain = async (id: number) => {
  //   try { const u = await api.setMainPhoto(id); onUpdate(u); }
  //   catch (e) { setError(e instanceof Error ? e.message : 'Failed.'); }
  // };
  const handleSetMain = async (id: number) => {
    try {
      await api.setMainPhoto(id);
      onUpdate({ ...user, profile_picture_id: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    }
  };
  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 22px', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>Photos</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#bbb' }}>{photos.length}/5</span>
          {photos.length < 5 && (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ fontSize: '12px', fontWeight: 600, color: '#e94057', background: 'rgba(233,64,87,0.08)', border: 'none', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer' }}>
              + Add photo
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {slots.map((photo, i) => (
          <div key={photo?.id ?? `empty-${i}`} style={{ position: 'relative', flexShrink: 0, width: '140px', height: '180px', borderRadius: '14px', overflow: 'hidden', background: '#f9f9f9', border: '1.5px solid #f0f0f0', cursor: photo ? 'default' : 'pointer' }}
            onClick={() => !photo && fileRef.current?.click()}>
            {photo ? (
              <>
                <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {photo.id === user.profile_picture_id && (
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#e94057', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.05em' }}>MAIN</span>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                    {photo.id !== user.profile_picture_id && (
                      <button type="button" onClick={() => handleSetMain(photo.id)} title="Set as main" style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e94057' }}>
                        <Star size={12} />
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(photo.id)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ccc' }}>
                {uploading && i === photos.length ? <Loader2 size={20} /> : <Camera size={20} />}
                <span style={{ fontSize: '11px', fontWeight: 500 }}>Add</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} style={{ display: 'none' }} />
      {error && <p style={{ fontSize: '11px', color: '#e94057', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={10} /> {error}</p>}
    </div>
  );
}

// ─── About panel ──────────────────────────────────────────────────────────────

function AboutPanel({ user, onEditAbout, onEditLocation }: { user: UserProfile; onEditAbout: () => void; onEditLocation: () => void }) {
  const genderLabel = GENDERS.find(g => g.value === user.gender)?.label;
  const prefLabel = PREFERENCES.find(p => p.value === user.sexual_preference)?.label
    ?? `${PREFERENCES.find(p => p.value === DEFAULT_PREFERENCE)?.label} (default)`;
  const lat = user.latitude != null ? Number(user.latitude) : null;
  const lng = user.longitude != null ? Number(user.longitude) : null;

  const rows = [
    // { label: 'City', value: user.location_city ?? (lat ? `${lat.toFixed(3)}, ${lng?.toFixed(3)}` : null), action: onEditLocation },
    { label: 'City', value: user.location_city ?? (lat ? `${lat.toFixed(3)}, ${lng?.toFixed(3)}` : null), action: onEditLocation, lat, lng },
    { label: 'Age', value: user.birth_date
    ? `${new Date().getFullYear() - new Date(user.birth_date).getFullYear()} years old`
    : null, action: onEditAbout },
    { label: 'Gender', value: genderLabel ?? null, action: onEditAbout },
    { label: 'Orientation', value: prefLabel, action: onEditAbout },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 22px', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>About</h3>
        <button onClick={onEditAbout} style={{ fontSize: '12px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Edit2 size={11} /> Edit
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
        {/* {rows.map(({ label, value }) => (
          <div key={label} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
            <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '13px', fontWeight: 500, color: value ? '#333' : '#ddd' }}>
              {value ?? '—'}
            </p>
          </div>
        ))} */}
        {rows.map(({ label, value, lat, lng }) => (
          <div key={label} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
            <p style={{ fontSize: '11px', color: '#bbb', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '13px', fontWeight: 500, color: value ? '#333' : '#ddd' }}>
              {label === 'City' && lat
                ? <CityName lat={lat} lng={lng!} fallback={user.location_city} />
                : value ?? '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity panel ───────────────────────────────────────────────────────────

function ActivityPanel({ user }: { user: UserProfile }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [likers, setLikers] = useState<Liker[]>([]);
  const [tab, setTab] = useState<'visitors' | 'likers'>('visitors');
  const [loading, setLoading] = useState(true);
  const fame = Math.min(100, Math.max(0, user.fame_rating ?? 0));

  useEffect(() => {
    Promise.all([api.getVisitors(), api.getLikedBy()])
      .then(([v, l]) => { setVisitors(v ?? []); setLikers(l ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const list = tab === 'visitors' ? visitors : likers;

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 22px', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>Fame & Activity</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={12} style={{ color: '#e94057' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#e94057' }}>{fame}</span>
        </div>
      </div>

      <div style={{ height: '6px', borderRadius: '999px', background: '#f5f5f5', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '999px', background: '#e94057', width: `${fame}%`, transition: 'width 0.7s ease' }} />
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #f5f5f5', marginBottom: '12px' }}>
        {[
          { key: 'visitors' as const, label: 'Visitors', icon: Eye, count: visitors.length },
          { key: 'likers' as const, label: 'Liked me', icon: Heart, count: likers.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 0', marginRight: '20px', fontSize: '12px', fontWeight: 600, color: tab === key ? '#e94057' : '#bbb', background: 'none', border: 'none', borderBottom: `2px solid ${tab === key ? '#e94057' : 'transparent'}`, cursor: 'pointer', marginBottom: '-1px' }}>
            <Icon size={11} /> {label}
            <span style={{ marginLeft: '2px', padding: '1px 6px', borderRadius: '999px', background: tab === key ? '#e94057' : '#f5f5f5', color: tab === key ? '#fff' : '#aaa', fontSize: '9px', fontWeight: 700 }}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 size={16} style={{ color: '#ddd' }} /></div>
      ) : list.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '200px', overflowY: 'auto' }}>
          {list.map(item => {
            const time = 'visited_at' in item ? item.visited_at : item.liked_at;
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid #f9f9f9' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f5f5', overflow: 'hidden', flexShrink: 0, border: '1.5px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#e94057' }}>
                  {item.profile_picture_url ? <img src={item.profile_picture_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : item.first_name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.first_name} {item.last_name}</p>
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
  // Placeholder messages — in real app these come from the chat API
  const mockChats = [
    { id: 1, name: 'Sofia M.', avatar: null, initials: 'SM', preview: "Hey, how are you doing?", time: '4:20 am', online: true },
    { id: 2, name: 'Lucas B.', avatar: null, initials: 'LB', preview: "I'm down for coffee!", time: '2:09 am', online: true },
    { id: 3, name: 'Amira K.', avatar: null, initials: 'AK', preview: "Lol that's so funny 😂", time: '2:02 am', online: true },
    { id: 4, name: 'Remi C.', avatar: null, initials: 'RC', preview: "Did you see my last message?", time: '1:56 am', online: false },
    { id: 5, name: 'Yuki T.', avatar: null, initials: 'YT', preview: "You: Aww, thank you!", time: '1:04 am', online: false },
  ];
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');

  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222' }}>Messages</h3>
          <button onClick={() => navigate('/chat')} style={{ fontSize: '12px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid #f5f5f5' }}>
          {(['chats', 'requests'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '8px 0', fontSize: '12px', fontWeight: 600, color: activeTab === t ? '#e94057' : '#bbb', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t ? '#e94057' : 'transparent'}`, cursor: 'pointer', marginBottom: '-1px', textTransform: 'capitalize' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '4px 0' }}>
        {mockChats.map(chat => (
          <div key={chat.id} onClick={() => navigate('/chat')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffe4e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#e94057', overflow: 'hidden' }}>
                {chat.avatar ? <img src={chat.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : chat.initials}
              </div>
              {chat.online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: '11px', height: '11px', borderRadius: '50%', background: '#4ade80', border: '2px solid #fff' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#222', marginBottom: '1px' }}>{chat.name}</p>
              <p style={{ fontSize: '11px', color: '#bbb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.preview}</p>
            </div>
            <span style={{ fontSize: '10px', color: '#ccc', flexShrink: 0 }}>{chat.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar: Online contacts ─────────────────────────────────────────────────

function OnlineContactsSidebar({ visitors }: { visitors: Visitor[] }) {
  const navigate = useNavigate();
  // Show visitors as "contacts online" — in real app use a dedicated endpoint
  const online = visitors.slice(0, 8);
  const colors = ['#e94057', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', padding: '18px 20px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#222', marginBottom: '14px' }}>Online now</h3>
      {online.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {online.map((v, i) => (
              <div key={v.id} onClick={() => navigate(`/profile/${v.username}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${colors[i % colors.length]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: colors[i % colors.length], overflow: 'hidden', border: `2px solid ${colors[i % colors.length]}44` }}>
                    {v.profile_picture_url ? <img src={v.profile_picture_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : v.first_name[0]}
                  </div>
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', border: '2px solid #fff' }} />
                </div>
                <span style={{ fontSize: '10px', color: '#888', textAlign: 'center', maxWidth: '44px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.first_name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#ccc', fontStyle: 'italic' }}>No one online right now.</p>
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

  // Edit modal state
  const [editModal, setEditModal] = useState<'identity' | 'about' | 'tags' | 'location' | null>(null);

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .catch(e => setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'))
      .finally(() => setLoading(false));
    api.getVisitors().then(setVisitors).catch(() => {});
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} style={{ color: '#e94057' }} />
    </div>
  );

  if (fetchError || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '14px', color: '#aaa' }}>{fetchError || 'Profile not found.'}</p>
      <button onClick={() => navigate('/login')} style={{ fontSize: '13px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: 'pointer' }}>Back to login</button>
    </div>
  );

  const mainPhoto = user.photos?.find(p => p.id === user.profile_picture_id) ?? user.photos?.[0];

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.logout(); } catch {}
    navigate('/login');
  };

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

          {/* ── Hero card: photo + info ── */}
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '260px' }}>

              {/* Profile photo */}
              <div style={{ position: 'relative', background: '#f5f5f5' }}>
                {mainPhoto ? (
                  <img src={mainPhoto.url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ccc', minHeight: '260px', cursor: 'pointer' }}
                    onClick={() => document.getElementById('photo-upload')?.click()}>
                    <Camera size={32} />
                    <span style={{ fontSize: '12px' }}>Add photo</span>
                  </div>
                )}
                {user.is_online && (
                  <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#4ade80', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.05em' }}>● ONLINE</span>
                )}
              </div>

              {/* Name / bio / tags */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Name row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>
                        {user.first_name} {user.last_name}{user.birth_date ? `, ${new Date().getFullYear() - new Date(user.birth_date).getFullYear()}` : ''}
                      </h1>
                      <CheckCircle2 size={18} style={{ color: '#e94057', flexShrink: 0 }} />
                    </div>
                    <button onClick={() => setEditModal('identity')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#e94057', background: 'rgba(233,64,87,0.08)', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}>
                      <Edit2 size={10} /> Edit
                    </button>
                  </div>

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
                    <MapPin size={12} style={{ color: '#e94057' }} />
                    <span style={{ fontSize: '13px', color: '#aaa' }}>
                      {/* {user.location_city ?? (user.latitude ? `${Number(user.latitude).toFixed(2)}, ${Number(user.longitude).toFixed(2)}` : 'Location not set')} */}
                      {user.location_city
                        ? user.location_city
                        : user.latitude
                          ? <CityName lat={Number(user.latitude)} lng={Number(user.longitude)} fallback={null} />
                          : 'Location not set'}
                    </span>
                    <button onClick={() => setEditModal('location')} style={{ marginLeft: '4px', fontSize: '10px', color: '#e94057', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
                      <Edit2 size={9} />
                    </button>
                  </div>

                  {/* Bio */}
                  <div style={{ marginBottom: '18px' }}>
                    {user.biography ? (
                      <p style={{ fontSize: '13.5px', color: '#555', lineHeight: 1.6 }}>{user.biography}</p>
                    ) : (
                      <button onClick={() => setEditModal('about')} style={{ fontSize: '13px', color: '#bbb', fontStyle: 'italic', background: 'none', border: '1.5px dashed #eee', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer' }}>
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
                    <button onClick={() => setEditModal('tags')} style={{ padding: '4px 10px', borderRadius: '999px', background: '#fafafa', color: '#bbb', fontSize: '12px', fontWeight: 600, border: '1.5px dashed #eee', cursor: 'pointer' }}>
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
          <ActivityPanel user={user} />

          {/* ── Logout ── */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <button onClick={handleLogout} disabled={loggingOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 22px', fontSize: '13px', fontWeight: 600, color: '#e94057', background: 'none', border: 'none', cursor: 'pointer', opacity: loggingOut ? 0.6 : 1 }}>
              {loggingOut ? <Loader2 size={15} /> : <LogOut size={15} />}
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '88px' }}>
          <MessagesSidebar />
          <OnlineContactsSidebar visitors={visitors} />
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
