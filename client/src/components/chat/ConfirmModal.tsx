// src/components/chat/ConfirmModal.tsx
import { Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel,
  danger = false,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text/40 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 sm:p-8 flex flex-col gap-4 sm:gap-5 bg-surface shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-black text-text">{title}</h2>
          <p className="text-xs sm:text-sm text-text-muted font-medium mt-1.5 sm:mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex gap-3 sm:gap-4 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold border-2 border-border text-text hover:border-text-muted transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black text-surface transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md ${
              danger ? 'bg-error hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
