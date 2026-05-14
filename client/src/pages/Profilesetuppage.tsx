import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { MapPin, User, Heart, FileText, Tag, Camera, ChevronRight, ChevronLeft, X, Check } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female' | 'non-binary' | 'other';
type SexualPreference = 'heterosexual' | 'homosexual' | 'bisexual';

interface ProfileForm {
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
};

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

      {/* Tag input */}
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

      {/* Selected tags */}
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

      {/* Suggestions */}
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

      {/* GPS button */}
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
    // reset input so same file can be re-selected
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

// ─── Main component ───────────────────────────────────────────────────────────

const STEPS = [
  { title: 'What\'s your gender?', icon: User },
  { title: 'Who are you into?', icon: Heart },
  { title: 'Write your bio', icon: FileText },
  { title: 'Your interests', icon: Tag },
  { title: 'Your location', icon: MapPin },
  { title: 'Add your photos', icon: Camera },
];

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    gender: '',
    sexual_preference: '',
    biography: '',
    tags: [],
    location_city: '',
    latitude: null,
    longitude: null,
    photos: [],
  });

  const isStepValid = () => {
    switch (step) {
      case 0: return form.gender !== '';
      case 1: return form.sexual_preference !== '';
      case 2: return form.biography.trim().length >= 10;
      case 3: return form.tags.length >= 1;
      case 4: return form.location_city.trim() !== '' || form.latitude !== null;
      case 5: return form.photos.length >= 1;
      default: return true;
    }
  };

  const handleNext = () => {
    setError('');
    if (!isStepValid()) {
      const messages = [
        'Please select your gender.',
        'Please select your sexual preference.',
        'Bio must be at least 10 characters.',
        'Add at least one interest tag.',
        'Please provide your location.',
        'Please add at least one photo.',
      ];
      setError(messages[step]);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setError('');
    if (!isStepValid()) {
      setError('Please add at least one photo.');
      return;
    }
    setLoading(true);
    try {
      // 1. Update profile fields
      const profileBody: Record<string, unknown> = {
        gender: form.gender,
        sexual_preference: form.sexual_preference,
        biography: form.biography,
        location_city: form.location_city || undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
      };
      await profileApi.updateProfile(profileBody);

      // 2. Update tags
      await profileApi.updateTags(form.tags);

      // 3. Upload photos sequentially
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

  const isLast = step === STEPS.length - 1;

  const renderStep = () => {
    switch (step) {
      case 0: return <Step1Gender form={form} setForm={setForm} />;
      case 1: return <Step2Preference form={form} setForm={setForm} />;
      case 2: return <Step3Bio form={form} setForm={setForm} />;
      case 3: return <Step4Tags form={form} setForm={setForm} />;
      case 4: return <Step5Location form={form} setForm={setForm} />;
      case 5: return <Step6Photos form={form} setForm={setForm} />;
      default: return null;
    }
  };

  return (
    <AuthLayout header="Let's set up your profile">
      <StepDots total={STEPS.length} current={step} />

      {/* Step header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-(--color-primary)/15 flex items-center justify-center flex-shrink-0">
          {(() => {
            const Icon = STEPS[step].icon;
            return <Icon size={14} className="text-(--color-primary)" />;
          })()}
        </div>
        <h2 className="text-sm font-semibold text-(--color-text)">{STEPS[step].title}</h2>
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
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-(--color-text)/15 text-sm text-(--color-text)/70 hover:border-(--color-primary)/40 transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        )}
        <Button
          type="button"
          disabled={loading}
          onClick={isLast ? handleSubmit : handleNext}
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

      {/* Skip option */}
      <p className="text-center mt-3">
        <button
          type="button"
          onClick={() => navigate('/browse')}
          className="text-xs text-(--color-text)/40 hover:text-(--color-text)/60 transition-colors"
        >
          Skip for now
        </button>
      </p>
    </AuthLayout>
  );
};

export default ProfileSetupPage;
