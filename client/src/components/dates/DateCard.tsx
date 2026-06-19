import { useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Check, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import { dateService } from '@/services/dateService';
import Avatar from '@/components/ui/Avatar';
import { formatDate, formatTime, isPast } from '@/utils/dateUtils';
import type { DateEntry, DateStatus } from '@/types/date';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

const STATUS_META: Record<DateStatus, { label: string; chip: string }> = {
  pending: { label: 'Pending', chip: 'bg-primary/10 text-primary' },
  accepted: { label: 'Confirmed', chip: 'bg-primary/10 text-primary' },
  declined: { label: 'Declined', chip: 'bg-error/10 text-error' },
  cancelled: { label: 'Cancelled', chip: 'bg-border text-text-muted' },
};

interface DateCardProps {
  date: DateEntry;
  onUpdate: () => void;
}

export default function DateCard({ date, onUpdate }: DateCardProps) {
  const { openProfile } = useProfileDrawer();
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();

  const meta = STATUS_META[date.status];
  const past = isPast(date.scheduled_at);
  const faded = date.status === 'cancelled' || date.status === 'declined';
  const isReceiver = currentUser
    ? String(date.receiver_id) === String(currentUser.id)
    : date.my_role === 'receiver';

  const handleAction = async (action: 'accepted' | 'declined' | 'cancel') => {
    setLoading(true);
    try {
      if (action === 'cancel') {
        await dateService.cancelDate(date.id);
      } else {
        await dateService.respondToDate(date.id, action, date.scheduled_at);
        if (action === 'accepted') {
          const formattedDate = new Date(date.scheduled_at).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          const content = `I've accepted the date proposal: ${formattedDate}${date.location ? ` at ${date.location}` : ''}`;
          socket?.emit('chat:send', { to: date.other_user_id, content });
        }
      }
      onUpdate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-surface border border-border/60 rounded-2xl sm:rounded-3xl overflow-hidden transition-all ${
        faded ? 'opacity-40' : 'hover:border-border hover:shadow-sm'
      }`}
    >
      {/* Main content */}
      <div className="p-4 sm:p-5 flex gap-3 items-start">
        <div
          onClick={() => openProfile(date.other_user_id)}
          className="shrink-0 mt-0.5 cursor-pointer"
        >
          <Avatar
            photoUrl={date.other_profile_picture_url || undefined}
            first={date.other_first_name}
            last={date.other_last_name}
            size="md"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-text truncate">
              {date.other_first_name} {date.other_last_name}
              <span className="text-text-muted font-normal ml-1.5 text-xs">
                @{date.other_username}
              </span>
            </p>
            <span
              className={`shrink-0 text-[0.65rem] font-black px-2 py-0.5 rounded-full ${meta.chip}`}
            >
              {meta.label}
            </span>
          </div>

          {/* Date & location */}
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar className="w-3 h-3 text-primary shrink-0" />
              <span className="text-text">{formatDate(date.scheduled_at)}</span>
              <span>·</span>
              <span>{formatTime(date.scheduled_at)}</span>
              {past && date.status === 'accepted' && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-border text-text-muted">
                  past
                </span>
              )}
            </div>

            {date.location && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{date.location}</span>
              </div>
            )}
          </div>

          {/* Role hint */}
          <p className="mt-1.5 text-xs text-text-muted">
            {isReceiver ? 'They proposed' : 'You proposed'}
          </p>
        </div>
      </div>

      {/* Actions */}
      {date.status === 'pending' && (
        <div className="px-4 pb-3.5 flex gap-2 justify-end">
          {isReceiver ? (
            <>
              <button
                onClick={() => handleAction('accepted')}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-border text-text-muted text-xs font-bold disabled:opacity-40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> accept
              </button>
              <button
                onClick={() => handleAction('declined')}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-border text-text-muted text-xs font-bold disabled:opacity-40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:border-error hover:text-error hover:bg-error/5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> decline
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('cancel')}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-border text-text-muted text-xs font-bold disabled:opacity-40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:border-error hover:text-error hover:bg-error/5 cursor-pointer"
            >
              cancel proposal
            </button>
          )}
        </div>
      )}

      {date.status === 'accepted' && !past && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => handleAction('cancel')}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-border text-text-muted text-xs font-bold disabled:opacity-40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:border-error hover:text-error hover:bg-error/5 cursor-pointer"
          >
            cancel
          </button>
          <Link
            to={`/chat/${date.other_user_id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-premium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </Link>
        </div>
      )}
    </div>
  );
}
