import { useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Search, Loader2 } from 'lucide-react';
import type { ProfileFormData } from '../../../types/profileSetup';
import { mapService } from '@/services/mapService';

interface Step5LocationProps {
  form: ProfileFormData;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const Step5Location = ({ form, setForm }: Step5LocationProps) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.');
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location_city: '',
        }));
        setGpsLoading(false);
      },
      () => {
        toast.error('GPS access denied. Enter your city below.');
        setGpsLoading(false);
      },
    );
  };

  const searchCity = async () => {
    const query = cityInput.trim();
    if (!query) {
      toast.error('Please enter a city name.');
      return;
    }

    setSearchLoading(true);
    const result = await mapService.forwardGeocode(query);
    setSearchLoading(false);

    if (!result) {
      toast.error('City not found. Try a different name.');
      return;
    }

    const shortName = result.displayName.split(',')[0].trim();
    setForm((p) => ({
      ...p,
      latitude: result.lat,
      longitude: result.lng,
      location_city: shortName,
    }));
    setCityInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void searchCity();
    }
  };

  const locationSet = form.latitude !== null && form.longitude !== null;

  return (
    <div className="w-full">
      <p className="text-xs sm:text-sm text-text-muted mb-5 italic">
        Your location helps us show you relevant matches nearby.
      </p>

      {/* GPS button */}
      <button
        type="button"
        onClick={useGPS}
        disabled={gpsLoading}
        className={`
          w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:py-4 rounded-xl
          border-2 font-semibold text-sm sm:text-base mb-4 transition-all duration-200 active:scale-95
          ${
            locationSet && !form.location_city
              ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/20'
              : 'border-border bg-surface text-text hover:bg-border/50'
          }
          disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        `}
      >
        {gpsLoading ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        <span>
          {gpsLoading
            ? 'Detecting…'
            : locationSet && !form.location_city
              ? 'GPS location detected ✓'
              : 'Use my current location'}
        </span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted font-medium uppercase tracking-wider">or enter manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* City search */}
      <div className="flex gap-2">
        <input
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="City name, e.g. Paris"
          className={`
            flex-1 px-4 py-3 sm:py-4 rounded-xl border-2 text-text text-sm sm:text-base outline-none
            transition-all duration-200 bg-surface
            ${cityInput ? 'border-primary/50' : 'border-border focus:border-primary/50'}
          `}
        />
        <button
          type="button"
          onClick={() => void searchCity()}
          disabled={searchLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-4 rounded-xl bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {searchLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Confirmed city */}
      {locationSet && form.location_city && (
        <div className="mt-4 p-3 sm:p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-2 animate-fade-in-up">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs sm:text-sm text-primary font-semibold">{form.location_city} ✓</p>
        </div>
      )}
    </div>
  );
};
