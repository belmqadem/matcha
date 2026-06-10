// src/pages/DatesPage.tsx
import { useState } from 'react';
import { Plus, Mail, Loader2, CalendarHeart } from 'lucide-react';
import { useDates } from '@/hooks/useDates';
import { isPast } from '@/utils/dateUtils';
import DateTabs, { type TabFilter } from '@/components/dates/DateTabs';
import DateCard from '@/components/dates/DateCard';
import ProposeModal from '@/components/dates/ProposeModal';

export default function DatesPage() {
  const { dates, upcoming, loading, error, fetchDates } = useDates();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<TabFilter>('upcoming');

  const filtered = dates.filter((d) => {
    if (tab === 'upcoming') return d.status === 'accepted' && !isPast(d.scheduled_at);
    if (tab === 'pending') return d.status === 'pending';
    if (tab === 'past') return isPast(d.scheduled_at) || d.status === 'declined' || d.status === 'cancelled';
    return true;
  });

  const inboundPending = dates.filter((d) => d.status === 'pending' && d.my_role === 'receiver').length;

  return (
    <div className="min-h-screen bg-background font-primary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <CalendarHeart size={24} className="text-primary" />
          <h1 className="text-[20px] font-black text-text">Dates</h1>
          {upcoming > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-bold">
              {upcoming} upcoming
            </span>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-surface text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
        >
          <Plus size={16} /> Propose a date
        </button>
      </header>

      {/* Inbound pending banner */}
      {inboundPending > 0 && (
        <div
          onClick={() => setTab('pending')}
          className="mx-6 mt-4 p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2.5 cursor-pointer hover:bg-primary/15 transition-colors"
        >
          <Mail size={18} className="text-primary" />
          <span className="text-[13px] text-primary font-bold">
            You have {inboundPending} proposal{inboundPending > 1 ? 's' : ''} waiting for a response
          </span>
          <span className="ml-auto text-primary text-[16px]">→</span>
        </div>
      )}

      {/* Tabs */}
      <DateTabs tab={tab} setTab={setTab} dates={dates} upcomingCount={upcoming} />

      {/* Content Area */}
      <main className="p-6 max-w-2xl mx-auto">
        {error && (
          <div className="p-3 rounded-xl bg-error/10 text-error text-[13px] font-medium mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-5">
            <div className="text-[48px] mb-3 opacity-80">
              {tab === 'upcoming' ? '📆' : tab === 'pending' ? '💌' : '🗓️'}
            </div>
            <p className="text-text-muted text-[14px] font-medium">
              {tab === 'upcoming' && 'No upcoming dates — propose one!'}
              {tab === 'pending' && 'No pending proposals'}
              {tab === 'past' && 'No past dates yet'}
              {tab === 'all' && 'No dates yet — propose one!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((d) => (
              <DateCard key={d.id} date={d} onUpdate={fetchDates} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <ProposeModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchDates();
          }}
        />
      )}
    </div>
  );
}
