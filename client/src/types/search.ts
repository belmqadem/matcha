export interface SearchFilters {
  age_min: string;
  age_max: string;
  fame_min: string;
  fame_max: string;
  location_mode: 'km' | 'city';
  max_km: string;
  city: string;
  tags: string;
}

export type SortKey = 'fame' | 'age' | 'distance' | 'tags';
export type OrderKey = 'asc' | 'desc';

export const DEFAULT_FILTERS: SearchFilters = {
  age_min: '',
  age_max: '',
  fame_min: '',
  fame_max: '',
  location_mode: 'km',
  max_km: '',
  city: '',
  tags: '',
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'fame', label: '🔥 Fame' },
  { value: 'age', label: '🎂 Age' },
  { value: 'distance', label: '📍 Distance' },
  { value: 'tags', label: '🏷 Common Tags' },
];
