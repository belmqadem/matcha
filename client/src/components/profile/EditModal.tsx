// src/components/profile/EditModal.tsx
import { X } from 'lucide-react';

interface EditModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function EditModal({ title, onClose, children }: EditModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[32px] p-7 w-full max-w-[480px] max-h-[85vh] overflow-y-auto shadow-2xl animate-[fadeUp_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-text">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
