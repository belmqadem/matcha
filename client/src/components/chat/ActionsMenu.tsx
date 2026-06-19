// src/components/chat/ActionsMenu.tsx
import { useEffect, useRef } from 'react';
import { Ban, ShieldOff, UserMinus } from 'lucide-react';

interface ActionsMenuProps {
  firstName: string;
  iBlocked: boolean;
  isConnected: boolean;
  onBlock: () => void;
  onUnblock: () => void;
  onUnmatch: () => void;
  onClose: () => void;
}

export default function ActionsMenu({
  firstName,
  iBlocked,
  isConnected,
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
      className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-surface rounded-2xl shadow-xl border border-border z-50 py-2 overflow-hidden animate-fade-in-up origin-top-right"
    >
      {iBlocked ? (
        <button
          onClick={() => {
            onUnblock();
            onClose();
          }}
          className="w-full flex items-center gap-2 sm:gap-3 px-4 py-3 text-xs sm:text-sm font-bold text-text hover:bg-background transition-colors text-left active:bg-border/50"
        >
          <ShieldOff className="w-4 h-4 sm:w-4 sm:h-4 text-text-muted" />
          Unblock {firstName}
        </button>
      ) : (
        <button
          onClick={() => {
            onBlock();
            onClose();
          }}
          className="w-full flex items-center gap-2 sm:gap-3 px-4 py-3 text-xs sm:text-sm font-bold text-error hover:bg-error/10 transition-colors text-left active:bg-error/20"
        >
          <Ban className="w-4 h-4 sm:w-4 sm:h-4" />
          Block {firstName}
        </button>
      )}

      {!iBlocked && isConnected && (
        <>
          <div className="mx-4 my-1 border-t border-border" />
          <button
            onClick={() => {
              onUnmatch();
              onClose();
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-4 py-3 text-xs sm:text-sm font-bold text-error hover:bg-error/10 transition-colors text-left active:bg-error/20"
          >
            <UserMinus className="w-4 h-4 sm:w-4 sm:h-4" />
            Unmatch {firstName}
          </button>
        </>
      )}
    </div>
  );
}
