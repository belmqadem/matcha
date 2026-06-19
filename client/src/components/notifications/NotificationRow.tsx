// src/components/notifications/NotificationRow.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import { X, Heart, Sparkles, Eye, MessageCircle, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { timeAgo } from '@/utils/notificationUtils';
import Avatar from '@/components/ui/Avatar';
import type { Notification, NotificationType } from '@/types/notification';

interface NotifMeta {
  icon: LucideIcon;
  fillIcon: boolean;
  label: (_n: Notification) => string;
  textCls: string;
  bgCls: string;
  borderCls: string;
}

const TYPE_META: Record<NotificationType, NotifMeta> = {
  like: {
    icon: Heart,
    fillIcon: true,
    label: (n) => `${n.from_first_name ?? 'Someone'} liked your profile`,
    textCls: 'text-primary',
    bgCls: 'bg-primary/10',
    borderCls: 'border-primary',
  },
  match: {
    icon: Sparkles,
    fillIcon: false,
    label: (n) => `You matched with ${n.from_first_name ?? 'someone'}!`,
    textCls: 'text-primary',
    bgCls: 'bg-primary/10',
    borderCls: 'border-primary',
  },
  unlike: {
    icon: Heart,
    fillIcon: false,
    label: (n) => `${n.from_first_name ?? 'Someone'} unliked you`,
    textCls: 'text-text-muted',
    bgCls: 'bg-border/50',
    borderCls: 'border-text-muted',
  },
  visit: {
    icon: Eye,
    fillIcon: false,
    label: (n) => `${n.from_first_name ?? 'Someone'} visited your profile`,
    textCls: 'text-text',
    bgCls: 'bg-text/5',
    borderCls: 'border-text',
  },
  message: {
    icon: MessageCircle,
    fillIcon: false,
    label: (n) =>
      n.count > 1
        ? `${n.from_first_name ?? 'Someone'} sent you ${n.count} messages`
        : `${n.from_first_name ?? 'Someone'} sent you a message`,
    textCls: 'text-primary',
    bgCls: 'bg-primary/10',
    borderCls: 'border-primary',
  },
  date_proposed: {
    icon: Calendar,
    fillIcon: false,
    label: (n) => `${n.from_first_name ?? 'Someone'} proposed a date`,
    textCls: 'text-text',
    bgCls: 'bg-text/5',
    borderCls: 'border-text',
  },
  date_accepted: {
    icon: Calendar,
    fillIcon: false,
    label: (n) => `${n.from_first_name ?? 'Someone'} accepted your date`,
    textCls: 'text-primary',
    bgCls: 'bg-primary/10',
    borderCls: 'border-primary',
  },
  date_declined: {
    icon: Calendar,
    fillIcon: false,
    label: (n) => `${n.from_first_name ?? 'Someone'} declined your date`,
    textCls: 'text-error',
    bgCls: 'bg-error/10',
    borderCls: 'border-error',
  },
  date_cancelled: {
    icon: Calendar,
    fillIcon: false,
    label: (n) => `${n.from_first_name ?? 'Someone'} cancelled the date`,
    textCls: 'text-text-muted',
    bgCls: 'bg-border/50',
    borderCls: 'border-text-muted',
  },
};

interface NotificationRowProps {
  notification: Notification;
  onRead: (_id: number) => void | Promise<void>;
  onDelete: (_id: number) => void;
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
    const { type, from_username } = notification;
    if (type === 'message' && from_username) {
      navigate(`/chat/${from_username}`);
    } else if (type.startsWith('date_')) {
      navigate('/dates');
    } else if (from_username && type !== 'unlike') {
      openProfile(from_username);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    setTimeout(() => onDelete(notification.id), 280);
  };

  const IconComponent = meta.icon;

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
            photoUrl={notification.from_profile_picture_url ?? undefined}
            first={notification.from_first_name ?? ''}
            last={notification.from_last_name ?? ''}
            size="md"
          />
        </div>
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center p-1 shadow-sm bg-surface border-2 ${meta.borderCls} ${meta.textCls}`}
        >
          <IconComponent
            className="w-full h-full"
            {...(meta.fillIcon ? { fill: 'currentColor' } : {})}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-xs sm:text-sm leading-snug truncate ${notification.is_read ? 'font-bold text-text' : 'font-black text-text'}`}
        >
          {meta.label(notification)}
        </p>
        <p className="text-[0.65rem] sm:text-xs mt-0.5 sm:mt-1 text-text-muted truncate font-medium">
          {notification.from_username ? `@${notification.from_username} • ` : ''}
          {timeAgo(notification.created_at)}
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
