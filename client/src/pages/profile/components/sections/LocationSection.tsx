import { useState } from 'react';
import { Edit2, MapPin, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { Section, SaveBar, inputCls, labelCls } from '../ui';
import { api } from "../../../../api/MyProfileApi";
import type { UserProfile } from '../../types';

interface LocationSectionProps {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}

export function LocationSection({ user, onUpdate }: LocationSectionProps) {
  const [editing, setEditing] = useState(false);
  const [cityInput, setCityInput] = useState(user.location_city ?? '');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    user.latitude && user.longitude
      ? { lat: user.latitude, lng: user.longitude }
      : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const useGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setError('Could not get GPS location. Please enter your city manually.');
        setGpsLoading(false);
      },
    );
  };

  const handleSave = async () => {
    if (!cityInput.trim() && !gpsCoords) {
      setError('A location is required. Use GPS or enter a city.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body: Record<string, unknown> = {};
      if (gpsCoords) { body.latitude = gpsCoords.lat; body.longitude = gpsCoords.lng; }
      if (cityInput.trim()) body.location_city = cityInput.trim();
      await api.updateLocation(body);
      onUpdate({
        ...user,
        location_city: cityInput.trim() || user.location_city,
        latitude:  gpsCoords?.lat ?? user.latitude,
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
      user.latitude && user.longitude
        ? { lat: user.latitude, lng: user.longitude }
        : null,
    );
    setError('');
    setEditing(false);
  };

  const lat        = user.latitude  != null ? Number(user.latitude)  : null;
  const lng        = user.longitude != null ? Number(user.longitude) : null;
  const hasLocation = user.location_city || lat;

  return (
    <Section label="Location">
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-(--color-text-muted)">Required for nearby match suggestions</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:opacity-70 transition-opacity"
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
        </div>

        {!editing && !hasLocation && (
          <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={10} />
            Location is required to browse suggested profiles and appear in others' matches.
          </p>
        )}

        {editing ? (
          <div className="space-y-3 mt-3">
            <div>
              <p className={labelCls}>Option 1 — GPS (precise)</p>
              <button
                type="button"
                onClick={useGPS}
                disabled={gpsLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all
                  ${gpsCoords
                    ? 'border-(--color-primary) bg-(--color-primary)/5 text-(--color-primary)'
                    : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary)'
                  }`}
              >
                {gpsLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <MapPin size={14} />
                }
                {gpsLoading
                  ? 'Detecting your location…'
                  : gpsCoords
                    ? '✓ GPS location detected'
                    : 'Share my current GPS location'
                }
              </button>
              <p className="text-[10px] text-(--color-text-muted)/50 mt-1 flex items-center gap-1">
                <Shield size={9} /> Your precise location is only used for matching. You consent by clicking above.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-(--color-border)" />
              <span className="text-[10px] text-(--color-text-muted)/50 tracking-widest uppercase">or</span>
              <div className="flex-1 h-px bg-(--color-border)" />
            </div>

            <div>
              <label className={labelCls}>Option 2 — City / Neighbourhood (manual)</label>
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Paris, Marais district"
                className={inputCls}
              />
            </div>

            <SaveBar saving={saving} error={error} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 mt-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${hasLocation ? 'bg-(--color-primary)/10' : 'bg-gray-100'}`}>
              <MapPin size={13} className={hasLocation ? 'text-(--color-primary)' : 'text-gray-400'} />
            </div>
            {user.location_city ? (
              <div>
                <span className="text-sm font-medium text-(--color-text)">{user.location_city}</span>
                {lat && (
                  <span className="text-[10px] text-(--color-text-muted) ml-2">
                    + GPS ({lat.toFixed(3)}, {lng?.toFixed(3)})
                  </span>
                )}
              </div>
            ) : lat ? (
              <span className="text-sm text-(--color-text-muted)">
                GPS: {lat.toFixed(4)}, {lng?.toFixed(4)}
              </span>
            ) : (
              <span className="text-xs text-(--color-text-muted)/50 italic">
                No location set — matching features are limited.
              </span>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
