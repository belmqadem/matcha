import { useState } from 'react';
import { Calendar, MapPin, Check, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileDrawer } from '@/hooks/useProfileDrawer';
import { dateService } from '@/services/dateService';
import Avatar from '@/components/ui/Avatar';
import { formatDate, formatTime, isPast } from '@/utils/dateUtils';
import type { DateEntry, DateStatus } from '@/types/date';
import { useAuth } from '@/context/AuthContext';

const STATUS_META: Record<DateStatus, { label: string; color: string }> = {
  pending:   { label: 'pending',    color: 'text-primary' },
  accepted:  { label: 'confirmed', color: 'text-primary' },
  declined:  { label: 'declined',  color: 'text-error'   },
  cancelled: { label: 'cancelled', color: 'text-text-muted' },
};

interface DateCardProps {
  date: DateEntry;
  onUpdate: () => void;
}

export default function DateCard({ date, onUpdate }: DateCardProps) {
  const { openProfile } = useProfileDrawer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const meta = STATUS_META[date.status];
  const past = isPast(date.scheduled_at);
  const faded = date.status === 'cancelled' || date.status === 'declined';
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
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-surface border border-border/60 rounded-2xl overflow-hidden transition-all ${
        faded ? 'opacity-40' : 'hover:border-border hover:shadow-sm'
      }`}
    >
      {/* Main content */}
      <div className="p-4 flex gap-3 items-start">
        <div onClick={() => openProfile(date.other_user_id)} className="flex-shrink-0 mt-0.5 cursor-pointer">
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
            <p className="text-sm text-text truncate">
              {date.other_first_name} {date.other_last_name}
              <span className="text-text-muted ml-1.5 text-xs">@{date.other_username}</span>
            </p>
            <span className={`text-[11px] flex-shrink-0 ${meta.color}`}>{meta.label}</span>
          </div>

          {/* Date & location */}
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-text">{formatDate(date.scheduled_at)}</span>
              <span>·</span>
              <span>{formatTime(date.scheduled_at)}</span>
              {past && date.status === 'accepted' && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-border text-text-muted">past</span>
              )}
            </div>

            {date.location && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="truncate">{date.location}</span>
              </div>
            )}
          </div>

          {/* Role hint */}
          <p className="mt-1.5 text-[10px] text-text-muted">
            {isReceiver ? 'they proposed' : 'you proposed'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="px-4 pb-3 -mt-1 text-xs text-error">{error}</p>
      )}

      {/* Actions */}
      {date.status === 'pending' && (
        <div className="px-4 pb-3 flex gap-2 justify-end">
          {isReceiver ? (
            <>
              <button
                onClick={() => handleAction('accepted')}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-text-muted text-xs disabled:opacity-40 hover:bg-background active:scale-95 transition-all"
              >
                <Check className="w-3 h-3" /> accept
              </button>
              <button
                onClick={() => handleAction('declined')}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-text-muted text-xs disabled:opacity-40 hover:bg-background active:scale-95 transition-all"
              >
                <X className="w-3 h-3" /> decline
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('cancel')}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs disabled:opacity-40 hover:bg-background active:scale-95 transition-all"
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
            className="px-4 py-2 rounded-xl border border-border text-text-muted text-xs disabled:opacity-40 hover:bg-background active:scale-95 transition-all"
          >
            cancel
          </button>
          <Link
            to={`/chat/${date.other_user_id}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-primary text-surface text-xs hover:opacity-90 active:scale-95 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" /> chat
          </Link>
        </div>
      )}
    </div>
  );
}
