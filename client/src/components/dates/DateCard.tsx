import { useState } from 'react';
import { Calendar, MapPin, Check, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dateService } from '@/services/dateService';
import Avatar from '@/components/ui/Avatar';
import { formatDate, formatTime, isPast } from '@/utils/dateUtils';
import type { DateEntry, DateStatus } from '@/types/date';
import { useAuth } from '@/context/AuthContext';

const STATUS_META: Record<DateStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-primary/20', text: 'text-primary' },
  accepted: { label: 'Accepted', bg: 'bg-success/20', text: 'text-success' },
  declined: { label: 'Declined', bg: 'bg-error/20', text: 'text-error' },
  cancelled: { label: 'Cancelled', bg: 'bg-border', text: 'text-text-muted' },
};

interface DateCardProps {
  date: DateEntry;
  onUpdate: () => void;
}

export default function DateCard({ date, onUpdate }: DateCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const meta = STATUS_META[date.status];
  const past = isPast(date.scheduled_at);
  const isReceiver = currentUser
    ? String(date.receiver_id) === String(currentUser.id)
    : date.my_role === 'receiver';

  const handleAction = async (action: 'accepted' | 'declined' | 'cancel') => {
    setLoading(true);
    setError(null);
    try {
      if (action === 'cancel') {
        await dateService.cancelDate(date.id);
      } else {
        await dateService.respondToDate(date.id, action, date.scheduled_at);
      }
      onUpdate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm transition-all ${
        date.status === 'cancelled' || date.status === 'declined'
          ? 'opacity-60 grayscale'
          : 'opacity-100'
      }`}
    >
      <div className="flex gap-3 sm:gap-4 items-start">
        <Link to={`/profile/${date.other_user_id}`}>
          <Avatar
            photoUrl={date.other_profile_picture_url || undefined}
            first={date.other_first_name}
            last={date.other_last_name}
            size="md"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="text-sm sm:text-base font-black text-text">
                {date.other_first_name} {date.other_last_name}
              </span>
              <span className="text-[0.65rem] sm:text-xs text-text-muted ml-1.5 font-medium">
                @{date.other_username}
              </span>
            </div>
            <span
              className={`text-[0.65rem] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-black uppercase tracking-wider shrink-0 ${meta.bg} ${meta.text}`}
            >
              {meta.label}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
            <span className="text-text font-bold">{formatDate(date.scheduled_at)}</span>
            <span className="text-text-muted font-medium">at {formatTime(date.scheduled_at)}</span>
            {past && date.status === 'accepted' && (
              <span className="text-[0.6rem] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-border text-text-muted font-bold ml-1 uppercase">
                Past
              </span>
            )}
          </div>

          {date.location && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-text-muted">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="text-text">{date.location}</span>
            </div>
          )}

          <div className="mt-2 sm:mt-2.5">
            <span className="text-[0.65rem] sm:text-xs font-bold text-text-muted uppercase tracking-widest">
              {isReceiver ? 'They proposed this' : 'You proposed this'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-error/10 text-error text-xs sm:text-sm font-bold animate-fade-in-up">
          {error}
        </div>
      )}

      {/* Actions */}
      {date.status === 'pending' && (
        <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
          {isReceiver ? (
            <>
              <button
                onClick={() => handleAction('accepted')}
                disabled={loading}
                className="bg-primary flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl bg-success text-surface text-xs sm:text-sm font-black disabled:opacity-50 active:scale-95 transition-all shadow-sm shadow-success/20"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" /> Accept
              </button>
              <button
                onClick={() => handleAction('declined')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl border-2 border-error/50 text-error text-xs sm:text-sm font-black disabled:opacity-50 hover:bg-error/10 active:scale-95 transition-all"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" /> Decline
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('cancel')}
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 border-border text-text-muted text-xs sm:text-sm font-black disabled:opacity-50 hover:bg-background active:scale-95 transition-all"
            >
              Cancel proposal
            </button>
          )}
        </div>
      )}

      {date.status === 'accepted' && !past && (
        <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
          {/* Removed the my_role check here so either user can cancel an upcoming date */}
          <button
            onClick={() => handleAction('cancel')}
            disabled={loading}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 border-border text-text-muted text-xs sm:text-sm font-black disabled:opacity-50 hover:bg-background active:scale-95 transition-all"
          >
            Cancel date
          </button>

          <Link
            to={`/chat/${date.other_user_id}`}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-surface text-xs sm:text-sm font-black hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/20"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Chat
          </Link>
        </div>
      )}
    </div>
  );
}
