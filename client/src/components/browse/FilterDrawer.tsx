import { useState } from 'react';
import { X } from 'lucide-react';
import type { BrowseFilters } from '@/types/browse';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: BrowseFilters;
  onChange: (_filters: BrowseFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

interface FilterErrors {
  age?: string;
  fame?: string;
  tags?: string;
}

const SORT_OPTIONS: { value: BrowseFilters['sort']; label: string }[] = [
  { value: 'distance', label: 'Distance' },
  { value: 'fame', label: 'Fame' },
  { value: 'tags', label: 'Tags' },
  { value: 'age', label: 'Age' },
];

const labelCls = 'block text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mb-2';

function inputCls(hasError: boolean) {
  return `w-full bg-background border-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-text placeholder-text-muted outline-none transition-all ${
    hasError ? 'border-error focus:border-error' : 'border-transparent focus:border-primary'
  }`;
}

function validate(f: BrowseFilters): FilterErrors {
  const errs: FilterErrors = {};

  const ageMin = f.age_min != null ? Number(f.age_min) : null;
  const ageMax = f.age_max != null ? Number(f.age_max) : null;

  if (ageMin != null && ageMin < 18) {
    errs.age = 'Minimum age is 18';
  } else if (ageMax != null && ageMax > 99) {
    errs.age = 'Maximum age is 99';
  } else if (ageMin != null && ageMax != null && ageMin > ageMax) {
    errs.age = 'Min age must be less than max';
  }

  const fameMin = f.fame_min != null ? Number(f.fame_min) : 0;
  const fameMax = f.fame_max != null ? Number(f.fame_max) : 100;
  if (fameMin > fameMax) {
    errs.fame = 'Min fame must be less than max';
  }

  if (f.tags) {
    const cleaned = f.tags.replace(/#/g, '').replace(/\s+/g, '');
    if (!/^[a-zA-Z0-9,]*$/.test(cleaned)) {
      errs.tags = 'Tags can only contain letters, numbers and commas';
    }
  }

  return errs;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
}: FilterDrawerProps) {
  const [errors, setErrors] = useState<FilterErrors>({});

  const set = <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) => {
    const next = { ...filters, [key]: value };
    onChange(next);
    setErrors(validate(next));
  };

  const handleApply = () => {
    const errs = validate(filters);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onApply();
    onClose();
  };

  const handleReset = () => {
    setErrors({});
    onReset();
    onClose();
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full z-50 w-full sm:w-85 bg-surface border-l border-border flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-black text-text">Filters</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-text-muted hover:text-primary transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-border/50 hover:text-text transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          {/* Sort by */}
          <div>
            <span className={labelCls}>Sort by</span>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set('sort', opt.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    filters.sort === opt.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-border text-text-muted hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order */}
          <div>
            <span className={labelCls}>Order</span>
            <div className="flex gap-2">
              {(['asc', 'desc'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => set('order', o)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    filters.order === o
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-border text-text-muted hover:border-primary/50'
                  }`}
                >
                  {o === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              ))}
            </div>
          </div>

          {/* Max distance */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={labelCls} style={{ marginBottom: 0 }}>
                Max distance
              </span>
              <span className="text-xs font-bold text-primary">
                {filters.max_km != null ? `${filters.max_km} km` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={500}
              step={1}
              value={filters.max_km ?? 500}
              onChange={(e) => set('max_km', Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-medium mt-1">
              <span>1 km</span>
              <span>500 km</span>
            </div>
          </div>

          {/* Age range */}
          <div>
            <span className={labelCls}>Age range</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={18}
                max={99}
                placeholder="Min"
                value={filters.age_min ?? ''}
                onChange={(e) =>
                  set('age_min', e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputCls(!!errors.age)}
              />
              <span className="text-text-muted font-bold shrink-0">–</span>
              <input
                type="number"
                min={18}
                max={99}
                placeholder="Max"
                value={filters.age_max ?? ''}
                onChange={(e) =>
                  set('age_max', e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputCls(!!errors.age)}
              />
            </div>
            {errors.age && <p className="mt-1.5 text-xs text-error font-medium">{errors.age}</p>}
          </div>

          {/* Fame range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={labelCls} style={{ marginBottom: 0 }}>
                Fame range
              </span>
              <span className={`text-xs font-bold ${errors.fame ? 'text-error' : 'text-primary'}`}>
                {filters.fame_min ?? 0} – {filters.fame_max ?? 100}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={filters.fame_min ?? 0}
                onChange={(e) => set('fame_min', Number(e.target.value))}
                className={`w-full ${errors.fame ? 'accent-error' : 'accent-primary'}`}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={filters.fame_max ?? 100}
                onChange={(e) => set('fame_max', Number(e.target.value))}
                className={`w-full ${errors.fame ? 'accent-error' : 'accent-primary'}`}
              />
            </div>
            {errors.fame && <p className="mt-1.5 text-xs text-error font-medium">{errors.fame}</p>}
          </div>

          {/* Tags */}
          <div>
            <span className={labelCls}>Tags</span>
            <input
              type="text"
              placeholder="#vegan, #geek"
              value={filters.tags ?? ''}
              onChange={(e) => set('tags', e.target.value || undefined)}
              className={inputCls(!!errors.tags)}
            />
            {errors.tags && <p className="mt-1.5 text-xs text-error font-medium">{errors.tags}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-border">
          <button
            onClick={handleApply}
            disabled={hasErrors}
            className="w-full py-3.5 rounded-full bg-primary text-white text-sm font-black shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  );
}
