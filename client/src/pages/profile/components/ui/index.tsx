import { AlertTriangle, Check, Loader2 } from 'lucide-react';

export const inputCls =
  'w-full rounded-xl border border-(--color-border) bg-white px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted)/40 focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10 transition-all font-(--font-primary)';

export const labelCls =
  'block text-[10px] font-semibold tracking-widest text-(--color-text-muted) uppercase mb-1.5';

// ─── SaveBar ──────────────────────────────────────────────────────────────────

interface SaveBarProps {
  saving: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}

export function SaveBar({ saving, error, onSave, onCancel }: SaveBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-(--color-border)">
      {error ? (
        <p className="text-xs text-(--color-error) flex-1 flex items-center gap-1">
          <AlertTriangle size={11} /> {error}
        </p>
      ) : (
        <span className="flex-1" />
      )}
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-xs font-semibold rounded-xl border border-(--color-border) text-(--color-text-muted) hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-(--color-primary) text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
        Save changes
      </button>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
  id?: string;
  label: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ id, label, badge, children }: SectionProps) {
  return (
    <div id={id}>
      <div className="flex items-center gap-2 mb-3 px-1">
        <p className="text-[10px] font-bold tracking-widest text-(--color-text-muted) uppercase">
          {label}
        </p>
        {badge}
      </div>
      <div className="bg-white rounded-2xl border border-(--color-border) shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}
