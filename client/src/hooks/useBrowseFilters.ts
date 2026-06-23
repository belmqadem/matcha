import { useState } from 'react';
import { DEFAULT_BROWSE_FILTERS } from '@/types/browse';
import type { BrowseFilters } from '@/types/browse';

export const BROWSE_FILTERS_KEY = 'matcha:browse-filters';

function loadSaved(): BrowseFilters {
  try {
    const raw = localStorage.getItem(BROWSE_FILTERS_KEY);
    if (!raw) return DEFAULT_BROWSE_FILTERS;
    return { ...DEFAULT_BROWSE_FILTERS, ...(JSON.parse(raw) as Partial<BrowseFilters>) };
  } catch {
    return DEFAULT_BROWSE_FILTERS;
  }
}

export function useBrowseFilters() {
  const [filters, setFilters] = useState<BrowseFilters>(loadSaved);
  const [applied, setApplied] = useState<BrowseFilters>(loadSaved);

  const apply = () => {
    setApplied({ ...filters });
    try {
      localStorage.setItem(BROWSE_FILTERS_KEY, JSON.stringify(filters));
    } catch {
      /* storage unavailable */
    }
  };

  const reset = () => {
    setFilters(DEFAULT_BROWSE_FILTERS);
    setApplied(DEFAULT_BROWSE_FILTERS);
    try {
      localStorage.removeItem(BROWSE_FILTERS_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const activeCount = (Object.keys(applied) as (keyof BrowseFilters)[]).filter(
    (k) => k !== 'sort' && k !== 'order' && applied[k] !== undefined,
  ).length;

  return { filters, setFilters, applied, apply, reset, activeCount };
}
