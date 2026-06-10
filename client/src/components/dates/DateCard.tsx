// src/components/dates/DateCard.tsx
import { useState } from 'react';
import { Calendar, MapPin, Check, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dateService } from '@/services/dateService';
import Avatar from '@/components/ui/Avatar';
import { formatDate, formatTime, isPast } from '@/utils/dateUtils';
import type { DateEntry, DateStatus } from '@/types/date';

const STATUS_META: Record<DateStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-warning/20', text: 'text-warning' },
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

  const meta = STATUS_META[date.status];
  const past = isPast(date.scheduled_at);

  const handleAction = async (action: 'accepted' | 'declined' | 'cancel') => {
    setLoading(true);
    setError(null);
    try {
      if (action === 'cancel') {
        await dateService.cancelDate(date.id);
      } else {
        await dateService.respondToDate(date.id, action);
      }
      onUpdate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-surface border border-border rounded-2xl p-4 transition-all ${
      date.status === 'cancelled' || date.status === 'declined' ? 'opacity-60' : 'opacity-100'
    }`}>
      <div className="flex gap-3 items-start">
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
              <span className="text-[14px] font-bold text-text">
                {date.other_first_name} {date.other_last_name}
              </span>
              <span className="text-[12px] text-text-muted ml-1.5">
                @{date.other_username}
              </span>
            </div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${meta.bg} ${meta.text}`}>
              {meta.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-[13px]">
            <Calendar size={13} className="text-text-muted shrink-0" />
            <span className="text-text font-medium">{formatDate(date.scheduled_at)}</span>
            <span className="text-text-muted">at {formatTime(date.scheduled_at)}</span>
            {past && date.status === 'accepted' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-border text-text-muted font-bold ml-1">Past</span>
            )}
          </div>

          {date.location && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[13px]">
              <MapPin size={13} className="text-text-muted shrink-0" />
              <span className="text-text">{date.location}</span>
            </div>
          )}

          <div className="mt-1.5">
            <span className="text-[11px] text-text-muted">
              {date.my_role === 'proposer' ? 'You proposed this' : 'They proposed this'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2.5 p-2 rounded-lg bg-error/10 text-error text-[12px] font-medium">
          {error}
        </div>
      )}

      {/* Actions */}
      {date.status === 'pending' && (
        <div className="flex gap-2 mt-3.5">
          {date.my_role === 'receiver' ? (
            <>
              <button
                onClick={() => handleAction('accepted')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-success text-surface text-[12px] font-bold disabled:opacity-50"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => handleAction('declined')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-error/50 text-error text-[12px] font-bold disabled:opacity-50 hover:bg-error/10"
              >
                <X size={14} /> Decline
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('cancel')}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-border text-text-muted text-[12px] font-bold disabled:opacity-50 hover:bg-background"
            >
              Cancel proposal
            </button>
          )}
        </div>
      )}

      {date.status === 'accepted' && !past && (
        <div className="flex gap-2 mt-3.5">
          {date.my_role === 'proposer' && (
            <button
              onClick={() => handleAction('cancel')}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-border text-text-muted text-[12px] font-bold disabled:opacity-50 hover:bg-background"
            >
              Cancel date
            </button>
          )}
          <Link
            to={`/chat/${date.other_user_id}`}
            className="px-4 py-2 flex items-center gap-1.5 rounded-xl bg-primary text-surface text-[12px] font-bold hover:opacity-90"
          >
            <MessageCircle size={14} /> Chat
          </Link>
        </div>
      )}
    </div>
  );
}
