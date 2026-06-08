import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { ProfileFormData } from '../../../types/profileSetup';

interface Step5LocationProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step5Location = ({ form, setForm }: Step5LocationProps) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported.');
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
        setGpsError('Could not get your location. Enter it manually.');
        setGpsLoading(false);
      }
    );
  };

  return (
    <div>
      <p className="text-xs text-text-muted mb-4 italic">
        Your location helps us show you relevant matches nearby.
      </p>

      {/* GPS button */}
      <button
        type="button"
        onClick={useGPS}
        disabled={gpsLoading}
        className={`
          w-full flex items-center justify-center gap-2 px-3 py-3.25 rounded-[14px]
          border-[1.5px] font-medium text-sm mb-3 transition-all duration-200
          ${
            form.latitude
              ? 'border-primary bg-primary/7 text-primary shadow-md shadow-primary/16'
              : 'border-border bg-white text-text'
          }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        <MapPin size={15} />
        <span>
          {gpsLoading
            ? 'Detecting…'
            : form.latitude
              ? '📍 Location detected ✓'
              : 'Use my current location'}
        </span>
      </button>

      {/* GPS error */}
      {gpsError && (
        <p className="text-xs text-error mb-2.5">{gpsError}</p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-2.5 my-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted opacity-60">or enter manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Manual input */}
      <input
        value={form.location_city}
        onChange={(e) =>
          setForm((p) => ({ ...p, location_city: e.target.value }))
        }
        placeholder="City or neighborhood (e.g. Paris, Montmartre)"
        className={`
          w-full px-4 py-3 rounded-[14px] border-[1.5px] text-sm
          transition-all duration-200
          ${
            form.location_city
              ? 'border-primary bg-white shadow-md shadow-primary/14'
              : 'border-border bg-white'
          }
        `}
      />
    </div>
  );
};
