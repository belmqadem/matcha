// src/components/profile/EditModal.tsx
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface EditModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function EditModal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-sm sm:max-w-md md:max-w-lg',
}: EditModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-text/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-surface rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 w-full ${maxWidth} max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in-up scrollbar-thin`}
      >
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-text">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// src/components/profile/ConfirmModal.tsx
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-text/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface rounded-3xl p-6 sm:p-8 w-full max-w-[90%] sm:max-w-sm shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-text">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-text-muted leading-relaxed mb-6 sm:mb-8">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border-2 border-border bg-surface text-text-muted hover:bg-background transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-surface hover:opacity-90 transition-opacity active:scale-95 ${danger ? 'bg-error' : 'bg-text'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
