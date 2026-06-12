// src/components/search/ActiveChips.tsx
import { X } from 'lucide-react';
import type { SearchFilters } from '@/types/search';

interface ActiveChipsProps {
  filters: SearchFilters;
  onRemove: (key: keyof SearchFilters | 'location') => void;
}

export function ActiveChips({ filters, onRemove }: ActiveChipsProps) {
  const chips: { label: string; key: keyof SearchFilters | 'location' }[] = [];

  if (filters.age_min || filters.age_max)
    chips.push({
      label: `Age: ${filters.age_min || '18'}–${filters.age_max || '99'}`,
      key: 'age_min',
    });
  if (filters.fame_min || filters.fame_max)
    chips.push({
      label: `Fame: ${filters.fame_min || '0'}–${filters.fame_max || '100'}`,
      key: 'fame_min',
    });
  if (filters.location_mode === 'km' && filters.max_km)
    chips.push({ label: `≤ ${filters.max_km} km`, key: 'location' });
  if (filters.location_mode === 'city' && filters.city)
    chips.push({ label: `In ${filters.city}`, key: 'location' });
  if (filters.tags) chips.push({ label: `#${filters.tags.replace(/,\s*/g, ' #')}`, key: 'tags' });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 animate-fade-in-up">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-[0.65rem] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key)}
            className="text-primary hover:opacity-70 transition-opacity p-0.5"
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
