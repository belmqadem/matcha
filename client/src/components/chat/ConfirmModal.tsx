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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/45 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-3xl p-6 flex flex-col gap-4 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-[18px] font-black text-text">{title}</h2>
          <p className="text-[13px] text-text-muted font-medium mt-1 leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl text-[14px] font-bold border-2 border-border text-text hover:border-text-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-2xl text-[14px] font-black text-surface transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              danger ? 'bg-error hover:opacity-90' : 'bg-primary hover:opacity-90'
            }`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
