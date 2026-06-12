// src/components/search/FilterSidebar.tsx
import { Search, Eye, Flame, MapPin, Tag } from 'lucide-react';
import type { SearchFilters } from '@/types/search';

interface FilterSidebarProps {
  filters: SearchFilters;
  activeCount: number;
  onChange: (key: keyof SearchFilters, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export function FilterSidebar({
  filters,
  activeCount,
  onChange,
  onSubmit,
  onClear,
}: FilterSidebarProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-surface rounded-3xl border border-border p-5 sm:p-6 shadow-sm flex flex-col gap-5 sm:gap-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-black text-text tracking-tight uppercase">Filters</h2>
        {activeCount > 0 && (
          <span className="bg-primary text-surface text-[0.65rem] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-sm">
            {activeCount}
          </span>
        )}
      </div>

      {/* Age */}
      <div>
        <label className="flex items-center gap-1.5 text-[0.65rem] sm:text-xs font-black text-text-muted uppercase tracking-widest mb-2 sm:mb-3">
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Age Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="18"
            min={18}
            max={120}
            value={filters.age_min}
            onChange={(e) => onChange('age_min', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 transition-all text-text"
          />
          <span className="text-text-muted text-xs sm:text-sm">–</span>
          <input
            type="number"
            placeholder="99"
            min={18}
            max={120}
            value={filters.age_max}
            onChange={(e) => onChange('age_max', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 transition-all text-text"
          />
        </div>
      </div>

      {/* Fame */}
      <div>
        <label className="flex items-center gap-1.5 text-[0.65rem] sm:text-xs font-black text-text-muted uppercase tracking-widest mb-2 sm:mb-3">
          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Fame Rating
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="0"
            min={0}
            max={100}
            value={filters.fame_min}
            onChange={(e) => onChange('fame_min', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 transition-all text-text"
          />
          <span className="text-text-muted text-xs sm:text-sm">–</span>
          <input
            type="number"
            placeholder="100"
            min={0}
            max={100}
            value={filters.fame_max}
            onChange={(e) => onChange('fame_max', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 transition-all text-text"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="flex items-center gap-1.5 text-[0.65rem] sm:text-xs font-black text-text-muted uppercase tracking-widest mb-2 sm:mb-3">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Location
        </label>

        <div className="flex bg-background p-1 rounded-xl mb-2.5 gap-1 border border-border">
          {(['km', 'city'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange('location_mode', mode)}
              className={`flex-1 py-1.5 sm:py-2 text-[0.7rem] sm:text-xs font-bold rounded-lg transition-all active:scale-95 ${
                filters.location_mode === mode
                  ? 'bg-surface shadow text-primary border border-border'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {mode === 'km' ? 'Distance' : 'City'}
            </button>
          ))}
        </div>

        {filters.location_mode === 'km' ? (
          <div className="relative">
            <input
              type="number"
              placeholder="Max km away"
              min={1}
              value={filters.max_km}
              onChange={(e) => onChange('max_km', e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 transition-all text-text"
            />
            <MapPin
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>
        ) : (
          <input
            type="text"
            placeholder="e.g. Paris, Berlin"
            value={filters.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 transition-all text-text"
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="flex items-center gap-1.5 text-[0.65rem] sm:text-xs font-black text-text-muted uppercase tracking-widest mb-2 sm:mb-3">
          <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Interests
        </label>
        <input
          type="text"
          placeholder="vegan, hiking, art"
          value={filters.tags}
          onChange={(e) => onChange('tags', e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none focus:border-primary/50 transition-all text-text"
        />
        <p className="text-[0.65rem] sm:text-xs text-text-muted mt-1.5 sm:mt-2">Comma-separated. # optional.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 sm:pt-3">
        <button
          type="button"
          onClick={onClear}
          className="flex-1 py-2.5 sm:py-3 rounded-xl border border-border text-text-muted text-xs sm:text-sm font-bold hover:bg-background transition-colors active:scale-95"
        >
          Clear
        </button>
        <button
          type="submit"
          className="flex-[2] py-2.5 sm:py-3 rounded-xl bg-primary text-surface text-xs sm:text-sm font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Search
        </button>
      </div>
    </form>
  );
}
