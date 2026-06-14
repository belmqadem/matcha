// src/components/chat/BlockedItem.tsx
import { useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { formatTime } from '@/utils/chat';
import type { BlockedUser } from '@/types/chat';

interface BlockedItemProps {
  user: BlockedUser;
  onUnblock: (id: string) => Promise<void>;
  onClick?: () => void;
}

function photoUrl(user: BlockedUser): string | undefined {
  return (
    user.profile_picture_url ??
    (user.profile_picture_id ? `/api/photos/${user.profile_picture_id}` : undefined)
  );
}

export default function BlockedItem({ user, onUnblock, onClick }: BlockedItemProps) {
  const [unblocking, setUnblocking] = useState(false);

  const handleUnblock = async () => {
    setUnblocking(true);
    await onUnblock(user.id);
    setUnblocking(false);
  };

  return (
    <div
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-2xl shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:bg-background/80 active:scale-[0.99]' : ''
      }`}
    >
      <Avatar photoUrl={photoUrl(user)} first={user.first_name} last={user.last_name} grayscale />

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-text truncate">
          {user.first_name} {user.last_name}
        </p>
        <p className="text-[12px] font-medium text-text-muted truncate flex items-center gap-1">
          <Ban size={10} /> Blocked {formatTime(user.blocked_at)}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUnblock();
        }}
        disabled={unblocking}
        className="shrink-0 px-4 py-1.5 rounded-full bg-background border-2 border-border text-[12px] font-bold text-text hover:border-primary hover:text-primary transition-all disabled:opacity-50 active:scale-95"
      >
        {unblocking ? <Loader2 size={14} className="animate-spin" /> : 'Unblock'}
      </button>
    </div>
  );
}
