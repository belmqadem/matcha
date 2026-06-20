import { MapPin, Loader2, Navigation } from 'lucide-react';

const RADIUS_OPTIONS = [10, 25, 50, 100];

interface MapHeaderProps {
  userCount: number;
  loading: boolean;
  radiusKm: number;
  gpsLoading: boolean;
  onRadiusChange: (_km: number) => void;
  onGps: () => void;
}

export default function MapHeader({
  userCount,
  loading,
  radiusKm,
  gpsLoading,
  onRadiusChange,
  onGps,
}: MapHeaderProps) {
  return (
    <header className="shrink-0 bg-surface border-b border-border px-4 sm:px-5 py-3">
      {/* Row 1 — title + GPS */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0">
            <MapPin size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-text leading-none">Nearby</h1>
            <p className="text-[11px] text-text-muted mt-0.5 leading-none">
              {loading ? 'Loading…' : `${userCount} ${userCount === 1 ? 'person' : 'people'} around you`}
            </p>
          </div>
        </div>

        <button
          onClick={onGps}
          disabled={gpsLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold bg-primary text-white hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-60 shrink-0 shadow-sm shadow-primary/20"
        >
          {gpsLoading
            ? <Loader2 size={13} className="animate-spin" />
            : <Navigation size={13} />}
          <span className="hidden sm:inline">{gpsLoading ? 'Locating…' : 'Use GPS'}</span>
          <span className="sm:hidden">{gpsLoading ? '…' : 'GPS'}</span>
        </button>
      </div>

      {/* Row 2 — radius pills */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0">
          Radius
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {RADIUS_OPTIONS.map((km) => (
            <button
              key={km}
              onClick={() => onRadiusChange(km)}
              className={`px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                radiusKm === km
                  ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                  : 'bg-background text-text-muted border-border hover:border-primary/50 hover:text-text'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
