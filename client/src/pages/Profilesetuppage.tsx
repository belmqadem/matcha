import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Heart, FileText, Tag, Camera, ChevronRight, ChevronLeft, X, Check, Calendar } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female' | 'non-binary' | 'other';
type SexualPreference = 'heterosexual' | 'homosexual' | 'bisexual';

interface ProfileForm {
  birthdate: string;
  gender: Gender | '';
  sexual_preference: SexualPreference | '';
  biography: string;
  tags: string[];
  location_city: string;
  latitude: number | null;
  longitude: number | null;
  photos: File[];
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const profileApi = {
  updateProfile: (body: object) =>
    fetch('/api/profile/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? `Error (${res.status})`);
      return data;
    }),

  updateTags: (tags: string[]) =>
    fetch('/api/profile/me/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tags }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? `Error (${res.status})`);
      return data;
    }),

  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return fetch('/api/profile/me/photos', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.message ?? `Error (${res.status})`);
      return data;
    });
  },

  savePartial: async (form: ProfileForm) => {
    const body: Record<string, unknown> = {};
    if (form.birthdate)         body.birth_date        = form.birthdate;
    if (form.gender)            body.gender            = form.gender;
    if (form.sexual_preference) body.sexual_preference = form.sexual_preference;
    if (form.biography.trim())  body.biography         = form.biography;
    if (form.location_city)     body.location_city     = form.location_city;
    if (form.latitude !== null) body.latitude          = form.latitude;
    if (form.longitude !== null) body.longitude        = form.longitude;
    if (Object.keys(body).length > 0) {
      await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
    }
    if (form.tags.length > 0) {
      await fetch('/api/profile/me/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tags: form.tags }),
      });
    }
    for (const file of form.photos) {
      const fd = new FormData();
      fd.append('photo', file);
      await fetch('/api/profile/me/photos', { method: 'POST', credentials: 'include', body: fd });
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(birthdate: string): number | null {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── Floating Hearts Background ───────────────────────────────────────────────

const HEARTS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  size: 8 + Math.random() * 14,
  left: 4 + Math.random() * 92,
  delay: Math.random() * 14,
  duration: 14 + Math.random() * 12,
  opacity: 0.07 + Math.random() * 0.08,
  wobble: 6 + Math.random() * 14,
}));

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {HEARTS.map((h) => (
        <div
          key={h.id}
          style={{
            position: 'absolute',
            bottom: `-${h.size * 2}px`,
            left: `${h.left}%`,
            animationName: 'floatHeart',
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            animationTimingFunction: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
            opacity: h.opacity,
            ['--wobble' as string]: `${h.wobble}px`,
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="var(--color-primary)">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ─── Step dots ────────────────────────────────────────────────────────────────

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '28px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '5px',
            borderRadius: '999px',
            background: i <= current ? 'var(--color-primary)' : 'var(--color-border)',
            width: i === current ? '24px' : i < current ? '12px' : '8px',
            opacity: i > current ? 0.35 : 1,
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Option button ────────────────────────────────────────────────────────────

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: '14px',
        border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: selected ? 'color-mix(in srgb, var(--color-primary) 7%, white)' : '#fff',
        color: selected ? 'var(--color-primary)' : 'var(--color-text)',
        fontSize: '14px',
        fontFamily: 'var(--font-primary)',
        fontWeight: selected ? 600 : 400,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: selected ? '0 2px 12px color-mix(in srgb, var(--color-primary) 18%, transparent)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: selected ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      {label}
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: selected ? 'var(--color-primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}>
        {selected && <Check size={11} color="#fff" strokeWidth={3} />}
      </div>
    </button>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const GENDERS = [
  { value: 'male'       as const, label: 'Man',        emoji: '♂' },
  { value: 'female'     as const, label: 'Woman',      emoji: '♀' },
  { value: 'non-binary' as const, label: 'Non-binary', emoji: '⚧' },
  { value: 'other'      as const, label: 'Other',      emoji: '✦' },
];

const PREFERENCES = [
  { value: 'heterosexual' as const, label: 'Heterosexual', emoji: '💑' },
  { value: 'homosexual'   as const, label: 'Homosexual',   emoji: '👫' },
  { value: 'bisexual'     as const, label: 'Bisexual',     emoji: '💖' },
];

const SUGGESTED_TAGS = [
  '#vegan', '#geek', '#piercing', '#fitness', '#travel',
  '#music', '#art', '#gaming', '#hiking', '#foodie',
  '#coffee', '#yoga', '#cinema', '#reading', '#dancing',
];

const inputStyle = (active: boolean): React.CSSProperties => ({
  width: '100%',
  borderRadius: '14px',
  border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  background: '#fff',
  padding: '13px 16px',
  fontSize: '14px',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: active ? '0 2px 12px color-mix(in srgb, var(--color-primary) 14%, transparent)' : 'none',
});

function Step0Birthdate({ form, setForm }: { form: ProfileForm; setForm: React.Dispatch<React.SetStateAction<ProfileForm>> }) {
  const age = calcAge(form.birthdate);
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px', fontFamily: 'var(--font-primary)', fontStyle: 'italic' }}>
        You must be at least 18 years old. Your age will be visible on your profile.
      </p>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'var(--font-primary)' }}>
        Date of birth
      </label>
      <input
        type="date"
        value={form.birthdate}
        onChange={(e) => setForm((p) => ({ ...p, birthdate: e.target.value }))}
        min={minDate}
        max={maxDate}
        style={inputStyle(!!form.birthdate)}
      />
      {form.birthdate && age !== null && age >= 18 && (
        <div style={{
          marginTop: '12px', padding: '11px 15px',
          background: 'color-mix(in srgb, var(--color-primary) 7%, white)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fadeIn 0.3s ease',
          border: '1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)',
        }}>
          <span style={{ fontSize: '16px' }}>🎂</span>
          <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, fontFamily: 'var(--font-primary)', margin: 0 }}>
            You are <strong>{age}</strong> years old
          </p>
        </div>
      )}
      {form.birthdate && age !== null && age < 18 && (
        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-error)', fontFamily: 'var(--font-primary)' }}>
          You must be at least 18 to use Matcha.
        </p>
      )}
    </div>
  );
}

