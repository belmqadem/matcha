// src/components/map/MapHeader.tsx
import { MapPin, Loader2, Heart } from 'lucide-react';

// Define the type here to avoid import errors from types/map.ts
export type MapFilter = 'all' | 'online';

const RADIUS_OPTIONS = [10, 25, 50, 100];

interface MapHeaderProps {
  userCount: number;
  loading: boolean;
  radiusKm: number;
  filter: MapFilter;
  gpsLoading: boolean;
  onRadiusChange: (km: number) => void;
  onFilterChange: (f: MapFilter) => void;
  onGps: () => void;
}

export default function MapHeader({
  userCount,
  loading,
  radiusKm,
  filter,
  gpsLoading,
  onRadiusChange,
  onFilterChange,
  onGps,
}: MapHeaderProps) {
  return (
    <header className="flex items-center justify-between flex-wrap gap-3 px-5 py-3 bg-surface border-b border-border shrink-0">
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <Heart size={18} className="text-primary fill-primary" />
        <h1 className="text-[18px] font-black text-text">Map</h1>
        {!loading && (
          <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {userCount} nearby
          </span>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {/* Radius */}
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-text-muted font-medium">Radius</span>
          {RADIUS_OPTIONS.map((km) => (
            <button
              key={km}
              onClick={() => onRadiusChange(km)}
              className={`px-2.5 py-1 rounded-full text-[12px] font-bold transition-all border ${
                radiusKm === km
                  ? 'bg-primary text-surface border-primary'
                  : 'bg-transparent text-text-muted border-border hover:border-primary/50 hover:text-text'
              }`}
            >
              {km}km
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1">
          {(['all', 'online'] as MapFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all border ${
                filter === f
                  ? 'bg-text text-surface border-text'
                  : 'bg-transparent text-text-muted border-border hover:border-text-muted hover:text-text'
              }`}
            >
              {f === 'all' ? 'All' : '🟢 Online'}
            </button>
          ))}
        </div>

        {/* GPS */}
        <button
          onClick={onGps}
          disabled={gpsLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold bg-primary text-surface hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
        >
          {gpsLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <MapPin size={13} />
          )}
          {gpsLoading ? 'Locating…' : 'Use GPS'}
        </button>
      </div>
    </header>
  );
}
