import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { MapPin, User, Heart, FileText, Tag, Camera, ChevronRight, ChevronLeft, X, Check, Calendar } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female' | 'non-binary' | 'other';
type SexualPreference = 'heterosexual' | 'homosexual' | 'bisexual';

interface ProfileForm {
  birthdate: string;           // "YYYY-MM-DD"
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

  /**
   * Saves whatever the user filled in so far (partial profile).
   * Errors are intentionally swallowed — we just want the backend
   * to store enough data so the route guard lets the user through.
   */
  savePartial: async (form: ProfileForm) => {
    const body: Record<string, unknown> = {};
    if (form.birthdate)            body.birth_date         = form.birthdate;
    if (form.gender)               body.gender             = form.gender;
    if (form.sexual_preference)    body.sexual_preference  = form.sexual_preference;
    if (form.biography.trim())     body.biography          = form.biography;
    if (form.location_city)        body.location_city      = form.location_city;
    if (form.latitude  !== null)   body.latitude           = form.latitude;
    if (form.longitude !== null)   body.longitude          = form.longitude;

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepDots = ({ total, current }: { total: number; current: number }) => (
  <div className="flex justify-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i === current
            ? 'w-6 bg-(--color-primary)'
            : i < current
            ? 'w-3 bg-(--color-primary)/40'
            : 'w-3 bg-(--color-text)/15'
        }`}
      />
    ))}
  </div>
);

const OptionButton = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-200 text-left flex items-center justify-between ${
      selected
        ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary)'
        : 'border-(--color-text)/15 bg-white/40 text-(--color-text) hover:border-(--color-primary)/40'
    }`}
  >
    {label}
    {selected && <Check size={14} />}
  </button>
);

// ─── Steps ────────────────────────────────────────────────────────────────────

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

const PREFERENCES: { value: SexualPreference; label: string }[] = [
  { value: 'heterosexual', label: 'Heterosexual' },
  { value: 'homosexual', label: 'Homosexual' },
  { value: 'bisexual', label: 'Bisexual' },
];

const SUGGESTED_TAGS = [
  '#vegan', '#geek', '#piercing', '#fitness', '#travel',
  '#music', '#art', '#gaming', '#hiking', '#foodie',
];

// ── Step 0: Birthdate ─────────────────────────────────────────────────────────
function Step0Birthdate({
  form,
  setForm,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
}) {
  const age = calcAge(form.birthdate);

  // Max date = 18 years ago; min = 100 years ago
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  return (
    <div>
      <p className="text-xs text-(--color-text)/60 mb-4">
        You must be at least 18 years old. Your age will be shown on your profile.
      </p>

      <label className="block text-xs font-medium text-(--color-text)/60 mb-1.5">
        Date of birth
      </label>
      <input
        type="date"
        value={form.birthdate}
        onChange={(e) => setForm((p) => ({ ...p, birthdate: e.target.value }))}
        min={minDate}
        max={maxDate}
        className="w-full rounded-xl border border-(--color-text)/15 bg-white/40 px-4 py-2.5 text-sm text-(--color-text) focus:outline-none focus:border-(--color-primary) transition-colors"
      />

      {form.birthdate && age !== null && (
        <p className="mt-2 text-sm text-(--color-primary) font-medium">
          You are <span className="font-bold">{age}</span> years old
        </p>
      )}

      {form.birthdate && age !== null && age < 18 && (
        <p className="mt-1 text-xs text-red-500">
          You must be at least 18 to use this app.
        </p>
      )}
    </div>
  );
}

// ── Step 1: Gender ────────────────────────────────────────────────────────────
function Step1Gender({
  form,
  setForm,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-(--color-text)/60 mb-3">Select the option that best describes you.</p>
      {GENDERS.map(({ value, label }) => (
        <OptionButton
          key={value}
          label={label}
          selected={form.gender === value}
          onClick={() => setForm((p) => ({ ...p, gender: value }))}
        />
      ))}
    </div>
  );
}

// ── Step 2: Preference ────────────────────────────────────────────────────────
function Step2Preference({
  form,
  setForm,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-(--color-text)/60 mb-3">Who are you interested in meeting?</p>
      {PREFERENCES.map(({ value, label }) => (
        <OptionButton
          key={value}
          label={label}
          selected={form.sexual_preference === value}
          onClick={() => setForm((p) => ({ ...p, sexual_preference: value }))}
        />
      ))}
    </div>
  );
}

// ── Step 3: Bio ───────────────────────────────────────────────────────────────
function Step3Bio({
  form,
  setForm,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
}) {
  return (
    <div>
      <p className="text-xs text-(--color-text)/60 mb-3">
        Tell others a little about yourself. What makes you, you?
      </p>
      <textarea
        value={form.biography}
        onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
        placeholder="I love hiking on weekends, experimenting with new recipes, and finding hidden gem coffee shops..."
        maxLength={500}
        rows={5}
        className="w-full rounded-xl border border-(--color-text)/15 bg-white/40 px-4 py-3 text-sm text-(--color-text) placeholder:text-(--color-text)/35 focus:outline-none focus:border-(--color-primary) resize-none transition-colors"
      />
      <p className="text-right text-xs text-(--color-text)/40 mt-1">
        {form.biography.length}/500
      </p>
    </div>
  );
}

