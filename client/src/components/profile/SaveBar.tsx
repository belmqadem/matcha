// src/components/profile/SaveBar.tsx
import { AlertTriangle, Check, Loader2 } from 'lucide-react';

interface SaveBarProps {
  saving: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}

export function SaveBar({ saving, error, onSave, onCancel }: SaveBarProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t-2 border-background">
      {error && (
        <p className="flex-1 text-[12px] font-bold text-error flex items-center gap-1.5">
          <AlertTriangle size={14} /> {error}
        </p>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 text-[13px] font-bold rounded-xl border-2 border-border bg-white text-text-muted hover:bg-background hover:text-text transition-all"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold rounded-xl bg-primary text-white cursor-pointer hover:shadow-md transition-all disabled:opacity-60 active:scale-95"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
      </button>
    </div>
  );
}
