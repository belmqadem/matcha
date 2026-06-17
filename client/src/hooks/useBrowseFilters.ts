import { useState } from 'react';
import { DEFAULT_BROWSE_FILTERS } from '@/types/browse';
import type { BrowseFilters } from '@/types/browse';

export function useBrowseFilters() {
  const [filters, setFilters] = useState<BrowseFilters>(DEFAULT_BROWSE_FILTERS);
  const [applied, setApplied] = useState<BrowseFilters>(DEFAULT_BROWSE_FILTERS);

  const apply = () => setApplied({ ...filters });

  const reset = () => {
    setFilters(DEFAULT_BROWSE_FILTERS);
    setApplied(DEFAULT_BROWSE_FILTERS);
  };

  const activeCount = (Object.keys(applied) as (keyof BrowseFilters)[]).filter(
    (k) => k !== 'sort' && k !== 'order' && applied[k] !== undefined,
  ).length;

  return { filters, setFilters, applied, apply, reset, activeCount };
}
