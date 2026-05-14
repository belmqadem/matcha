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
  ArrowLeft,
  LogOut,
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
    fetch(`/api/profile/me/photos/${id}`, { method: 'DELETE', credentials: 'include' }).then(
      async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      },
    ),

  setMainPhoto: (id: number) =>
    fetch(`/api/profile/me/photos/${id}/set-main`, {
      method: 'PATCH',
      credentials: 'include',
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
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
  '#vegan',
  '#geek',
  '#piercing',
  '#fitness',
  '#travel',
  '#music',
  '#art',
  '#gaming',
  '#hiking',
  '#foodie',
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

const SECTION_TABS = [
  { key: 'photos', label: 'Photos' },
  { key: 'identity', label: 'Identity' },
  { key: 'about', label: 'About' },
  { key: 'interests', label: 'Interests' },
  { key: 'location', label: 'Location' },
  { key: 'activity', label: 'Activity' },
] as const;

type SectionKey = (typeof SECTION_TABS)[number]['key'];

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getProfileCompletion(user: UserProfile) {
  const items = [
    { label: 'Gender', ok: Boolean(user.gender) },
    { label: 'Bio', ok: Boolean(user.biography?.trim()) },
    {
      label: 'Location',
      ok: Boolean(user.location_city?.trim() || (user.latitude != null && user.longitude != null)),
    },
    { label: 'Interests', ok: (user.tags ?? []).length > 0 },
    { label: 'Photos', ok: (user.photos ?? []).length > 0 },
  ];
  const score = Math.round((items.filter((item) => item.ok).length / items.length) * 100);
  return { score, items };
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-(--color-border) bg-white px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted)/40 focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all font-(--font-primary)';
const labelCls =
  'block text-[10px] font-semibold tracking-widest text-(--color-text-muted) uppercase mb-1.5';

const SaveBar = ({
  saving,
  error,
  onSave,
  onCancel,
}: {
  saving: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-(--color-border)">
    {error ? (
      <p className="text-xs text-(--color-error) flex-1">{error}</p>
    ) : (
      <span className="flex-1" />
    )}
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 text-xs font-semibold rounded-xl border border-(--color-border) text-(--color-text-muted) hover:bg-gray-50 transition-colors"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-(--color-primary) text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save changes
    </button>
  </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id}>
      <p className="text-[10px] font-bold tracking-widest text-(--color-text-muted) uppercase mb-3 px-1">
        {label}
      </p>
      <div className="bg-white rounded-2xl border border-(--color-border) shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── Basic Info ───────────────────────────────────────────────────────────────

function BasicInfoSection({
  user,
  onUpdate,
}: {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const u = await api.patchUser(form);
      onUpdate(u);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
    });
    setError('');
    setEditing(false);
  };

  return (
    <Section label="Identity">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-(--color-text-muted)">Name, username & email</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:opacity-70 transition-opacity"
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(['first_name', 'last_name'] as const).map((f) => (
                <div key={f}>
                  <label className={labelCls}>{f === 'first_name' ? 'First' : 'Last'}</label>
                  <input
                    value={form[f]}
                    onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            {(['username', 'email'] as const).map((f) => (
              <div key={f}>
                <label className={labelCls}>{f}</label>
                <input
                  value={form[f]}
                  onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  type={f === 'email' ? 'email' : 'text'}
                  className={inputCls}
                />
              </div>
            ))}
            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'First name', value: user.first_name },
                { label: 'Last name', value: user.last_name },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className={labelCls}>{label}</p>
                  <p className="text-sm font-medium text-(--color-text)">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className={labelCls}>Username</p>
              <p className="text-sm font-medium text-(--color-text)">@{user.username}</p>
            </div>
            <div>
              <p className={labelCls}>Email</p>
              <p className="text-sm text-(--color-text-muted)">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function AboutSection({
  user,
  onUpdate,
}: {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    gender: user.gender ?? '',
    sexual_preference: user.sexual_preference ?? '',
    biography: user.biography ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const u = await api.patchProfile(form);
      onUpdate(u);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setForm({
      gender: user.gender ?? '',
      sexual_preference: user.sexual_preference ?? '',
      biography: user.biography ?? '',
    });
    setError('');
    setEditing(false);
  };

  const genderLabel = GENDERS.find((g) => g.value === user.gender)?.label;
  const prefLabel = PREFERENCES.find((p) => p.value === user.sexual_preference)?.label;

  return (
    <Section label="About">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-(--color-text-muted)">Gender, preference & bio</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:opacity-70 transition-opacity"
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            {[
              { label: 'Gender', key: 'gender' as const, opts: GENDERS },
              { label: 'Interested in', key: 'sexual_preference' as const, opts: PREFERENCES },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <div className="relative">
                  <select
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className={inputCls + ' appearance-none pr-8'}
                  >
                    <option value="">Select…</option>
                    {opts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) pointer-events-none"
                  />
                </div>
              </div>
            ))}
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                value={form.biography}
                onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
                maxLength={500}
                rows={4}
                className={inputCls + ' resize-none'}
                placeholder="Write something about yourself…"
              />
              <p className="text-right text-[10px] text-(--color-text-muted)/50 mt-1">
                {form.biography.length}/500
              </p>
            </div>
            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {genderLabel && (
                <span className="px-3 py-1 rounded-full bg-(--color-background) text-(--color-text) text-xs font-medium border border-(--color-border)">
                  {genderLabel}
                </span>
              )}
              {prefLabel && (
                <span className="px-3 py-1 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs font-medium border border-(--color-primary)/20">
                  {prefLabel}
                </span>
              )}
              {!genderLabel && !prefLabel && (
                <p className="text-xs text-(--color-text-muted)/50 italic">Not filled in yet.</p>
              )}
            </div>
            {user.biography ? (
              <p className="text-sm text-(--color-text-muted) leading-relaxed">{user.biography}</p>
            ) : (
              <p className="text-xs text-(--color-text-muted)/50 italic">No bio yet.</p>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

function TagsSection({
  user,
  onUpdate,
}: {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(user.tags ?? []);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addTag = (tag: string) => {
    const n = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!n || n === '#' || tags.includes(n)) return;
    setTags((t) => [...t, n]);
    setInput('');
  };
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const t = await api.updateTags(tags);
      onUpdate({ ...user, tags: t });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setTags(user.tags ?? []);
    setInput('');
    setError('');
    setEditing(false);
  };

  return (
    <Section label="Interests">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-(--color-text-muted)">Things you're into</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:opacity-70 transition-opacity"
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(input.trim());
                  }
                }}
                placeholder="Type a tag and press Enter"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => addTag(input.trim())}
                className="px-3 py-2 rounded-xl bg-(--color-primary) text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-(--color-primary) text-white text-xs font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                      className="opacity-70 hover:opacity-100"
                    >
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className={labelCls + ' mb-2'}>Quick add</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-text-muted) text-xs hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(user.tags ?? []).length > 0 ? (
              user.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs font-medium border border-(--color-primary)/20"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-xs text-(--color-text-muted)/50 italic">No interests added yet.</p>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Location ─────────────────────────────────────────────────────────────────

function LocationSection({
  user,
  onUpdate,
}: {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [cityInput, setCityInput] = useState(user.location_city ?? '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setError('Could not get location.');
        setGpsLoading(false);
      },
    );
  };

  const handleSave = async () => {
    if (!cityInput.trim() && !gpsCoords) {
      setError('Please provide a city or use GPS.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body: Record<string, unknown> = {};
      if (gpsCoords) {
        body.latitude = gpsCoords.lat;
        body.longitude = gpsCoords.lng;
      }
      if (cityInput.trim()) body.location_city = cityInput.trim();
      await api.updateLocation(body);
      onUpdate({
        ...user,
        location_city: cityInput.trim() || user.location_city,
        latitude: gpsCoords?.lat ?? user.latitude,
        longitude: gpsCoords?.lng ?? user.longitude,
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setCityInput(user.location_city ?? '');
    setGpsCoords(
      user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null,
    );
    setError('');
    setEditing(false);
  };

  const lat = user.latitude != null ? Number(user.latitude) : null;
  const lng = user.longitude != null ? Number(user.longitude) : null;

  return (
    <Section label="Location">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-(--color-text-muted)">Used for nearby suggestions</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:opacity-70 transition-opacity"
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={useGPS}
              disabled={gpsLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${gpsCoords ? 'border-(--color-primary) bg-(--color-primary)/5 text-(--color-primary)' : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary)'}`}
            >
              {gpsLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
              {gpsLoading ? 'Detecting…' : gpsCoords ? 'GPS detected ✓' : 'Use my current location'}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-(--color-border)" />
              <span className="text-[10px] text-(--color-text-muted)/50 tracking-widest uppercase">
                or
              </span>
              <div className="flex-1 h-px bg-(--color-border)" />
            </div>
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter your city"
              className={inputCls}
            />
            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-(--color-primary)/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={13} className="text-(--color-primary)" />
            </div>
            {user.location_city ? (
              <span className="text-sm font-medium text-(--color-text)">{user.location_city}</span>
            ) : lat ? (
              <span className="text-sm text-(--color-text-muted)">
                {lat.toFixed(3)}, {lng?.toFixed(3)}
              </span>
            ) : (
              <span className="text-xs text-(--color-text-muted)/50 italic">No location set</span>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Photos ───────────────────────────────────────────────────────────────────

function PhotosSection({
  user,
  onUpdate,
}: {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const photos = user.photos ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    if (photos.length + files.length > 5) {
      setError('Max 5 photos.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      let updated = { ...user };
      for (const file of files) {
        const p = await api.uploadPhoto(file);
        updated = { ...updated, photos: [...updated.photos, p] };
      }
      onUpdate(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deletePhoto(id);
      onUpdate({ ...user, photos: photos.filter((p) => p.id !== id) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const handleSetMain = async (id: number) => {
    try {
      await api.setMainPhoto(id);
      onUpdate({ ...user, profile_picture_id: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set main photo.');
    }
  };

  const sorted = photos.slice().sort((a, b) => a.order_index - b.order_index);
  const mainPhoto = sorted.find((p) => p.id === user.profile_picture_id) ?? sorted[0] ?? null;
  const otherPhotos = sorted.filter((p) => p.id !== mainPhoto?.id);
  const slots = [mainPhoto, ...otherPhotos, ...Array(5 - sorted.length).fill(null)].slice(0, 5);

  return (
    <Section id="photos" label="Photos">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-xs text-(--color-text-muted)">
            {photos.length}/5 photos · hover to manage
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs font-semibold text-(--color-primary) hover:underline"
          >
            Upload
          </button>
        </div>

        <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-(--color-background) border border-(--color-border) group">
            {mainPhoto ? (
              <>
                <img
                  src={mainPhoto.url}
                  alt="Main profile"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-(--color-primary) px-2 py-0.5 text-[9px] text-white font-semibold tracking-[0.2em] uppercase">
                  Main
                </span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleSetMain(mainPhoto.id)}
                    className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-(--color-primary)"
                  >
                    Main
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(mainPhoto.id)}
                    className="rounded-full bg-white/90 p-2 text-(--color-text)"
                  >
                    <X size={14} />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-full flex flex-col items-center justify-center gap-2 text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
              >
                {uploading ? <Loader2 size={22} className="animate-spin" /> : <Camera size={24} />}
                <span className="text-sm font-medium">Add main photo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {slots.slice(1).map((photo, index) => (
              <div
                key={photo?.id ?? `empty-${index}`}
                className="relative aspect-square rounded-3xl overflow-hidden bg-(--color-background) border border-(--color-border) group"
              >
                {photo ? (
                  <>
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleSetMain(photo.id)}
                        className="rounded-full bg-white/90 p-2 text-(--color-primary)"
                      >
                        <Star size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id)}
                        className="rounded-full bg-white/90 p-2 text-(--color-text)"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
                  >
                    <Camera size={18} />
                    <span className="text-[11px] font-medium">Add</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-2.5 rounded-xl border border-dashed border-(--color-border) text-xs font-medium text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {uploading ? 'Uploading…' : 'Upload more photos'}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        {error && <p className="text-xs text-(--color-error) mt-2">{error}</p>}
      </div>
    </Section>
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
      .then(([v, l]) => {
        setVisitors(v ?? []);
        setLikers(l ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const fame = Math.min(100, Math.max(0, user.fame_rating ?? 0));

  const UserRow = ({ item }: { item: Visitor | Liker }) => {
    const time = 'visited_at' in item ? item.visited_at : item.liked_at;
    return (
      <div className="flex items-center gap-3 py-3 border-b border-(--color-border) last:border-0">
        <div className="w-9 h-9 rounded-full bg-(--color-background) overflow-hidden flex-shrink-0 border border-(--color-border)">
          {item.profile_picture_url ? (
            <img src={item.profile_picture_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-(--color-primary) text-xs font-bold">
              {item.first_name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-(--color-text) truncate">
            {item.first_name} {item.last_name}
          </p>
          <p className="text-[10px] text-(--color-text-muted)">@{item.username}</p>
        </div>
        <span className="text-[10px] text-(--color-text-muted)/60">{timeAgo(time)}</span>
      </div>
    );
  };

  return (
    <Section label="Fame & Activity">
      <div className="p-5">
        {/* Fame bar */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-semibold text-(--color-text-muted) tracking-wide">
              Fame score
            </span>
            <span className="text-2xl font-bold text-(--color-primary) tabular-nums">{fame}</span>
          </div>
          <div className="h-1.5 rounded-full bg-(--color-background) overflow-hidden">
            <div
              className="h-full rounded-full bg-(--color-primary) transition-all duration-700"
              style={{ width: `${fame}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-(--color-border) mb-3">
          {[
            { key: 'visitors' as const, label: 'Visitors', icon: Eye, count: visitors.length },
            { key: 'likers' as const, label: 'Liked me', icon: Heart, count: likers.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-1 py-2 mr-5 text-xs font-semibold border-b-2 transition-all -mb-px ${tab === key ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-text-muted)/50 hover:text-(--color-text-muted)'}`}
            >
              <Icon size={11} /> {label}
              <span
                className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${tab === key ? 'bg-(--color-primary) text-white' : 'bg-(--color-background) text-(--color-text-muted)'}`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={16} className="animate-spin text-(--color-text-muted)/30" />
          </div>
        ) : (
          <div className="max-h-56 overflow-y-auto -mx-5 px-5">
            {tab === 'visitors' ? (
              visitors.length > 0 ? (
                visitors.map((v) => <UserRow key={v.id} item={v} />)
              ) : (
                <p className="text-xs text-(--color-text-muted)/50 italic text-center py-6">
                  No visitors yet.
                </p>
              )
            ) : likers.length > 0 ? (
              likers.map((l) => <UserRow key={l.id} item={l} />)
            ) : (
              <p className="text-xs text-(--color-text-muted)/50 italic text-center py-6">
                No likes yet.
              </p>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── Profile Header ───────────────────────────────────────────────────────────

function ProfileHeader({ user }: { user: UserProfile }) {
  const completion = getProfileCompletion(user);
  const mainPhoto = user.photos?.find((p) => p.id === user.profile_picture_id) ?? user.photos?.[0];
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-5 px-5 pb-5 pt-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-6">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-(--color-background) flex-shrink-0 shadow-md border border-(--color-border)">
            {mainPhoto ? (
              <img src={mainPhoto.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-(--color-primary) text-xl font-bold">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-(--color-text-muted) uppercase">
              Personal information
            </p>
            <h1 className="text-xl font-bold text-(--color-text) leading-tight mt-2">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-xs text-(--color-text-muted) mt-1">@{user.username}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById('photos')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="rounded-full bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Manage photos
          </button>
          {mainPhoto && (
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('photos')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="rounded-full border border-(--color-primary) px-4 py-2 text-sm font-semibold text-(--color-primary) transition hover:bg-(--color-primary)/5"
            >
              Upload / Remove
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-(--color-border) bg-(--color-background) p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-(--color-text-muted) uppercase">
              Profile strength
            </p>
            <p className="text-sm font-semibold text-(--color-text)">
              {completion.score}% complete
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${completion.score === 100 ? 'bg-(--color-primary) text-white' : 'bg-white text-(--color-text-muted) border border-(--color-border)'}`}
          >
            {completion.score === 100
              ? 'Complete'
              : `${completion.items.filter((item) => item.ok).length} of ${completion.items.length}`}
          </div>
        </div>
        <div className="h-2 rounded-full bg-white border border-(--color-border) overflow-hidden">
          <div
            className="h-full rounded-full bg-(--color-primary) transition-all"
            style={{ width: `${completion.score}%` }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-(--color-text-muted)">
          {completion.items.map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border px-2 py-1 text-center ${item.ok ? 'border-(--color-primary)/20 bg-(--color-primary)/5 text-(--color-primary)' : 'border-(--color-border) bg-white'}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Logout Button ────────────────────────────────────────────────────────────

function LogoutButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.logout();
      navigate('/login');
    } catch {
      // fallback: navigate anyway
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 w-full px-5 py-4 text-sm font-semibold text-(--color-primary) hover:bg-(--color-primary)/5 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('photos');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch((e) => setFetchError(e instanceof Error ? e.message : 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <Loader2 size={24} className="animate-spin text-(--color-primary)" />
      </div>
    );

  if (fetchError || !user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
        <div className="text-center">
          <p className="text-sm text-(--color-text-muted) mb-3">
            {fetchError || 'Profile not found.'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-(--color-primary) hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-(--color-background)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-(--color-border) px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => navigate('/browse')}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-(--color-background) transition-colors"
        >
          <ArrowLeft size={16} className="text-(--color-text-muted)" />
        </button>
        <span className="text-sm font-bold text-(--color-text) flex-1">My Profile</span>
        {/* Matcha wordmark */}
        <span className="text-sm font-bold text-(--color-primary) italic">Matcha</span>
      </header>

      <div className="max-w-5xl mx-auto pb-16 px-4">
        <div className="mb-6 rounded-[2rem] border border-(--color-border) bg-white shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSection(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeSection === tab.key
                    ? 'bg-(--color-primary) text-white shadow-sm'
                    : 'bg-(--color-background) text-(--color-text-muted) border border-(--color-border) hover:bg-(--color-primary)/10 hover:text-(--color-primary)'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-6">
              {activeSection === 'photos' && <PhotosSection user={user} onUpdate={setUser} />}
              {activeSection === 'identity' && <BasicInfoSection user={user} onUpdate={setUser} />}
              {activeSection === 'about' && <AboutSection user={user} onUpdate={setUser} />}
              {activeSection === 'interests' && <TagsSection user={user} onUpdate={setUser} />}
              {activeSection === 'location' && <LocationSection user={user} onUpdate={setUser} />}
              {activeSection === 'activity' && <StatsSection user={user} />}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-(--color-border) bg-white shadow-sm p-6">
              <h2 className="text-sm font-semibold text-(--color-text) mb-3">Profile summary</h2>
              <p className="text-sm text-(--color-text-muted) leading-relaxed">
                Keep your personal information up to date and use the photo gallery to highlight
                your best moments.
              </p>
            </div>
            <div className="rounded-[2rem] border border-(--color-border) bg-white shadow-sm overflow-hidden">
              <div className="p-5">
                <p className="text-[10px] font-bold tracking-widest text-(--color-text-muted) uppercase mb-3">
                  Account
                </p>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
