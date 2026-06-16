import { useState } from 'react';
import { X, CalendarHeart, Loader2 } from 'lucide-react';
import type { DateProposal } from '@/types/chat';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';

interface ProposeModalProps {
  receiverName: string;
  onClose: () => void;
  onPropose: (_data: Omit<DateProposal, 'receiver_id'>) => Promise<void>;
}

export default function ProposeModal({ receiverName, onClose, onPropose }: ProposeModalProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [hour, setHour] = useState(() => new Date(Date.now() + 3_600_000).getHours());
  const [minute, setMinute] = useState(
    () => Math.floor(new Date(Date.now() + 3_600_000).getMinutes() / 5) * 5,
  );

  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!date) {
      setError('Please select a date.');
      return;
    }
    const selectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute,
      0,
    );
    if (selectedDate <= new Date()) {
      setError('Scheduled time must be in the future.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onPropose({
        scheduled_at: selectedDate.toISOString(),
        location: location.trim() || undefined,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to propose date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/45 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7 flex flex-col gap-5 bg-surface shadow-2xl shadow-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <CalendarHeart className="w-8 h-8 text-primary mb-2 animate-pulse" />
            <h2 className="text-xl font-black text-text">Ask {receiverName} out</h2>
            <p className="text-[13px] text-text-muted font-medium mt-0.5">
              Propose a time and place
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-background text-text-muted hover:bg-border transition-colors shrink-0 mt-1"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <p className="text-xs px-4 py-2.5 rounded-2xl bg-error/10 text-error font-bold border border-error/20">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-bold text-text-muted mb-1.5">
              Date &amp; time
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <DatePicker value={date} onChange={setDate} minDate={new Date()} />
              </div>
              <div style={{ width: 130 }}>
                <TimePicker
                  hour={hour}
                  minute={minute}
                  onChange={(h, m) => {
                    setHour(h);
                    setMinute(m);
                  }}
                />
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-text-muted">
              Location <span className="font-medium normal-case tracking-normal">(optional)</span>
            </span>
            <input
              placeholder="Coffee at Café Kitsune…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-2xl text-[14px] font-bold border-2 border-border text-text bg-background focus:border-primary focus:bg-surface transition-all outline-none placeholder-border"
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl text-[15px] font-black text-surface bg-primary hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CalendarHeart size={18} />}
          {loading ? 'Proposing…' : 'Send Proposal'}
        </button>
      </div>
    </div>
  );
}
