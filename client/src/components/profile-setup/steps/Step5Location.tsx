// src/components/profile-setup/steps/Step5Location.tsx
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
    <div className="w-full">
      <p className="text-xs sm:text-sm text-text-muted mb-5 italic">
        Your location helps us show you relevant matches nearby.
      </p>

      <button
        type="button"
        onClick={useGPS}
        disabled={gpsLoading}
        className={`
          w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:py-4 rounded-xl
          border-2 font-semibold text-sm sm:text-base mb-4 transition-all duration-200 active:scale-95
          ${
            form.latitude
              ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/20'
              : 'border-border bg-surface text-text hover:bg-border/50'
          }
          disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        `}
      >
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>
          {gpsLoading
            ? 'Detecting…'
            : form.latitude
              ? 'Location detected ✓'
              : 'Use my current location'}
        </span>
      </button>

      {gpsError && (
        <p className="text-xs sm:text-sm font-medium text-error mb-4 animate-fade-in-up">{gpsError}</p>
      )}

      <div className="flex items-center gap-3 sm:gap-4 my-5 sm:my-6">
        <div className="flex-1 h-[2px] bg-border" />
        <span className="text-xs sm:text-sm font-medium text-text-muted opacity-80 uppercase tracking-wider">or enter manually</span>
        <div className="flex-1 h-[2px] bg-border" />
      </div>

      <input
        value={form.location_city}
        onChange={(e) => setForm((p) => ({ ...p, location_city: e.target.value }))}
        placeholder="City or neighborhood (e.g. Paris, Montmartre)"
        className={`
          w-full px-4 py-3 sm:py-4 rounded-xl border-2 text-text text-sm sm:text-base outline-none
          transition-all duration-200
          ${
            form.location_city
              ? 'border-primary bg-surface shadow-md shadow-primary/20'
              : 'border-border bg-surface focus:border-primary/50'
          }
        `}
      />
    </div>
  );
};
