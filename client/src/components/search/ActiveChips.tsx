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
      label: `Age: ${filters.age_min || '18'}–${filters.age_max || '∞'}`,
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
    chips.push({ label: `📍 ${filters.city}`, key: 'location' });

  if (filters.tags)
    chips.push({ label: `#${filters.tags.replace(/,\s*/g, ' #')}`, key: 'tags' });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-3 py-1 rounded-full"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key)}
            className="text-primary hover:opacity-70 transition-opacity"
          >
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}
