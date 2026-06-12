// src/components/profile/EditLocationModal.tsx
import { useState } from 'react';
import { MapPin, Loader2, Shield } from 'lucide-react';
import { userService } from '@/services/userService';
import type { UserProfile } from '@/types/user';
import { EditModal } from './EditModal';
import { SaveBar } from './SaveBar';

const inputCls = 'w-full bg-background border-2 border-transparent rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-text placeholder-text-muted outline-none focus:border-primary transition-all';
const labelCls = 'block text-[0.65rem] sm:text-xs font-bold tracking-widest uppercase text-text-muted mb-2';

interface Props {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
  onClose: () => void;
}

export function EditLocationModal({ user, onUpdate, onClose }: Props) {
  const [cityInput,  setCityInput]  = useState(user.location_city ?? '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords,  setGpsCoords]  = useState<{ lat: number; lng: number } | null>(
    user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null,
  );

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }

    setGpsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      pos => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false); },
      ()  => { setError('Could not get GPS. Enter city manually.'); setGpsLoading(false); },
    );
  };

  const handleSave = async () => {
    const finalLat = gpsCoords?.lat ?? user.latitude;
    const finalLng = gpsCoords?.lng ?? user.longitude;

    if (finalLat == null || finalLng == null) {
      setError('GPS coordinates are required. Please detect location.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await userService.updateLocation({
        latitude:      finalLat,
        longitude:     finalLng,
        location_city: cityInput.trim() || undefined,
      });

      onUpdate({
        ...user,
        latitude:      finalLat,
        longitude:     finalLng,
        location_city: cityInput.trim() || user.location_city,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditModal title="Edit Location" onClose={onClose}>
      <div className="flex flex-col gap-5 sm:gap-6">
        <div>
          <label className={labelCls}>GPS location</label>
          <button
            type="button"
            onClick={useGPS}
            disabled={gpsLoading}
            className={`w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-2xl border-2 text-sm sm:text-base font-bold cursor-pointer transition-all active:scale-95 ${
              gpsCoords
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-text-muted hover:text-text'
            }`}
          >
            {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {gpsLoading ? 'Detecting coordinates…' : gpsCoords ? 'GPS Coordinates detected ✓' : 'Use my current GPS location'}
          </button>
          <p className="text-[0.65rem] sm:text-xs font-bold text-primary/80 mt-2 flex items-center gap-1.5">
            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Only used for distance calculation.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-[2px] bg-background" />
          <span className="text-[0.65rem] sm:text-xs font-black text-text-muted uppercase tracking-widest">or</span>
          <div className="flex-1 h-[2px] bg-background" />
        </div>

        <div>
          <label className={labelCls}>City Name (Display only)</label>
          <input
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="e.g. Paris, Marais district"
            className={inputCls}
          />
        </div>

        <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={onClose} />
      </div>
    </EditModal>
  );
}