function Step1Gender({ form, setForm }: { form: ProfileForm; setForm: React.Dispatch<React.SetStateAction<ProfileForm>> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px', fontFamily: 'var(--font-primary)', fontStyle: 'italic' }}>
        Select the option that best describes you.
      </p>
      {GENDERS.map(({ value, label, emoji }) => (
        <OptionButton key={value} label={`${emoji}  ${label}`} selected={form.gender === value} onClick={() => setForm((p) => ({ ...p, gender: value }))} />
      ))}
    </div>
  );
}

function Step2Preference({ form, setForm }: { form: ProfileForm; setForm: React.Dispatch<React.SetStateAction<ProfileForm>> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px', fontFamily: 'var(--font-primary)', fontStyle: 'italic' }}>
        Who are you interested in meeting?
      </p>
      {PREFERENCES.map(({ value, label, emoji }) => (
        <OptionButton key={value} label={`${emoji}  ${label}`} selected={form.sexual_preference === value} onClick={() => setForm((p) => ({ ...p, sexual_preference: value }))} />
      ))}
    </div>
  );
}

function Step3Bio({ form, setForm }: { form: ProfileForm; setForm: React.Dispatch<React.SetStateAction<ProfileForm>> }) {
  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px', fontFamily: 'var(--font-primary)', fontStyle: 'italic' }}>
        Tell others a little about yourself. What makes you, you?
      </p>
      <textarea
        value={form.biography}
        onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
        placeholder="I love hiking on weekends, experimenting with new recipes, and finding hidden gem coffee shops..."
        maxLength={500}
        rows={6}
        style={{ ...inputStyle(!!form.biography), resize: 'none', lineHeight: 1.6 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '10px' }}>
        <div style={{ height: '3px', borderRadius: '999px', background: 'var(--color-border)', flex: 1, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '999px',
            background: 'var(--color-primary)',
            width: `${(form.biography.length / 500) * 100}%`,
            transition: 'width 0.2s ease', opacity: 0.6,
          }} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-primary)', flexShrink: 0 }}>
          {form.biography.length}/500
        </span>
      </div>
    </div>
  );
}

