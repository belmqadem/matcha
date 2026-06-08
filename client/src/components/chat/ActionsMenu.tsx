// src/components/chat/ActionsMenu.tsx
import { useEffect, useRef } from 'react';
import { Ban, ShieldOff, UserMinus } from 'lucide-react';

interface ActionsMenuProps {
  firstName: string;
  iBlocked: boolean;
  onBlock: () => void;
  onUnblock: () => void;
  onUnmatch: () => void;
  onClose: () => void;
}

export default function ActionsMenu({
  firstName,
  iBlocked,
  onBlock,
  onUnblock,
  onUnmatch,
  onClose,
}: ActionsMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-52 bg-surface rounded-2xl shadow-xl border border-border z-50 py-2 overflow-hidden"
    >
      {iBlocked ? (
        <button
          onClick={() => { onUnblock(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-text hover:bg-background transition-colors text-left"
        >
          <ShieldOff size={16} className="text-text-muted" />
          Unblock {firstName}
        </button>
      ) : (
        <button
          onClick={() => { onBlock(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-error hover:bg-error/10 transition-colors text-left"
        >
          <Ban size={16} />
          Block {firstName}
        </button>
      )}

      <div className="mx-4 my-1 border-t border-border" />

      <button
        onClick={() => { onUnmatch(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-error hover:bg-error/10 transition-colors text-left"
      >
        <UserMinus size={16} />
        Unmatch {firstName}
      </button>
    </div>
  );
}
