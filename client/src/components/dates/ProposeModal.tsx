// src/components/dates/ProposeModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { dateService } from '@/services/dateService';
import { getMinDateTime } from '@/utils/dateUtils';
import type { Conversation } from '@/types/chat';

interface ProposeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProposeModal({ onClose, onSuccess }: ProposeModalProps) {
  const [connections, setConnections] = useState<Conversation[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [receiverId, setReceiverId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chatService.conversations()
      .then((data) => setConnections(data.conversations ?? []))
      .catch(() => setError('Could not load your connections.'))
      .finally(() => setLoadingConns(false));
  }, []);

  const handleSubmit = async () => {
    if (!receiverId || !scheduledAt) return setError('Please select a person and date/time.');
    if (new Date(scheduledAt) < new Date()) return setError('Scheduled time must be in the future.');

    setSubmitting(true);
    setError(null);
    try {
      await dateService.proposeDate({
        receiver_id: receiverId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        location: location.trim() || undefined,
      });
      onSuccess();
    } catch (e: any) {
      if (e.message?.includes('409')) setError('You already have a pending date with this person.');
      else if (e.message?.includes('403')) setError('You can only propose to connected users.');
      else setError(e.message ?? 'Failed to propose date');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-text/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-5">
      <div className="bg-surface rounded-3xl p-7 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-black text-text">Propose a date</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors p-1 -mr-1">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-error/10 text-error text-[13px] font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-bold text-text-muted mb-1.5">With</label>
            {loadingConns ? (
              <div className="h-10 bg-border animate-pulse rounded-xl" />
            ) : connections.length === 0 ? (
              <div className="p-3 rounded-xl bg-border/50 text-[13px] text-text-muted">
                No connections yet — match with someone first.
              </div>
            ) : (
              <select
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-surface text-[13px] text-text font-medium outline-none focus:border-primary"
              >
                <option value="">Select a match…</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} (@{c.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-bold text-text-muted mb-1.5">Date & time</label>
            <input
              type="datetime-local"
              min={getMinDateTime()}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-[13px] text-text font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-text-muted mb-1.5">
              Location <span className="font-normal opacity-70">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Café de Flore, Paris"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-[13px] text-text font-medium outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 p-2.5 rounded-xl border border-border text-text font-bold text-[13px] hover:bg-background transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || connections.length === 0}
            className="flex-1 p-2.5 rounded-xl bg-primary text-surface font-bold text-[13px] disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {submitting ? 'Sending…' : 'Send proposal'}
          </button>
        </div>
      </div>
    </div>
  );
}
