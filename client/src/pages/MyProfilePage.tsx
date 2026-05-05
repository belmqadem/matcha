import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, X, Check, Edit2, Save, MapPin, Tag, User,
  Heart, Star, Eye, ChevronDown, Loader2,
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
}

interface Visitor {
  id: number; username: string; first_name: string; last_name: string;
  profile_picture_url: string | null; visited_at: string;
}
interface Liker {
  id: number; username: string; first_name: string; last_name: string;
  profile_picture_url: string | null; liked_at: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  getMe: () =>
    fetch('/api/users/me', { credentials: 'include' })
      .then(r => r.json()).then(d => d.user as UserProfile),

  patchUser: (body: object) =>
    fetch('/api/users/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(body),
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.user as UserProfile;
    }),

  patchProfile: (body: object) =>
    fetch('/api/profile/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(body),
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.user as UserProfile;
    }),

  updateTags: (tags: string[]) =>
    fetch('/api/profile/me/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ tags }),
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.tags as string[];
    }),

  uploadPhoto: (file: File) => {
    const fd = new FormData(); fd.append('photo', file);
    return fetch('/api/profile/me/photos', { method: 'POST', credentials: 'include', body: fd })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); return d.photo as Photo; });
  },

  deletePhoto: (id: number) =>
    fetch(`/api/profile/me/photos/${id}`, { method: 'DELETE', credentials: 'include' })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); }),

  setMainPhoto: (id: number) =>
    fetch(`/api/profile/me/photos/${id}/set-main`, { method: 'PATCH', credentials: 'include' })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); }),

  getVisitors: () =>
    fetch('/api/profile/me/visitors', { credentials: 'include' })
      .then(r => r.json()).then(d => d.visitors as Visitor[]),

  getLikedBy: () =>
    fetch('/api/profile/me/liked-by', { credentials: 'include' })
      .then(r => r.json()).then(d => d.likers as Liker[]),

  updateLocation: (body: object) =>
    fetch('/api/profile/me/location', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(body),
    }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`); return d; }),
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_TAGS = ['#vegan','#geek','#piercing','#fitness','#travel','#music','#art','#gaming','#hiking','#foodie'];
const GENDERS = [{ value:'male',label:'Man'},{ value:'female',label:'Woman'},{ value:'non_binary',label:'Non-binary'},{ value:'other',label:'Other'}];
const PREFERENCES = [{ value:'heterosexual',label:'Heterosexual'},{ value:'homosexual',label:'Homosexual'},{ value:'bisexual',label:'Bisexual'}];

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/80 p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-rose-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const SaveBar = ({ saving, error, onSave, onCancel }: { saving: boolean; error: string; onSave: () => void; onCancel: () => void }) => (
  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 mt-3">
    {error ? <p className="text-xs text-red-500 flex-1">{error}</p> : <span className="flex-1" />}
    <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors">Cancel</button>
    <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 disabled:opacity-60 transition-colors">
      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
    </button>
  </div>
);

// ─── Basic Info ───────────────────────────────────────────────────────────────

function BasicInfoSection({ user, onUpdate }: { user: UserProfile; onUpdate: (u: UserProfile) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true); setError('');
    try { const u = await api.patchUser(form); onUpdate(u); setEditing(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setForm({ first_name: user.first_name, last_name: user.last_name, username: user.username, email: user.email }); setError(''); setEditing(false); };

  return (
    <SectionCard title="Basic Info" icon={User}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs text-gray-400">Your name, username, and email.</p>
        {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium"><Edit2 size={11} /> Edit</button>}
      </div>
      {editing ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            {(['first_name', 'last_name'] as const).map(f => (
              <div key={f}>
                <label className="text-[10px] text-gray-400 uppercase tracking-wide">{f === 'first_name' ? 'First name' : 'Last name'}</label>
                <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} className="w-full mt-0.5 rounded-xl border border-gray-200 bg-white/60 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-rose-400 transition-colors" />
              </div>
            ))}
          </div>
          {(['username', 'email'] as const).map(f => (
            <div key={f}>
              <label className="text-[10px] text-gray-400 uppercase tracking-wide">{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} type={f === 'email' ? 'email' : 'text'} className="w-full mt-0.5 rounded-xl border border-gray-200 bg-white/60 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-rose-400 transition-colors" />
            </div>
          ))}
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[{ label: 'First name', value: user.first_name }, { label: 'Last name', value: user.last_name }].map(({ label, value }) => (
              <div key={label}><p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p><p className="text-sm text-gray-700 font-medium">{value}</p></div>
            ))}
          </div>
          {[{ label: 'Username', value: `@${user.username}` }, { label: 'Email', value: user.email }].map(({ label, value }) => (
            <div key={label}><p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p><p className="text-sm text-gray-700 font-medium">{value}</p></div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function AboutSection({ user, onUpdate }: { user: UserProfile; onUpdate: (u: UserProfile) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ gender: user.gender ?? '', sexual_preference: user.sexual_preference ?? '', biography: user.biography ?? '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true); setError('');
    try { const u = await api.patchProfile(form); onUpdate(u); setEditing(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setForm({ gender: user.gender ?? '', sexual_preference: user.sexual_preference ?? '', biography: user.biography ?? '' }); setError(''); setEditing(false); };

  const genderLabel = GENDERS.find(g => g.value === user.gender)?.label;
  const prefLabel = PREFERENCES.find(p => p.value === user.sexual_preference)?.label;

  return (
    <SectionCard title="About Me" icon={Heart}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs text-gray-400">Gender, preference, and bio.</p>
        {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium"><Edit2 size={11} /> Edit</button>}
      </div>
      {editing ? (
        <div className="space-y-2.5">
          {[{ label: 'Gender', key: 'gender' as const, opts: GENDERS }, { label: "Interested in", key: 'sexual_preference' as const, opts: PREFERENCES }].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</label>
              <div className="relative mt-0.5">
                <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="w-full appearance-none rounded-xl border border-gray-200 bg-white/60 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-rose-400 pr-8">
                  <option value="">Select…</option>
                  {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-wide">Biography</label>
            <textarea value={form.biography} onChange={e => setForm(p => ({ ...p, biography: e.target.value }))} maxLength={500} rows={4} className="w-full mt-0.5 rounded-xl border border-gray-200 bg-white/60 px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:border-rose-400" />
            <p className="text-right text-[10px] text-gray-400">{form.biography.length}/500</p>
          </div>
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex gap-2 flex-wrap">
            {genderLabel && <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium border border-rose-100">{genderLabel}</span>}
            {prefLabel && <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-medium border border-pink-100">{prefLabel}</span>}
            {!genderLabel && !prefLabel && <p className="text-xs text-gray-400 italic">Not filled in yet.</p>}
          </div>
          {user.biography ? <p className="text-sm text-gray-600 leading-relaxed">{user.biography}</p> : <p className="text-xs text-gray-400 italic">No bio yet.</p>}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

function TagsSection({ user, onUpdate }: { user: UserProfile; onUpdate: (u: UserProfile) => void }) {
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(user.tags ?? []);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addTag = (tag: string) => {
    const n = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!n || n === '#' || tags.includes(n)) return;
    setTags(t => [...t, n]); setInput('');
  };
  const handleSave = async () => {
    setSaving(true); setError('');
    try { const t = await api.updateTags(tags); onUpdate({ ...user, tags: t }); setEditing(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setTags(user.tags ?? []); setInput(''); setError(''); setEditing(false); };

  return (
    <SectionCard title="Interests" icon={Tag}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs text-gray-400">Tags that describe your interests.</p>
        {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium"><Edit2 size={11} /> Edit</button>}
      </div>
      {editing ? (
        <div>
          <div className="flex gap-2 mb-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input.trim()); }}} placeholder="#vegan, #geek…" className="flex-1 rounded-xl border border-gray-200 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:border-rose-400" />
            <button type="button" onClick={() => addTag(input.trim())} className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-medium hover:bg-rose-600">Add</button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-medium border border-rose-100">
                  {tag} <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-400 mb-1.5">Suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
              <button key={tag} type="button" onClick={() => addTag(tag)} className="px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 text-xs hover:border-rose-300 hover:text-rose-500">{tag}</button>
            ))}
          </div>
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {(user.tags ?? []).length > 0
            ? user.tags.map(tag => <span key={tag} className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 text-xs font-medium border border-rose-100">{tag}</span>)
            : <p className="text-xs text-gray-400 italic">No interests added yet.</p>}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Location ─────────────────────────────────────────────────────────────────

function LocationSection({ user, onUpdate }: { user: UserProfile; onUpdate: (u: UserProfile) => void }) {
  const [editing, setEditing] = useState(false);
  const [cityInput, setCityInput] = useState(user.location_city ?? '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false); },
      () => { setError('Could not get location.'); setGpsLoading(false); }
    );
  };

  const handleSave = async () => {
    if (!cityInput.trim() && !gpsCoords) { setError('Please provide a city or use GPS.'); return; }
    setSaving(true); setError('');
    try {
      const body: Record<string, unknown> = {};
      if (gpsCoords) { body.latitude = gpsCoords.lat; body.longitude = gpsCoords.lng; }
      if (cityInput.trim()) body.location_city = cityInput.trim();
      await api.updateLocation(body);
      onUpdate({ ...user, location_city: cityInput.trim() || user.location_city, latitude: gpsCoords?.lat ?? user.latitude, longitude: gpsCoords?.lng ?? user.longitude });
      setEditing(false);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.'); }
    finally { setSaving(false); }
  };
  const handleCancel = () => { setCityInput(user.location_city ?? ''); setGpsCoords(user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null); setError(''); setEditing(false); };

  return (
    <SectionCard title="Location" icon={MapPin}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs text-gray-400">Used for nearby match suggestions.</p>
        {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium"><Edit2 size={11} /> Edit</button>}
      </div>
      {editing ? (
        <div className="space-y-2.5">
          <button type="button" onClick={useGPS} disabled={gpsLoading} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${gpsCoords ? 'border-rose-400 bg-rose-50 text-rose-500' : 'border-gray-200 bg-white/60 text-gray-600 hover:border-rose-300'}`}>
            {gpsLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
            {gpsLoading ? 'Detecting…' : gpsCoords ? 'GPS detected ✓' : 'Use my current location'}
          </button>
          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-100" /><span className="text-[10px] text-gray-400">or enter manually</span><div className="flex-1 h-px bg-gray-100" /></div>
          <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="City (e.g. Paris)" className="w-full rounded-xl border border-gray-200 bg-white/60 px-3 py-2 text-sm focus:outline-none focus:border-rose-400" />
          <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-rose-400 flex-shrink-0" />
          {user.location_city
            ? <span className="text-sm text-gray-700 font-medium">{user.location_city}</span>
            : user.latitude ? <span className="text-sm text-gray-700 font-medium">{user.latitude.toFixed(3)}, {user.longitude?.toFixed(3)}</span>
            : <span className="text-xs text-gray-400 italic">No location set</span>}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Photos ───────────────────────────────────────────────────────────────────

function PhotosSection({ user, onUpdate }: { user: UserProfile; onUpdate: (u: UserProfile) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const photos = user.photos ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []); e.target.value = '';
    if (!files.length) return;
    if (photos.length + files.length > 5) { setError('Max 5 photos.'); return; }
    setUploading(true); setError('');
    try {
      let updated = { ...user };
      for (const file of files) { const p = await api.uploadPhoto(file); updated = { ...updated, photos: [...updated.photos, p] }; }
      onUpdate(updated);
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api.deletePhoto(id); onUpdate({ ...user, photos: photos.filter(p => p.id !== id) }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed.'); }
  };

  const handleSetMain = async (id: number) => {
    try { await api.setMainPhoto(id); onUpdate({ ...user, profile_picture_id: id }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed.'); }
  };

  return (
    <SectionCard title="Photos" icon={Camera}>
      <p className="text-xs text-gray-400 mb-3">Up to 5 photos. Hover to set main or delete.</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {photos.slice().sort((a, b) => a.order_index - b.order_index).map(photo => {
          const isMain = photo.id === user.profile_picture_id;
          return (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              {isMain && <span className="absolute bottom-1 left-1 text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-medium">Main</span>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-end gap-1 p-1">
                {!isMain && (
                  <button onClick={() => handleSetMain(photo.id)} title="Set as main" className="w-6 h-6 rounded-full bg-white/90 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star size={11} fill="currentColor" />
                  </button>
                )}
                <button onClick={() => handleDelete(photo.id)} title="Delete" className="w-6 h-6 rounded-full bg-white/90 text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={11} />
                </button>
              </div>
            </div>
          );
        })}
        {photos.length < 5 && (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            <span className="text-[10px]">{uploading ? 'Uploading…' : 'Add'}</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} className="hidden" />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-[10px] text-gray-400 text-center">{photos.length}/5 photos</p>
    </SectionCard>
  );
}

// ─── Fame & Activity ──────────────────────────────────────────────────────────

function StatsSection({ user }: { user: UserProfile }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [likers, setLikers] = useState<Liker[]>([]);
  const [tab, setTab] = useState<'visitors' | 'likers'>('visitors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getVisitors(), api.getLikedBy()])
      .then(([v, l]) => { setVisitors(v ?? []); setLikers(l ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const fame = Math.min(100, Math.max(0, user.fame_rating ?? 0));

  const UserRow = ({ item }: { item: Visitor | Liker }) => {
    const time = 'visited_at' in item ? item.visited_at : item.liked_at;
    return (
      <div className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-full bg-rose-100 overflow-hidden flex-shrink-0">
          {item.profile_picture_url ? <img src={item.profile_picture_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-rose-400 text-xs font-bold">{item.first_name[0]}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{item.first_name} {item.last_name}</p>
          <p className="text-[10px] text-gray-400">@{item.username}</p>
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(time)}</span>
      </div>
    );
  };

  return (
    <SectionCard title="Fame & Activity" icon={Star}>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-500">Fame rating</span>
          <span className="text-sm font-bold text-rose-500">{fame}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-700" style={{ width: `${fame}%` }} />
        </div>
      </div>
      <div className="flex gap-1 bg-gray-50 rounded-xl p-1 mb-3">
        {([{ key: 'visitors' as const, label: 'Visitors', icon: Eye, count: visitors.length }, { key: 'likers' as const, label: 'Liked me', icon: Heart, count: likers.length }]).map(({ key, label, icon: Icon, count }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === key ? 'bg-white shadow-sm text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon size={11} /> {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${tab === key ? 'bg-rose-50 text-rose-400' : 'bg-gray-200 text-gray-400'}`}>{count}</span>
          </button>
        ))}
      </div>
      {loading
        ? <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-rose-400" /></div>
        : <div className="max-h-56 overflow-y-auto">
            {tab === 'visitors'
              ? visitors.length > 0 ? visitors.map(v => <UserRow key={v.id} item={v} />) : <p className="text-xs text-gray-400 italic text-center py-4">No visitors yet.</p>
              : likers.length > 0 ? likers.map(l => <UserRow key={l.id} item={l} />) : <p className="text-xs text-gray-400 italic text-center py-4">No likes yet.</p>}
          </div>}
    </SectionCard>
  );
}

// ─── Profile Avatar Header ────────────────────────────────────────────────────

function ProfileHeader({ user }: { user: UserProfile }) {
  const mainPhoto = user.photos?.find(p => p.id === user.profile_picture_id);
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();
  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative mb-3">
        <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-rose-100">
          {mainPhoto ? <img src={mainPhoto.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-rose-400 text-2xl font-bold">{initials}</div>}
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center ring-2 ring-white">
          <Check size={13} className="text-white" />
        </div>
      </div>
      <h1 className="text-lg font-bold text-gray-800">{user.first_name} {user.last_name}</h1>
      <p className="text-sm text-gray-400">@{user.username}</p>
      {user.location_city && <p className="flex items-center gap-1 text-xs text-gray-400 mt-1"><MapPin size={10} /> {user.location_city}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .catch(e => setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F3BBBF] to-[#F7F7F7]">
      <Loader2 size={28} className="animate-spin text-rose-400" />
    </div>
  );

  if (fetchError || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F3BBBF] to-[#F7F7F7]">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">{fetchError || 'Profile not found.'}</p>
        <button onClick={() => navigate('/login')} className="text-sm text-rose-500 font-medium hover:text-rose-600">Back to login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3BBBF] to-[#F7F7F7]">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-white/80 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/browse')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Browse</button>
        <span className="text-sm font-semibold text-gray-800">My Profile</span>
        <div className="w-12" />
      </header>
      <div className="max-w-lg mx-auto px-4 pb-12">
        <ProfileHeader user={user} />
        <div className="space-y-4">
          <PhotosSection user={user} onUpdate={setUser} />
          <BasicInfoSection user={user} onUpdate={setUser} />
          <AboutSection user={user} onUpdate={setUser} />
          <TagsSection user={user} onUpdate={setUser} />
          <LocationSection user={user} onUpdate={setUser} />
          <StatsSection user={user} />
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
