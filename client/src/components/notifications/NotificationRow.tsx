// src/components/notifications/NotificationRow.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { timeAgo } from '@/utils/notificationUtils';
import Avatar from '@/components/ui/Avatar';
import type { Notification, NotificationType } from '@/types/notification';

const TYPE_META: Record<NotificationType, { icon: string; label: (n: string) => string; textCls: string; bgCls: string; borderCls: string }> = {
  like: { icon: '❤️', label: (n) => `${n} liked your profile`, textCls: 'text-primary', bgCls: 'bg-primary/10', borderCls: 'border-primary' },
  match: { icon: '✨', label: (n) => `You matched with ${n}!`, textCls: 'text-primary', bgCls: 'bg-primary/10', borderCls: 'border-primary' },
  unlike: { icon: '💔', label: (n) => `${n} unliked you`, textCls: 'text-text-muted', bgCls: 'bg-text-muted/10', borderCls: 'border-text-muted' },
  visit: { icon: '👀', label: (n) => `${n} visited your profile`, textCls: 'text-text', bgCls: 'bg-text/5', borderCls: 'border-text' },
  message: { icon: '💬', label: (n) => `${n} sent you a message`, textCls: 'text-primary', bgCls: 'bg-primary/10', borderCls: 'border-primary' },
  date_proposed: { icon: '📅', label: (n) => `${n} proposed a date`, textCls: 'text-text', bgCls: 'bg-text/5', borderCls: 'border-text' },
  date_accepted: { icon: '✅', label: (n) => `${n} accepted your date`, textCls: 'text-success', bgCls: 'bg-success/10', borderCls: 'border-success' },
  date_declined: { icon: '❌', label: (n) => `${n} declined your date`, textCls: 'text-error', bgCls: 'bg-error/10', borderCls: 'border-error' },
  date_cancelled: { icon: '🚫', label: (n) => `${n} cancelled your date`, textCls: 'text-text-muted', bgCls: 'bg-text-muted/10', borderCls: 'border-text-muted' },
};

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: number) => Promise<void>; // Ensure this accepts a promise
  onDelete: (id: number) => void;
}

export default function NotificationRow({ notification, onRead, onDelete }: NotificationRowProps) {
  const navigate = useNavigate();
  const meta = TYPE_META[notification.type];
  const [deleting, setDeleting] = useState(false);

  // FIX 3: Make this async and await the read request to prevent fetch cancellation!
  const handleClick = async () => {
    if (!notification.is_read) {
      await onRead(notification.id);
    }

    if (notification.type === 'message') {
      navigate(`/chat/${notification.from_id}`);
    } else if (
      notification.type !== 'unlike' &&
      notification.type !== 'date_cancelled' &&
      notification.type !== 'date_declined'
    ) {
      navigate(`/profile/${notification.from_id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    setTimeout(() => onDelete(notification.id), 280);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${
        deleting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
      } ${notification.is_read ? 'bg-surface border border-border shadow-sm hover:border-primary/30' : `${meta.bgCls} border border-transparent shadow-md`}`}
    >
      {!notification.is_read && (
        <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current ${meta.textCls}`} />
      )}

      <div className="relative shrink-0">
        <div className={`p-0.5 rounded-full border-2 ${notification.is_read ? 'border-transparent' : meta.borderCls}`}>
          <Avatar
            photoUrl={notification.from_profile_picture_url || undefined}
            first={notification.from_first_name}
            last={notification.from_last_name}
            size="md"
          />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm bg-surface ${meta.borderCls} border-2`}>
          {meta.icon}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[14px] leading-snug truncate ${notification.is_read ? 'font-medium text-text' : 'font-black text-text'}`}>
          {meta.label(notification.from_first_name)}
        </p>
        <p className="text-[12px] mt-0.5 text-text-muted truncate">
          @{notification.from_username} · {timeAgo(notification.created_at)}
        </p>
      </div>

      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-text-muted hover:bg-background hover:text-error"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
