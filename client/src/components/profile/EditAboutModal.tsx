// src/components/profile/EditAboutModal.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, Info, MapPin, Loader2, Shield } from 'lucide-react';
import { userService } from '@/services/userService';
import type { UserProfile } from '@/types/user';
import { GENDERS, PREFERENCES } from './profileConstants';
import { EditModal } from './EditModal';
import { SaveBar } from './SaveBar';

const inputCls =
  'w-full bg-background border-2 border-transparent rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-text placeholder-text-muted outline-none focus:border-primary transition-all';
const labelCls =
  'block text-[0.65rem] sm:text-xs font-bold tracking-widest uppercase text-text-muted mb-2';

interface Props {
  user: UserProfile;
  onUpdate: (_u: UserProfile) => void;
  onClose: () => void;
}

export function EditAboutModal({ user, onUpdate, onClose }: Props) {
  const [form, setForm] = useState({
    gender: user.gender ?? '',
    sexual_preference: user.sexual_preference ?? '',
    biography: user.biography ?? '',
    age: user.birth_date
      ? String(new Date().getFullYear() - new Date(user.birth_date).getFullYear())
      : '',
  });

  const [cityInput, setCityInput] = useState(user.location_city ?? '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    user.latitude && user.longitude
      ? { lat: Number(user.latitude), lng: Number(user.longitude) }
      : null,
  );

  const [saving, setSaving] = useState(false);

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported.');
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        toast.error('Could not get GPS. Enter city manually.');
        setGpsLoading(false);
      },
    );
  };

  const handleSave = async () => {
    if (!form.age || parseInt(form.age) < 18) {
      toast.error('You must be at least 18.');
      return;
    }

    setSaving(true);

    try {
      // 1. Save location changes if GPS or City Name changed
      const finalLat = gpsCoords?.lat ?? user.latitude;
      const finalLng = gpsCoords?.lng ?? user.longitude;

      const cityChanged = cityInput.trim() !== (user.location_city ?? '');
      const gpsChanged =
        gpsCoords !== null && (gpsCoords.lat !== user.latitude || gpsCoords.lng !== user.longitude);

      if (gpsChanged || cityChanged) {
        if (finalLat == null || finalLng == null) {
          toast.error('GPS location coordinates are required. Please detect your location.');
          setSaving(false);
          return;
        }
        await userService.updateLocation({
          latitude: finalLat,
          longitude: finalLng,
          location_city: cityInput.trim() || undefined,
        });
      }

      // 2. Save profile changes
      const birthDate = new Date(new Date().getFullYear() - parseInt(form.age), 0, 1)
        .toISOString()
        .split('T')[0];

      const updated = await userService.patchProfile({
        gender: form.gender || undefined,
        sexual_preference: form.sexual_preference || undefined,
        biography: form.biography || undefined,
        birth_date: birthDate,
      } as Partial<UserProfile>);

      // 3. Update callback with merged profile & location
      onUpdate({
        ...updated,
        latitude: finalLat,
        longitude: finalLng,
        location_city: cityInput.trim() || updated.location_city || user.location_city,
      });

      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditModal title="Edit About & Location" onClose={onClose}>
      <div className="flex flex-col gap-4 sm:gap-5 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin">
        {/* Core details: Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Age</label>
            <input
              value={form.age}
              type="number"
              min={18}
              max={99}
              onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
              className={inputCls}
              placeholder="Your age"
            />
          </div>
          <div>
            <label className={labelCls}>Gender</label>
            <div className="relative">
              <select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className={`${inputCls} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">Not specified</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Orientation */}
        <div>
          <label className={labelCls}>Sexual orientation</label>
          <div className="relative">
            <select
              value={form.sexual_preference}
              onChange={(e) => setForm((p) => ({ ...p, sexual_preference: e.target.value }))}
              className={`${inputCls} appearance-none pr-10 cursor-pointer`}
            >
              <option value="">Not specified (defaults to bisexual)</option>
              {PREFERENCES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          {!form.sexual_preference && (
            <p className="text-[0.65rem] sm:text-xs font-bold text-primary/80 mt-2 flex items-center gap-1.5 animate-fade-in-up">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Will default to bisexual.
            </p>
          )}
        </div>

        {/* Biography */}
        <div>
          <label className={labelCls}>Biography</label>
          <textarea
            value={form.biography}
            onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
            maxLength={500}
            rows={3}
            placeholder="Tell others who you are…"
            className={`${inputCls} resize-none scrollbar-thin`}
          />
          <p className="text-right text-[0.65rem] sm:text-xs font-bold text-text-muted mt-1">
            {form.biography.length}/500
          </p>
        </div>

        {/* Location Section Divider */}
        <div className="flex items-center gap-4 py-1.5">
          <div className="flex-1 h-[1px] bg-border/60" />
          <span className="text-[0.6rem] sm:text-[10px] font-black text-primary uppercase tracking-widest">
            Location Settings
          </span>
          <div className="flex-1 h-[1px] bg-border/60" />
        </div>

        {/* Location GPS detect */}
        <div>
          <label className={labelCls}>GPS location</label>
          <button
            type="button"
            onClick={useGPS}
            disabled={gpsLoading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-bold cursor-pointer transition-all active:scale-95 ${
              gpsCoords
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-text-muted hover:text-text'
            }`}
          >
            {gpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {gpsLoading
              ? 'Detecting coordinates…'
              : gpsCoords
                ? 'GPS Coordinates detected ✓'
                : 'Use my current GPS location'}
          </button>
          <p className="text-[0.65rem] sm:text-xs font-bold text-primary/80 mt-1.5 flex items-center gap-1.5">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Only used for distance calculation.
          </p>
        </div>

        {/* City name input */}
        <div>
          <label className={labelCls}>City Name (Display only)</label>
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="e.g. Paris, Marais district"
            className={inputCls}
          />
        </div>

        <SaveBar saving={saving} error="" onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}
