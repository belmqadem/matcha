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
    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 sm:pt-5 mt-4 sm:mt-5 border-t-2 border-background">
      {error && (
        <p className="w-full sm:flex-1 text-xs sm:text-sm font-bold text-error flex items-center justify-center sm:justify-start gap-1.5 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4" /> {error}
        </p>
      )}
      <div className="flex w-full sm:w-auto gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl border-2 border-border bg-surface text-text-muted hover:bg-background hover:text-text transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl bg-primary text-surface cursor-pointer hover:bg-primary-hover hover:shadow-md transition-all disabled:opacity-60 active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
        </button>
      </div>
    </div>
  );
}
