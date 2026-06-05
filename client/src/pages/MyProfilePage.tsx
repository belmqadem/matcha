import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, X, Check, Edit2, MapPin, Heart, Star, Eye, ChevronDown,
  Loader2, LogOut, AlertTriangle, Shield, Info, CheckCircle2
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

// ─── Constants & Helpers ──────────────────────────────────────────────────────

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
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    return data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.county ?? null;
  } catch {
    return null;
  }
}

function CityName({ lat, lng, fallback }: { lat: number; lng: number; fallback: string | null }) {
  const [city, setCity] = useState<string | null>(fallback);
  useEffect(() => {
    if (!fallback && lat && lng) reverseGeocode(lat, lng).then(c => { if (c) setCity(c); });
  }, [lat, lng, fallback]);
  return <span>{city ?? `${lat.toFixed(2)}, ${lng.toFixed(2)}`}</span>;
}

// ─── Cute UI Components ───────────────────────────────────────────────────────

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 12 }).map((_, i) => {
        const size = Math.random() * 20 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 15;
        const delay = -(Math.random() * 20);
        return (
          <div key={i} className="absolute text-[var(--color-primary)] opacity-20 drop-shadow-sm" style={{ top: 0, left: `${left}%`, fontSize: `${size}px`, animation: `float-cute ${duration}s ease-in-out infinite`, animationDelay: `${delay}s` }}>
            ♥
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared UI Elements ───────────────────────────────────────────────────────

const InputClasses = "w-full bg-[var(--color-background)] border-2 border-transparent rounded-[16px] px-4 py-3 text-[14px] font-bold text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] transition-all";
const LabelClasses = "block text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-muted)] mb-2";

function SaveBar({ saving, error, onSave, onCancel }: { saving: boolean; error: string; onSave: () => void; onCancel: () => void; }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t-2 border-[var(--color-background)]">
      {error && (
        <p className="flex-1 text-[12px] font-bold text-[var(--color-error)] flex items-center gap-1.5">
          <AlertTriangle size={14} /> {error}
        </p>
      )}
      <button type="button" onClick={onCancel} className="px-5 py-2.5 text-[13px] font-bold rounded-xl border-2 border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)] transition-all">
        Cancel
      </button>
      <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold rounded-xl bg-[var(--color-primary)] text-white border-none cursor-pointer hover:shadow-md transition-all disabled:opacity-60 active:scale-95">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
      </button>
    </div>
  );
}

function EditModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-[32px] p-7 w-full max-w-[480px] max-h-[85vh] overflow-y-auto shadow-2xl animate-[fadeUp_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-[var(--color-text)]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-background)] transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Edit Modals ──────────────────────────────────────────────────────────────

function EditIdentityModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      if (emailChanged) { await api.logout(); navigate('/login'); return; }
      onUpdate(u);
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <EditModal title="Edit Identity" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          {(['first_name', 'last_name'] as const).map(f => (
            <div key={f}>
              <label className={LabelClasses}>{f === 'first_name' ? 'First name' : 'Last name'}</label>
              <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} className={InputClasses} />
            </div>
          ))}
        </div>
        <div>
          <label className={LabelClasses}>Username</label>
          <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className={InputClasses} />
        </div>
        <div>
          <label className={LabelClasses}>Email</label>
          <input value={form.email} type="email" onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={InputClasses} />
          <p className="text-[11px] font-bold text-amber-500 mt-2 flex items-center gap-1.5"><Shield size={12} /> Changing your email requires re-verification.</p>
        </div>
        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}

