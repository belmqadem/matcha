// src/components/profile/AboutPanel.tsx
import { Edit2 } from 'lucide-react';
import { CityName } from '@/components/ui/CityName';
import type { UserProfile } from '@/types/user';
import { GENDERS, PREFERENCES, DEFAULT_PREFERENCE } from './profileConstants';

interface Props {
  user: UserProfile;
  onEditAbout: () => void;
  onEditLocation: () => void;
}

export function AboutPanel({ user, onEditAbout, onEditLocation }: Props) {
  const genderLabel = GENDERS.find((g) => g.value === user.gender)?.label;
  const prefLabel =
    PREFERENCES.find((p) => p.value === user.sexual_preference)?.label ??
    PREFERENCES.find((p) => p.value === DEFAULT_PREFERENCE)?.label;

  const lat = user.latitude != null ? Number(user.latitude) : null;
  const lng = user.longitude != null ? Number(user.longitude) : null;

  const rows = [
    {
      label: 'City',
      value: user.location_city ?? (lat ? `${lat.toFixed(3)}, ${lng?.toFixed(3)}` : null),
      action: onEditLocation,
      isCity: true,
    },
    {
      label: 'Age',
      value: user.birth_date
        ? `${new Date().getFullYear() - new Date(user.birth_date).getFullYear()} years old`
        : null,
      action: onEditAbout,
      isCity: false,
    },
    { label: 'Gender', value: genderLabel ?? null, action: onEditAbout, isCity: false },
    { label: 'Orientation', value: prefLabel ?? null, action: onEditAbout, isCity: false },
  ];

  return (
    <div className="bg-white rounded-[32px] p-7 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-black text-text">About Me</h3>
        <button
          onClick={onEditAbout}
          className="text-[13px] font-bold text-primary flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <Edit2 size={14} /> Edit Data
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {rows.map(({ label, value, isCity }) => (
          <div key={label} className="border-b-2 border-background pb-3">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
              {label}
            </p>
            <p
              className={`text-[15px] font-bold ${value ? 'text-text' : 'text-text-muted opacity-60'}`}
            >
              {isCity && lat ? (
                <CityName lat={lat} lng={lng!} fallback={user.location_city} />
              ) : (
                (value ?? 'Not set')
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