function Step4Tags({ form, setForm }: { form: ProfileForm; setForm: React.Dispatch<React.SetStateAction<ProfileForm>> }) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const normalized = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!normalized || normalized === '#' || form.tags.includes(normalized)) return;
    setForm((p) => ({ ...p, tags: [...p.tags, normalized] }));
    setInput('');
  };

  const removeTag = (tag: string) => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input.trim()); }
  };

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px', fontFamily: 'var(--font-primary)', fontStyle: 'italic' }}>
        Add interests so others can find you. Press Enter or comma to add.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="#vegan, #geek…"
          style={{ ...inputStyle(false), flex: 1 }}
        />
        <button
          type="button"
          onClick={() => addTag(input.trim())}
          style={{
            padding: '12px 16px', borderRadius: '14px',
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', fontSize: '13px',
            fontFamily: 'var(--font-primary)', fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          Add
        </button>
      </div>

      {form.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '14px' }}>
          {form.tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '5px 11px', borderRadius: '999px',
                background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
                color: 'var(--color-primary)', fontSize: '12px',
                fontFamily: 'var(--font-primary)', fontWeight: 600,
                border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                animation: 'popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-primary)', opacity: 0.6 }}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-primary)' }}>
        Suggestions
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            style={{
              padding: '5px 11px', borderRadius: '999px',
              border: '1.5px solid var(--color-border)', background: '#fff',
              color: 'var(--color-text-muted)', fontSize: '12px',
              fontFamily: 'var(--font-primary)', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
              (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--color-primary) 6%, white)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
              (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step5Location({ form, setForm }: { form: ProfileForm; setForm: React.Dispatch<React.SetStateAction<ProfileForm>> }) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) { setGpsError('Geolocation not supported.'); return; }
    setGpsLoading(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setGpsLoading(false);
      },
      () => { setGpsError('Could not get your location. Enter it manually.'); setGpsLoading(false); }
    );
  };

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', fontFamily: 'var(--font-primary)', fontStyle: 'italic' }}>
        Your location helps us show you relevant matches nearby.
      </p>
      <button
        type="button"
        onClick={useGPS}
        disabled={gpsLoading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', padding: '13px', borderRadius: '14px',
          border: `1.5px solid ${form.latitude ? 'var(--color-primary)' : 'var(--color-border)'}`,
          background: form.latitude ? 'color-mix(in srgb, var(--color-primary) 7%, white)' : '#fff',
          color: form.latitude ? 'var(--color-primary)' : 'var(--color-text)',
          fontSize: '14px', fontFamily: 'var(--font-primary)', fontWeight: 500,
          cursor: 'pointer', marginBottom: '12px',
          boxShadow: form.latitude ? '0 2px 12px color-mix(in srgb, var(--color-primary) 16%, transparent)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <MapPin size={15} />
        {gpsLoading ? 'Detecting…' : form.latitude ? '📍 Location detected ✓' : 'Use my current location'}
      </button>
      {gpsError && <p style={{ fontSize: '12px', color: 'var(--color-error)', marginBottom: '10px', fontFamily: 'var(--font-primary)' }}>{gpsError}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-primary)', opacity: 0.6 }}>or enter manually</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>

      <input
        value={form.location_city}
        onChange={(e) => setForm((p) => ({ ...p, location_city: e.target.value }))}
        placeholder="City or neighborhood (e.g. Paris, Montmartre)"
        style={inputStyle(!!form.location_city)}
      />
    </div>
  );
}

function Step6Photos({ form, setForm }: { form: ProfileForm; setForm: React.Dispatch<React.SetStateAction<ProfileForm>> }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setForm((p) => ({ ...p, photos: [...p.photos, ...files].slice(0, 5) }));
    e.target.value = '';
  };

  const removePhoto = (index: number) => setForm((p) => ({ ...p, photos: p.photos.filter((_, i) => i !== index) }));

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', fontFamily: 'var(--font-primary)', fontStyle: 'italic' }}>
        Add up to 5 photos. The first one will be your profile picture.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '9px', marginBottom: '14px' }}>
        {form.photos.map((file, i) => (
          <div key={i} style={{
            position: 'relative', aspectRatio: '1',
            borderRadius: '14px', overflow: 'hidden',
            border: i === 0 ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
            animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: i === 0 ? '0 4px 16px color-mix(in srgb, var(--color-primary) 22%, transparent)' : 'none',
          }}>
            <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {i === 0 && (
              <span style={{
                position: 'absolute', bottom: '6px', left: '6px',
                fontSize: '10px', background: 'var(--color-primary)', color: '#fff',
                padding: '2px 7px', borderRadius: '999px',
                fontFamily: 'var(--font-primary)', fontWeight: 600,
              }}>
                Main
              </span>
            )}
            <button type="button" onClick={() => removePhoto(i)} style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', color: '#fff',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={10} />
            </button>
          </div>
        ))}
        {form.photos.length < 5 && (
          <button type="button" onClick={() => inputRef.current?.click()} style={{
            aspectRatio: '1', borderRadius: '14px',
            border: '1.5px dashed var(--color-border)', background: 'var(--color-background)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '5px',
            color: 'var(--color-border)', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)';
              (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--color-primary) 5%, white)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-background)';
            }}
          >
            <Camera size={18} />
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-primary)' }}>Add photo</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} style={{ display: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: i < form.photos.length ? 'var(--color-primary)' : 'var(--color-border)',
            transition: 'background 0.2s, transform 0.2s',
            transform: i < form.photos.length ? 'scale(1.2)' : 'scale(1)',
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