function EditAboutModal({ user, onUpdate, onClose }: { user: UserProfile; onUpdate: (u: UserProfile) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    gender: user.gender ?? '',
    sexual_preference: user.sexual_preference ?? '',
    biography: user.biography ?? '',
    age: user.birth_date ? String(new Date().getFullYear() - new Date(user.birth_date).getFullYear()) : ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.age || parseInt(form.age) < 18) { setError('You must be at least 18.'); return; }
    setSaving(true); setError('');
    try {
      const birthDate = form.age ? new Date(new Date().getFullYear() - parseInt(form.age), 0, 1).toISOString().split('T')[0] : null;
      const u = await api.patchProfile({ ...form, birth_date: birthDate, age: undefined });
      onUpdate(u);
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <EditModal title="Edit About" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LabelClasses}>Age</label>
            <input value={form.age} type="number" min={18} max={99} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} className={InputClasses} placeholder="Your age" />
          </div>
          <div>
            <label className={LabelClasses}>Gender</label>
            <div className="relative">
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className={`${InputClasses} appearance-none pr-10 cursor-pointer`}>
                <option value="">Not specified</option>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>
        <div>
          <label className={LabelClasses}>Sexual orientation</label>
          <div className="relative">
            <select value={form.sexual_preference} onChange={e => setForm(p => ({ ...p, sexual_preference: e.target.value }))} className={`${InputClasses} appearance-none pr-10 cursor-pointer`}>
              <option value="">Not specified (defaults to bisexual)</option>
              {PREFERENCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
          {!form.sexual_preference && <p className="text-[11px] font-bold text-amber-500 mt-2 flex items-center gap-1.5"><Info size={12} /> Will default to bisexual.</p>}
        </div>
        <div>
          <label className={LabelClasses}>Biography</label>
          <textarea value={form.biography} onChange={e => setForm(p => ({ ...p, biography: e.target.value }))} maxLength={500} rows={4} placeholder="Tell others who you are…" className={`${InputClasses} resize-none`} />
          <p className="text-right text-[11px] font-bold text-[var(--color-text-muted)] mt-1.5">{form.biography.length}/500</p>
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
      <div className="flex flex-col gap-5">
        <div className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input.trim()); } }} placeholder="#sport, #music…" className={InputClasses} />
          <button type="button" onClick={() => addTag(input.trim())} className="px-6 rounded-xl bg-[var(--color-primary)] text-white font-bold cursor-pointer hover:shadow-md active:scale-95 transition-all">Add</button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-primary)] text-white text-[13px] font-bold shadow-sm">
                {tag}
                <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} className="bg-white/20 rounded-full p-0.5 hover:bg-white/40 transition-colors cursor-pointer"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
        {available.length > 0 && (
          <div>
            <p className={LabelClasses}>Quick add</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {available.map(tag => (
                <button key={tag} type="button" onClick={() => addTag(tag)} className="px-3 py-1.5 rounded-full border-2 border-[var(--color-border)] bg-white text-[var(--color-text-muted)] text-[13px] font-bold cursor-pointer hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">{tag}</button>
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

  // 🛠️ FIX: API requires latitude and longitude. We secretly attach existing GPS if they only edit the city.
  const handleSave = async () => {
    const finalLat = gpsCoords?.lat ?? user.latitude;
    const finalLng = gpsCoords?.lng ?? user.longitude;

    if (finalLat === null || finalLng === null) {
      setError('GPS coordinates are required by the server. Please detect location.');
      return;
    }

    setSaving(true); setError('');
    try {
      const body = {
        latitude: finalLat,
        longitude: finalLng,
        location_city: cityInput.trim() || undefined
      };
      await api.updateLocation(body);
      onUpdate({ ...user, location_city: cityInput.trim() || user.location_city, latitude: finalLat, longitude: finalLng });
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <EditModal title="Edit Location" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div>
          <label className={LabelClasses}>GPS location</label>
          <button type="button" onClick={useGPS} disabled={gpsLoading} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 text-[14px] font-bold cursor-pointer transition-all active:scale-95 ${gpsCoords ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
            {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
            {gpsLoading ? 'Detecting coordinates…' : gpsCoords ? '✓ GPS Coordinates detected' : 'Use my current GPS location'}
          </button>
          <p className="text-[11px] font-bold text-amber-500 mt-2 flex items-center gap-1.5"><Shield size={12} /> Only used for distance calculation.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-0.5 bg-[var(--color-background)]" />
          <span className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">or</span>
          <div className="flex-1 h-0.5 bg-[var(--color-background)]" />
        </div>

        <div>
          <label className={LabelClasses}>City Name (Display only)</label>
          <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="e.g. Paris, Marais district" className={InputClasses} />
        </div>
        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

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

  const handleSetMain = async (id: number) => {
    try {
      await api.setMainPhoto(id);
      onUpdate({ ...user, profile_picture_id: id });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed.'); }
  };

  return (
    <div className="bg-white rounded-[32px] p-7 border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-black text-[var(--color-text)]">Photos</h3>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-[var(--color-text-muted)]">{photos.length}/5</span>
          {photos.length < 5 && (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-[13px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-1.5 rounded-full cursor-pointer hover:bg-[var(--color-primary)]/20 transition-colors">
              + Add photo
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
        {slots.map((photo, i) => (
          <div key={photo?.id ?? `empty-${i}`} className={`relative flex-shrink-0 w-[140px] h-[180px] rounded-2xl overflow-hidden bg-[var(--color-background)] border-2 border-[var(--color-border)] snap-start group ${!photo && 'cursor-pointer hover:border-[var(--color-primary)] transition-colors'}`} onClick={() => !photo && fileRef.current?.click()}>
            {photo ? (
              <>
                <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                {photo.id === user.profile_picture_id && (
                  <span className="absolute top-2 left-2 bg-[var(--color-primary)] text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest shadow-md">MAIN</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.id !== user.profile_picture_id && (
                      <button type="button" onClick={() => handleSetMain(photo.id)} title="Set as main" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] cursor-pointer shadow-sm hover:scale-110 transition-transform"><Star size={14} className="fill-current" /></button>
                    )}
                    <button type="button" onClick={() => handleDelete(photo.id)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--color-text)] cursor-pointer shadow-sm hover:scale-110 hover:text-[var(--color-error)] transition-transform"><X size={14} /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)] opacity-60">
                {uploading && i === photos.length ? <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" /> : <Camera size={24} />}
                <span className="text-[12px] font-bold">Add</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} className="hidden" />
      {error && <p className="text-[12px] font-bold text-[var(--color-error)] mt-3 flex items-center gap-1.5"><AlertTriangle size={14} /> {error}</p>}
    </div>
  );
}

function AboutPanel({ user, onEditAbout, onEditLocation }: { user: UserProfile; onEditAbout: () => void; onEditLocation: () => void }) {
  const genderLabel = GENDERS.find(g => g.value === user.gender)?.label;
  const prefLabel = PREFERENCES.find(p => p.value === user.sexual_preference)?.label ?? `${PREFERENCES.find(p => p.value === DEFAULT_PREFERENCE)?.label}`;
  const lat = user.latitude != null ? Number(user.latitude) : null;
  const lng = user.longitude != null ? Number(user.longitude) : null;

  const rows = [
    { label: 'City', value: user.location_city ?? (lat ? `${lat.toFixed(3)}, ${lng?.toFixed(3)}` : null), action: onEditLocation, lat, lng },
    { label: 'Age', value: user.birth_date ? `${new Date().getFullYear() - new Date(user.birth_date).getFullYear()} years old` : null, action: onEditAbout },
    { label: 'Gender', value: genderLabel ?? null, action: onEditAbout },
    { label: 'Orientation', value: prefLabel, action: onEditAbout },
  ];

  return (
    <div className="bg-white rounded-[32px] p-7 border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-black text-[var(--color-text)]">About Me</h3>
        <button onClick={onEditAbout} className="text-[13px] font-bold text-[var(--color-primary)] flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity">
          <Edit2 size={14} /> Edit Data
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {rows.map(({ label, value, lat, lng }) => (
          <div key={label} className="border-b-2 border-[var(--color-background)] pb-3">
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-[15px] font-bold ${value ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] opacity-60'}`}>
              {label === 'City' && lat ? <CityName lat={lat} lng={lng!} fallback={user.location_city} /> : value ?? 'Not set'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="bg-white rounded-[32px] p-7 border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-black text-[var(--color-text)]">Fame & Activity</h3>
        <div className="flex items-center gap-2 bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full">
          <Star size={16} className="text-[var(--color-primary)] fill-current" />
          <span className="text-[15px] font-black text-[var(--color-primary)]">{fame}</span>
        </div>
      </div>

      <div className="h-2.5 rounded-full bg-[var(--color-background)] overflow-hidden mb-6">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-pink-400 transition-all duration-1000 ease-out" style={{ width: `${fame}%` }} />
      </div>

      <div className="flex border-b-2 border-[var(--color-background)] mb-4">
        {[
          { key: 'visitors' as const, label: 'Profile Views', icon: Eye, count: visitors.length },
          { key: 'likers' as const, label: 'Likes Received', icon: Heart, count: likers.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-1 py-3 mr-6 text-[14px] font-bold border-b-2 cursor-pointer transition-all ${tab === key ? 'text-[var(--color-primary)] border-[var(--color-primary)]' : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)]'}`}>
            <Icon size={16} /> {label}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${tab === key ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-muted)]'}`}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-[var(--color-primary)]" /></div>
      ) : list.length > 0 ? (
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          {list.map(item => {
            const time = 'visited_at' in item ? item.visited_at : item.liked_at;
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--color-background)] border border-transparent hover:border-[var(--color-border)] transition-colors">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[var(--color-primary)]/20 bg-white text-[var(--color-primary)] flex items-center justify-center font-black text-lg">
                  {item.profile_picture_url ? <img src={item.profile_picture_url} alt="" className="w-full h-full object-cover" /> : item.first_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-[var(--color-text)] truncate">{item.first_name} {item.last_name}</p>
                  <p className="text-[13px] font-medium text-[var(--color-text-muted)]">@{item.username}</p>
                </div>
                <span className="text-[12px] font-bold text-[var(--color-text-muted)] shrink-0">{timeAgo(time)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center flex flex-col items-center gap-2">
          <Eye size={32} className="text-[var(--color-border)]" />
          <p className="text-[14px] font-bold text-[var(--color-text-muted)]">No activity yet. Upload a great photo to get noticed!</p>
        </div>
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

  const [editModal, setEditModal] = useState<'identity' | 'about' | 'tags' | 'location' | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .catch(e => setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
    </div>
  );

  if (fetchError || !user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-background)]">
      <p className="text-[15px] font-medium text-[var(--color-text-muted)]">{fetchError || 'Profile not found.'}</p>
      <button onClick={() => navigate('/login')} className="text-[14px] font-bold text-[var(--color-primary)] bg-white px-6 py-2 rounded-full shadow-sm">Back to login</button>
    </div>
  );

  const mainPhoto = user.photos?.find(p => p.id === user.profile_picture_id) ?? user.photos?.[0];

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.logout(); } catch {}
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] font-[var(--font-primary)] pb-20">

      <style>{`
        @keyframes float-cute {
          0%   { transform: translateY(110vh) translateX(-15px) rotate(-15deg) scale(0.8); opacity: 0; }
          10%  { opacity: 0.15; }
          25%  { transform: translateY(75vh) translateX(20px) rotate(10deg) scale(1.1); }
          50%  { transform: translateY(40vh) translateX(-20px) rotate(-10deg) scale(0.9); }
          75%  { transform: translateY(10vh) translateX(15px) rotate(15deg) scale(1.2); }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-20vh) translateX(-10px) rotate(-15deg) scale(0.8); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Decorative Floating Hearts */}
      <FloatingHearts />

      {/* ── Edit modals ── */}
      {editModal === 'identity' && <EditIdentityModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'about' && <EditAboutModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'tags' && <EditTagsModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}
      {editModal === 'location' && <EditLocationModal user={user} onUpdate={setUser} onClose={() => setEditModal(null)} />}

      {/* 🛠️ FIX: Centered the layout and removed the 320px column holding the fake chats */}
      <div className="relative z-10 max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-6">

        {/* ── Hero card: photo + info ── */}
        <div className="bg-white rounded-[32px] border border-[var(--color-border)] shadow-sm overflow-hidden animate-[fadeUp_0.4s_ease-out]">
          <div className="flex flex-col sm:flex-row min-h-[280px]">

            {/* Profile photo */}
            <div className="relative w-full sm:w-[280px] bg-[var(--color-background)] shrink-0">
              {mainPhoto ? (
                <img src={mainPhoto.url} alt="Profile" className="w-full h-full object-cover block" />
              ) : (
                <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-border)] transition-colors" onClick={() => setEditModal('identity')}>
                  <Camera size={40} />
                  <span className="text-[14px] font-bold">Add main photo</span>
                </div>
              )}
              {user.is_online && (
                <span className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> ONLINE
                </span>
              )}
            </div>

            {/* Name / bio / tags */}
            <div className="p-8 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-[28px] font-black text-[var(--color-text)] leading-tight tracking-tight">
                      {user.first_name} {user.last_name}{user.birth_date ? <span className="font-medium opacity-80">, {new Date().getFullYear() - new Date(user.birth_date).getFullYear()}</span> : ''}
                    </h1>
                    <CheckCircle2 size={24} className="text-[var(--color-primary)] flex-shrink-0" />
                  </div>
                  <button onClick={() => setEditModal('identity')} className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--color-primary)]/20 transition-colors shrink-0">
                    <Edit2 size={12} /> Edit
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={16} className="text-[var(--color-primary)]" />
                  <span className="text-[15px] font-bold text-[var(--color-text-muted)]">
                    {user.location_city ? user.location_city : user.latitude ? <CityName lat={Number(user.latitude)} lng={Number(user.longitude)} fallback={null} /> : 'Location not set'}
                  </span>
                  <button onClick={() => setEditModal('location')} className="text-[var(--color-primary)] hover:opacity-70 transition-opacity cursor-pointer p-1"><Edit2 size={12} /></button>
                </div>

                <div className="mb-6">
                  {user.biography ? (
                    <p className="text-[15px] text-[var(--color-text)] leading-relaxed font-medium opacity-80">"{user.biography}"</p>
                  ) : (
                    <button onClick={() => setEditModal('about')} className="text-[14px] font-bold text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)] rounded-xl px-5 py-3 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer">
                      + Add a bio about yourself
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {(user.tags ?? []).length > 0 ? (
                    user.tags.map(tag => (
                      <span key={tag} className="px-4 py-1.5 rounded-full bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-[13px] font-bold border-2 border-[var(--color-primary)]/10">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[13px] font-bold text-[var(--color-text-muted)] italic">No interests added yet</span>
                  )}
                  <button onClick={() => setEditModal('tags')} className="px-4 py-1.5 rounded-full bg-[var(--color-background)] text-[var(--color-text-muted)] text-[13px] font-bold border-2 border-dashed border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
                    + Edit Interests
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-[fadeUp_0.5s_ease-out]">
          <PhotosPanel user={user} onUpdate={setUser} />
        </div>

        <div className="animate-[fadeUp_0.6s_ease-out]">
          <AboutPanel user={user} onEditAbout={() => setEditModal('about')} onEditLocation={() => setEditModal('location')} />
        </div>

        <div className="animate-[fadeUp_0.7s_ease-out]">
          <ActivityPanel user={user} />
        </div>

        {/* ── Logout ── */}
        <div className="bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-sm animate-[fadeUp_0.8s_ease-out]">
          <button onClick={handleLogout} disabled={loggingOut} className="w-full flex justify-center items-center gap-3 py-5 text-[15px] font-black text-[var(--color-error)] hover:bg-[var(--color-error)]/5 cursor-pointer transition-colors disabled:opacity-50">
            {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            {loggingOut ? 'Signing out safely…' : 'Sign out of your account'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MyProfilePage;
