// src/components/notifications/NotificationRow.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import {
  X,
  Heart,
  Sparkles,
  HeartOff,
  Eye,
  MessageSquare,
  Calendar,
  Check,
  Ban,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { timeAgo } from '@/utils/notificationUtils';
import Avatar from '@/components/ui/Avatar';
import type { Notification, NotificationType } from '@/types/notification';

const TYPE_META: Record<
  NotificationType,
  {
    icon: LucideIcon;
    label: (n: string, count: number) => string;
    textCls: string;
    bgCls: string;
    borderCls: string;
  }
> = {
  like: {
    icon: Heart,
    label: (n) => `${n} liked your profile`,
    textCls: 'text-primary',
    bgCls: 'bg-primary/10',
    borderCls: 'border-primary',
  },
  match: {
    icon: Sparkles,
    label: (n) => `You matched with ${n}!`,
    textCls: 'text-primary',
    bgCls: 'bg-primary/10',
    borderCls: 'border-primary',
  },
  unlike: {
    icon: HeartOff,
    label: (n) => `${n} unliked you`,
    textCls: 'text-text-muted',
    bgCls: 'bg-border/50',
    borderCls: 'border-text-muted',
  },
  visit: {
    icon: Eye,
    label: (n) => `${n} visited your profile`,
    textCls: 'text-text',
    bgCls: 'bg-text/5',
    borderCls: 'border-text',
  },
  message: {
    icon: MessageSquare,
    label: (n, count) =>
      count > 1 ? `${n} sent you ${count} messages` : `${n} sent you a message`,
    textCls: 'text-primary',
    bgCls: 'bg-primary/10',
    borderCls: 'border-primary',
  },
  date_proposed: {
    icon: Calendar,
    label: (n) => `${n} proposed a date`,
    textCls: 'text-text',
    bgCls: 'bg-text/5',
    borderCls: 'border-text',
  },
  date_accepted: {
    icon: Check,
    label: (n) => `${n} accepted your date`,
    textCls: 'text-success',
    bgCls: 'bg-green-500/10',
    borderCls: 'border-green-500',
  },
  date_declined: {
    icon: X,
    label: (n) => `${n} declined your date`,
    textCls: 'text-error',
    bgCls: 'bg-error/10',
    borderCls: 'border-error',
  },
  date_cancelled: {
    icon: Ban,
    label: (n) => `${n} cancelled your date`,
    textCls: 'text-text-muted',
    bgCls: 'bg-border/50',
    borderCls: 'border-text-muted',
  },
};

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: number) => void | Promise<void>;
  onDelete: (id: number) => void;
}

export default function NotificationRow({ notification, onRead, onDelete }: NotificationRowProps) {
  const navigate = useNavigate();
  const { openProfile } = useProfileDrawer();
  const meta = TYPE_META[notification.type];
  const [deleting, setDeleting] = useState(false);

  const handleClick = async () => {
    if (!notification.is_read) {
      await onRead(notification.id);
    }
    if (notification.type === 'message') {
      navigate(`/chat/${notification.from_id}`);
    } else if (notification.type === 'date_proposed') {
      navigate('/dates?tab=pending');
    } else if (notification.type === 'date_accepted') {
      navigate('/dates?tab=upcoming');
    } else if (notification.type === 'date_cancelled' || notification.type === 'date_declined') {
      navigate('/dates?tab=past');
    } else if (notification.type !== 'unlike') {
      openProfile(notification.from_id);
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
      className={`group relative flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
        deleting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
      } ${notification.is_read ? 'bg-surface border border-border shadow-sm hover:border-primary/50' : `${meta.bgCls} border border-transparent shadow-md`}`}
    >
      {!notification.is_read && (
        <div
          className={`absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current ${meta.textCls}`}
        />
      )}

      <div className="relative shrink-0">
        <div
          className={`p-0.5 rounded-full border-2 ${notification.is_read ? 'border-transparent' : meta.borderCls}`}
        >
          <Avatar
            photoUrl={notification.from_profile_picture_url || undefined}
            first={notification.from_first_name}
            last={notification.from_last_name}
            size="md"
          />
        </div>
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center p-1 shadow-sm bg-surface ${meta.borderCls} border-2 ${meta.textCls}`}
        >
          <meta.icon className="w-full h-full" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-xs sm:text-sm leading-snug truncate ${notification.is_read ? 'font-bold text-text' : 'font-black text-text'}`}
        >
          {meta.label(notification.from_first_name, notification.count ?? 1)}
        </p>
        <p className="text-[0.65rem] sm:text-xs mt-0.5 sm:mt-1 text-text-muted truncate font-medium">
          @{notification.from_username} • {timeAgo(notification.created_at)}
        </p>
      </div>

      <button
        onClick={handleDelete}
        className="opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-text-muted hover:bg-background hover:text-error active:scale-95"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}
