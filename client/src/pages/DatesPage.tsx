import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Bell, Loader2, CalendarHeart } from 'lucide-react';
import { useDates } from '@/hooks/useDates';
import { isPast } from '@/utils/dateUtils';
import DateTabs, { type TabFilter } from '@/components/dates/DateTabs';
import DateCard from '@/components/dates/DateCard';
import ProposeModal from '@/components/dates/ProposeModal';
import { useAuth } from '@/context/AuthContext';

export default function DatesPage() {
  const { dates, upcoming, loading, error, fetchDates } = useDates();
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<TabFilter>('upcoming');

  useEffect(() => {
    const queryTab = searchParams.get('tab') as TabFilter;
    if (queryTab && ['upcoming', 'pending', 'past', 'all'].includes(queryTab)) {
      Promise.resolve().then(() => setTab(queryTab));
    }
  }, [searchParams]);

  const { user: currentUser } = useAuth();

  const filtered = dates.filter((d) => {
    if (tab === 'upcoming')
      return !isPast(d.scheduled_at) && d.status !== 'declined' && d.status !== 'cancelled';
    if (tab === 'pending') return d.status === 'pending';
    if (tab === 'past')
      return isPast(d.scheduled_at) || d.status === 'declined' || d.status === 'cancelled';
    return true;
  });

  const inboundPending = dates.filter(
    (d) => d.status === 'pending' && currentUser && String(d.receiver_id) === String(currentUser.id),
  ).length;

  return (
    <div className="min-h-[100dvh] font-primary pb-16">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface/75 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarHeart className="w-4 h-4 text-primary" />
            <h1 className="text-base text-text tracking-tight">your dates</h1>
            {upcoming > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/12 text-primary text-[11px]">
                {upcoming} soon
              </span>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-surface text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/25"
          >
            <Plus className="w-3.5 h-3.5" />
            propose
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5">

        {/* Pending banner */}
        {inboundPending > 0 && (
          <button
            onClick={() => setTab('pending')}
            className="mt-5 w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/8 border border-primary/15 hover:bg-primary/12 transition-colors text-left"
          >
            <Bell className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-primary">
              {inboundPending} proposal{inboundPending > 1 ? 's' : ''} waiting for you 💌
            </span>
          </button>
        )}

        {/* Tabs */}
        <div className="mt-5">
          <DateTabs tab={tab} setTab={setTab} dates={dates} upcomingCount={upcoming} />
        </div>

        {/* List */}
        <div className="mt-4">
          {error && (
            <p className="text-sm text-error mb-3">{error}</p>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-surface border border-border animate-pulse"
                  style={{ opacity: 1 - i * 0.2 }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center animate-fade-in-up">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <span className="text-text-muted text-sm">—</span>
              </div>
              <p className="text-sm text-text-muted">
                {tab === 'upcoming' && 'nothing planned yet'}
                {tab === 'pending' && 'no pending proposals'}
                {tab === 'past' && 'no memories yet'}
                {tab === 'all' && 'nothing here yet'}
              </p>
              {(tab === 'upcoming' || tab === 'all') && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-surface text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/25"
                >
                  <Plus className="w-3.5 h-3.5" /> propose a date
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((d, i) => (
                <div
                  key={d.id}
                  className="animate-fade-in-up"
                  style={{ '--delay': `${i * 40}ms` } as React.CSSProperties}
                >
                  <DateCard date={d} onUpdate={fetchDates} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProposeModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchDates(); }}
        />
      )}
    </div>
  );
}