// ── Step 4: Tags ──────────────────────────────────────────────────────────────
function Step4Tags({
  form,
  setForm,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
}) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const normalized = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    if (!normalized || normalized === '#' || form.tags.includes(normalized)) return;
    setForm((p) => ({ ...p, tags: [...p.tags, normalized] }));
    setInput('');
  };

  const removeTag = (tag: string) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.trim());
    }
  };

  return (
    <div>
      <p className="text-xs text-(--color-text)/60 mb-3">
        Add interests so others can find you. Press Enter or comma to add.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="#vegan, #geek…"
          className="flex-1 rounded-xl border border-(--color-text)/15 bg-white/40 px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text)/35 focus:outline-none focus:border-(--color-primary) transition-colors"
        />
        <button
          type="button"
          onClick={() => addTag(input.trim())}
          className="px-3 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium"
        >
          Add
        </button>
      </div>

      {form.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-(--color-primary)/15 text-(--color-primary) text-xs font-medium"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-(--color-text)/50 mb-2">Suggestions:</p>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="px-2.5 py-1 rounded-full border border-(--color-text)/15 bg-white/40 text-(--color-text)/60 text-xs hover:border-(--color-primary)/50 hover:text-(--color-primary) transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 5: Location ──────────────────────────────────────────────────────────
function Step5Location({
  form,
  setForm,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
}) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setGpsLoading(false);
      },
      () => {
        setGpsError('Could not get your location. Please enter it manually.');
        setGpsLoading(false);
      },
    );
  };

  return (
    <div>
      <p className="text-xs text-(--color-text)/60 mb-4">
        Your location helps us show you relevant matches nearby.
      </p>

      <button
        type="button"
        onClick={useGPS}
        disabled={gpsLoading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all mb-3 ${
          form.latitude
            ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary)'
            : 'border-(--color-text)/15 bg-white/40 text-(--color-text) hover:border-(--color-primary)/40'
        }`}
      >
        <MapPin size={14} />
        {gpsLoading
          ? 'Detecting…'
          : form.latitude
          ? 'Location detected ✓'
          : 'Use my current location'}
      </button>

      {gpsError && <p className="text-xs text-red-500 mb-3">{gpsError}</p>}

      <div className="relative flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-(--color-text)/10" />
        <span className="text-xs text-(--color-text)/40">or enter manually</span>
        <div className="flex-1 h-px bg-(--color-text)/10" />
      </div>

      <input
        value={form.location_city}
        onChange={(e) => setForm((p) => ({ ...p, location_city: e.target.value }))}
        placeholder="City or neighborhood (e.g. Paris, Montmartre)"
        className="w-full rounded-xl border border-(--color-text)/15 bg-white/40 px-4 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text)/35 focus:outline-none focus:border-(--color-primary) transition-colors"
      />
    </div>
  );
}

// ── Step 6: Photos ────────────────────────────────────────────────────────────
function Step6Photos({
  form,
  setForm,
}: {
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setForm((p) => {
      const combined = [...p.photos, ...files].slice(0, 5);
      return { ...p, photos: combined };
    });
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setForm((p) => ({ ...p, photos: p.photos.filter((_, i) => i !== index) }));
  };

  return (
    <div>
      <p className="text-xs text-(--color-text)/60 mb-3">
        Add up to 5 photos. The first one will be your profile picture.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {form.photos.map((file, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-(--color-text)/5">
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="w-full h-full object-cover"
            />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                Main
              </span>
            )}
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {form.photos.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-(--color-text)/20 flex flex-col items-center justify-center gap-1 text-(--color-text)/40 hover:border-(--color-primary)/50 hover:text-(--color-primary) transition-colors"
          >
            <Camera size={18} />
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      <p className="text-xs text-(--color-text)/40 text-center">
        {form.photos.length}/5 photos added
      </p>
    </div>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

interface StepConfig {
  title: string;
  icon: React.ElementType;
  /**
   * Whether the user is allowed to skip this specific step.
   * Birthdate is the only required step (cannot be skipped).
   */
  skippable: boolean;
}

const STEPS: StepConfig[] = [
  { title: 'When were you born?',  icon: Calendar, skippable: false },
  { title: "What's your gender?",  icon: User,     skippable: true  },
  { title: 'Who are you into?',    icon: Heart,    skippable: true  },
  { title: 'Write your bio',       icon: FileText, skippable: true  },
  { title: 'Your interests',       icon: Tag,      skippable: true  },
  { title: 'Your location',        icon: MapPin,   skippable: true  },
  { title: 'Add your photos',      icon: Camera,   skippable: true  },
];

// ─── Main component ───────────────────────────────────────────────────────────

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    birthdate: '',
    gender: '',
    sexual_preference: '',
    biography: '',
    tags: [],
    location_city: '',
    latitude: null,
    longitude: null,
    photos: [],
  });

  const isLast = step === STEPS.length - 1;

  // Per-step hard validation (only birthdate is strictly required)
  const isStepValid = (): { valid: boolean; message: string } => {
    switch (step) {
      case 0: {
        if (!form.birthdate) return { valid: false, message: 'Please enter your date of birth.' };
        const age = calcAge(form.birthdate);
        if (age === null || age < 18)
          return { valid: false, message: 'You must be at least 18 years old.' };
        return { valid: true, message: '' };
      }
      default:
        return { valid: true, message: '' };
    }
  };

  const handleNext = () => {
    setError('');
    const { valid, message } = isStepValid();
    if (!valid) { setError(message); return; }
    setStep((s) => s + 1);
  };

  // Skip just this step (advances without saving any value)
  const handleSkipStep = () => {
    setError('');
    setStep((s) => s + 1);
  };

  // Skip the entire setup — save whatever was filled in so far so the
  // route guard (which checks profile completeness) lets the user through.
  const handleSkipAll = async () => {
    try {
      await profileApi.savePartial(form);
    } catch {
      // Ignore — partial saves may fail validation; we navigate anyway.
    }
    navigate('/browse');
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setError('');
    const { valid, message } = isStepValid();
    if (!valid) { setError(message); return; }

    setLoading(true);
    try {
      const profileBody: Record<string, unknown> = {
        birth_date: form.birthdate || undefined,
        gender: form.gender || undefined,
        sexual_preference: form.sexual_preference || undefined,
        biography: form.biography || undefined,
        location_city: form.location_city || undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      };
      await profileApi.updateProfile(profileBody);

      if (form.tags.length > 0) {
        await profileApi.updateTags(form.tags);
      }

      for (const file of form.photos) {
        await profileApi.uploadPhoto(file);
      }

      navigate('/browse');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <Step0Birthdate form={form} setForm={setForm} />;
      case 1: return <Step1Gender    form={form} setForm={setForm} />;
      case 2: return <Step2Preference form={form} setForm={setForm} />;
      case 3: return <Step3Bio       form={form} setForm={setForm} />;
      case 4: return <Step4Tags      form={form} setForm={setForm} />;
      case 5: return <Step5Location  form={form} setForm={setForm} />;
      case 6: return <Step6Photos    form={form} setForm={setForm} />;
      default: return null;
    }
  };

  const currentStep = STEPS[step];

  return (
    <AuthLayout header="Let's set up your profile">
      <StepDots total={STEPS.length} current={step} />

      {/* Step header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-(--color-primary)/15 flex items-center justify-center flex-shrink-0">
          {(() => {
            const Icon = currentStep.icon;
            return <Icon size={14} className="text-(--color-primary)" />;
          })()}
        </div>
        <h2 className="text-sm font-semibold text-(--color-text)">{currentStep.title}</h2>
      </div>

      {/* Step content */}
      <div className="min-h-[220px]">
        {renderStep()}
      </div>

      {error && (
        <p className="text-xs text-(--color-error) mt-2 mb-1 text-center">{error}</p>
      )}

      {/* Navigation */}
      <div className={`flex gap-2 mt-4 ${step === 0 ? 'justify-end' : 'justify-between'}`}>
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-(--color-text)/15 text-sm text-(--color-text)/70 hover:border-(--color-primary)/40 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Skip this step — only shown on skippable, non-last steps */}
          {currentStep.skippable && !isLast && (
            <button
              type="button"
              onClick={handleSkipStep}
              className="text-xs text-(--color-text)/40 hover:text-(--color-text)/60 px-2 transition-colors"
            >
              Skip step
            </button>
          )}

          <Button
            type="button"
            disabled={loading}
            onClick={isLast ? handleSubmit : handleNext}
            withArrow={false}
          >
            {loading
              ? 'Saving…'
              : isLast
              ? 'Complete setup'
              : (
                <span className="flex items-center gap-1 justify-center">
                  Next <ChevronRight size={14} />
                </span>
              )}
          </Button>
        </div>
      </div>

      {/* Last step: also show skip-this-step as "skip photos" */}
      {isLast && currentStep.skippable && (
        <p className="text-center mt-2">
          <button
            type="button"
            onClick={handleSkipAll}
            className="text-xs text-(--color-text)/40 hover:text-(--color-text)/60 transition-colors"
          >
            Skip photos & finish later
          </button>
        </p>
      )}

      {/* Global skip */}
      <p className="text-center mt-3">
        <button
          type="button"
          onClick={handleSkipAll}
          className="text-xs text-(--color-text)/40 hover:text-(--color-text)/60 transition-colors"
        >
          Skip for now
        </button>
      </p>
    </AuthLayout>
  );
};

export default ProfileSetupPage;
