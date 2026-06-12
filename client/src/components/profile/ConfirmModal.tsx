// src/components/profile/ConfirmModal.tsx
import { X } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl p-7 w-full max-w-[380px] shadow-2xl animate-[fadeUp_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-text">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-[14px] text-text-muted leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] font-bold rounded-xl border-2 border-border bg-white text-text-muted hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-[13px] font-bold rounded-xl text-white hover:opacity-90 transition-opacity ${danger ? 'bg-error' : 'bg-text'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