interface StepConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  skippable: boolean;
}

const STEPS: StepConfig[] = [
  { title: 'When were you born?', subtitle: 'Age & birthdate',     icon: Calendar, skippable: false },
  { title: "What's your gender?", subtitle: 'Identity',            icon: User,     skippable: true  },
  { title: 'Who are you into?',   subtitle: 'Romantic preference', icon: Heart,    skippable: true  },
  { title: 'Write your bio',      subtitle: 'About you',           icon: FileText, skippable: true  },
  { title: 'Your interests',      subtitle: 'Tags & hobbies',      icon: Tag,      skippable: true  },
  { title: 'Your location',       subtitle: 'Where you are',       icon: MapPin,   skippable: true  },
  { title: 'Add your photos',     subtitle: 'Show yourself',       icon: Camera,   skippable: true  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    birthdate: '', gender: '', sexual_preference: '',
    biography: '', tags: [], location_city: '',
    latitude: null, longitude: null, photos: [],
  });

  const isLast = step === STEPS.length - 1;

  const isStepValid = (): { valid: boolean; message: string } => {
    if (step === 0) {
      if (!form.birthdate) return { valid: false, message: 'Please enter your date of birth.' };
      const age = calcAge(form.birthdate);
      if (age === null || age < 18) return { valid: false, message: 'You must be at least 18 years old.' };
    }
    return { valid: true, message: '' };
  };

  const goTo = (next: number, dir: 'forward' | 'back') => {
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    setError('');
    const { valid, message } = isStepValid();
    if (!valid) { setError(message); return; }
    goTo(step + 1, 'forward');
  };

  const handleBack = () => { setError(''); goTo(step - 1, 'back'); };
  const handleSkipStep = () => { setError(''); goTo(step + 1, 'forward'); };

  const handleSkipAll = async () => {
    try { await profileApi.savePartial(form); } catch {}
    navigate('/browse');
  };

  const handleSubmit = async () => {
    setError('');
    const { valid, message } = isStepValid();
    if (!valid) { setError(message); return; }
    setLoading(true);
    try {
      await profileApi.updateProfile({
        birth_date: form.birthdate || undefined,
        gender: form.gender || undefined,
        sexual_preference: form.sexual_preference || undefined,
        biography: form.biography || undefined,
        location_city: form.location_city || undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      });
      if (form.tags.length > 0) await profileApi.updateTags(form.tags);
      for (const file of form.photos) await profileApi.uploadPhoto(file);
      navigate('/browse');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <Step0Birthdate  form={form} setForm={setForm} />;
      case 1: return <Step1Gender     form={form} setForm={setForm} />;
      case 2: return <Step2Preference form={form} setForm={setForm} />;
      case 3: return <Step3Bio        form={form} setForm={setForm} />;
      case 4: return <Step4Tags       form={form} setForm={setForm} />;
      case 5: return <Step5Location   form={form} setForm={setForm} />;
      case 6: return <Step6Photos     form={form} setForm={setForm} />;
      default: return null;
    }
  };

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;
  const progress = (step / (STEPS.length - 1)) * 100;

  const contentAnim: React.CSSProperties = animating
    ? {
        animation: `${animDir === 'forward' ? 'slideOut' : 'slideOutBack'} 0.2s ease forwards`,
        pointerEvents: 'none',
      }
    : {
        animation: `${animDir === 'forward' ? 'slideIn' : 'slideInBack'} 0.26s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
      };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--font-primary)',
    }}>
      <style>{`
        @keyframes floatHeart {
          0%   { transform: translateY(0px) translateX(0px) scale(1); opacity: 0; }
          8%   { opacity: 1; }
          30%  { transform: translateY(-30vh) translateX(var(--wobble, 8px)) scale(1.05); }
          60%  { transform: translateY(-60vh) translateX(calc(var(--wobble, 8px) * -0.6)) scale(0.95); }
          85%  { opacity: 0.9; }
          100% { transform: translateY(-105vh) translateX(calc(var(--wobble, 8px) * 0.3)) scale(0.8); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInBack {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-20px); }
        }
        @keyframes slideOutBack {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(20px); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <FloatingHearts />

      {/* Soft decorative blobs using only primary color */}
      <div style={{
        position: 'fixed', top: '-120px', right: '-100px',
        width: '340px', height: '340px', borderRadius: '50%',
        background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 7%, transparent) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-120px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 5%, transparent) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '410px',
        background: '#fff',
        borderRadius: '24px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.07), 0 2px 12px color-mix(in srgb, var(--color-primary) 6%, transparent)',
        padding: '32px 28px 24px',
        position: 'relative', zIndex: 1,
        animation: 'cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        border: '1px solid color-mix(in srgb, var(--color-border) 80%, transparent)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
            <Heart size={14} fill="var(--color-primary)" color="var(--color-primary)" />
            <span style={{
              fontFamily: 'var(--font-primary)', fontSize: '22px',
              fontWeight: 900, fontStyle: 'italic',
              color: 'var(--color-primary)', letterSpacing: '-0.3px',
            }}>
              Matcha
            </span>
            <Heart size={14} fill="var(--color-primary)" color="var(--color-primary)" />
          </div>
          <div style={{ width: '24px', height: '2px', background: 'var(--color-primary)', borderRadius: '999px', margin: '5px auto 0', opacity: 0.3 }} />
        </div>

        {/* Progress bar */}
        <div style={{
          height: '3px', borderRadius: '999px',
          background: 'var(--color-border)', marginBottom: '22px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '999px',
            background: 'var(--color-primary)',
            width: `${progress}%`,
            transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: 0.9,
          }} />
        </div>

        {/* Step dots */}
        <StepDots total={STEPS.length} current={step} />

        {/* Step header + content — animated together */}
        <div style={contentAnim}>
          {/* Step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '20px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '13px',
              background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px color-mix(in srgb, var(--color-primary) 14%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
            }}>
              <StepIcon size={20} color="var(--color-primary)" strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px', fontFamily: 'var(--font-primary)' }}>
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: 1.2, fontFamily: 'var(--font-primary)' }}>
                {currentStep.title}
              </h2>
            </div>
          </div>

          {/* Step content */}
          <div style={{ minHeight: '190px' }}>
            {renderStep()}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '10px', padding: '10px 14px',
            background: 'color-mix(in srgb, var(--color-error) 6%, white)',
            borderRadius: '10px',
            border: '1px solid color-mix(in srgb, var(--color-error) 15%, transparent)',
            animation: 'fadeIn 0.2s ease',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-error)', fontFamily: 'var(--font-primary)', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: step === 0 ? 'flex-end' : 'space-between',
          marginTop: '22px', gap: '10px',
        }}>
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              style={{
                width: '42px', height: '42px', borderRadius: '12px',
                border: '1.5px solid var(--color-border)', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--color-text-muted)',
                transition: 'all 0.15s ease', flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = 'var(--color-primary)';
                b.style.color = 'var(--color-primary)';
                b.style.background = 'color-mix(in srgb, var(--color-primary) 5%, white)';
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = 'var(--color-border)';
                b.style.color = 'var(--color-text-muted)';
                b.style.background = '#fff';
              }}
            >
              <ChevronLeft size={17} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            {currentStep.skippable && !isLast && (
              <button
                type="button"
                onClick={handleSkipStep}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '12px', color: 'var(--color-border)',
                  fontFamily: 'var(--font-primary)', padding: '0 4px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-border)'; }}
              >
                Skip
              </button>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={isLast ? handleSubmit : handleNext}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '11px 22px', borderRadius: '13px',
                background: loading ? 'var(--color-border)' : 'var(--color-primary)',
                color: loading ? 'var(--color-text-muted)' : '#fff',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontFamily: 'var(--font-primary)', fontWeight: 600,
                boxShadow: loading ? 'none' : '0 4px 16px color-mix(in srgb, var(--color-primary) 35%, transparent)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Saving…' : isLast ? (
                <><Heart size={13} fill="white" /> Complete setup</>
              ) : (
                <>Continue <ChevronRight size={13} /></>
              )}
            </button>
          </div>
        </div>

        {/* Skip all */}
        <p style={{ textAlign: 'center', marginTop: '14px', marginBottom: 0 }}>
          <button
            type="button"
            onClick={handleSkipAll}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '11px', color: 'var(--color-border)',
              fontFamily: 'var(--font-primary)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-border)'; }}
          >
            Skip setup for now
          </button>
        </p>
      </div>
    </div>
  );
}
