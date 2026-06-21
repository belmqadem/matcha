export interface BrowseFilters {
  sort: 'distance' | 'fame' | 'tags' | 'age';
  order: 'asc' | 'desc';
  age_min?: number;
  age_max?: number;
  fame_min?: number;
  fame_max?: number;
  max_km?: number;
  tags?: string;
}

export const DEFAULT_BROWSE_FILTERS: BrowseFilters = {
  sort: 'distance',
  order: 'asc',
};
