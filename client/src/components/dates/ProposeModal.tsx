import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { dateService } from '@/services/dateService';
import type { Conversation } from '@/types/chat';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import { useSocket } from '@/context/SocketContext';

interface ProposeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex items-center">
    {children}
    <span className="pointer-events-none absolute right-2 text-text-muted text-xs">▾</span>
  </div>
);

const selectCls =
  'w-full appearance-none pr-6 p-2.5 rounded-xl border border-border bg-surface text-sm text-text font-medium outline-none focus:border-primary cursor-pointer';

export default function ProposeModal({ onClose, onSuccess }: ProposeModalProps) {
  const [connections, setConnections] = useState<Conversation[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [receiverId, setReceiverId] = useState('');
  const { socket } = useSocket();

  const [date, setDate] = useState<Date | null>(null);
  const [hour, setHour] = useState(() => new Date(Date.now() + 3_600_000).getHours());
  const [minute, setMinute] = useState(
    () => Math.floor(new Date(Date.now() + 3_600_000).getMinutes() / 5) * 5,
  );

  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    chatService
      .conversations()
      .then((data) => setConnections(data.conversations ?? []))
      .catch(() => toast.error('Could not load your connections.'))
      .finally(() => setLoadingConns(false));
  }, []);

  const handleSubmit = async () => {
    if (!receiverId) { toast.error('Please select a person.'); return; }
    if (!date) { toast.error('Please select a date.'); return; }
    const selectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute,
      0,
    );
    if (selectedDate <= new Date()) { toast.error('Scheduled time must be in the future.'); return; }

    setSubmitting(true);
    try {
      await dateService.proposeDate({
        receiver_id: receiverId,
        scheduled_at: selectedDate.toISOString(),
        location: location.trim() || undefined,
      });
      const formattedDate = new Date(selectedDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const content = `I've proposed a date: ${formattedDate}${location.trim() ? ` at ${location.trim()}` : ''}`;
      socket?.emit('chat:send', { to: receiverId, content });
      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('409')) toast.error('You already have a pending date with this person.');
      else if (msg.includes('403')) toast.error('You can only propose to connected users.');
      else toast.error(msg || 'Failed to propose date');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-text/40 backdrop-blur-sm z-[9999] flex items-start justify-center p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-3xl p-7 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-text">Propose a date</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors p-1 -mr-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* With */}
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">With</label>
            {loadingConns ? (
              <div className="h-10 bg-border animate-pulse rounded-xl" />
            ) : connections.length === 0 ? (
              <div className="p-3 rounded-xl bg-border/50 text-sm text-text-muted">
                No connections yet — match with someone first.
              </div>
            ) : (
              <SelectWrapper>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select a match…</option>
                  {connections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} (@{c.username})
                    </option>
                  ))}
                </select>
              </SelectWrapper>
            )}
          </div>

          {/* Date & time */}
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">
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

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">
              Location <span className="font-normal opacity-70">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Café de Flore, Paris"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-sm text-text font-medium outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 p-2.5 rounded-xl border border-border text-text font-bold text-sm hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || connections.length === 0}
            className="flex-1 p-2.5 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {submitting ? 'Sending…' : 'Send proposal'}
          </button>
        </div>
      </div>
    </div>
  );
}
