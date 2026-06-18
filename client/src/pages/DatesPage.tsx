import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Bell, CalendarHeart } from 'lucide-react';
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
    (d) =>
      d.status === 'pending' && currentUser && String(d.receiver_id) === String(currentUser.id),
  ).length;

  const DELAY_CLASSES = [
    '[animation-delay:0ms]',
    '[animation-delay:40ms]',
    '[animation-delay:80ms]',
    '[animation-delay:120ms]',
    '[animation-delay:160ms]',
    '[animation-delay:200ms]',
    '[animation-delay:240ms]',
    '[animation-delay:280ms]',
    '[animation-delay:320ms]',
    '[animation-delay:360ms]',
  ];

  return (
    <div className="flex flex-col flex-1 pb-10">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">

        {/* Page header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <CalendarHeart className="w-5 h-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                Your Dates
              </h1>
            </div>
            {upcoming > 0 ? (
              <p className="text-sm text-text-muted">
                {upcoming} date{upcoming > 1 ? 's' : ''} coming up soon
              </p>
            ) : (
              <p className="text-sm text-text-muted">Plan your next meetup</p>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/25"
          >
            <Plus className="w-3.5 h-3.5" />
            Propose
          </button>
        </div>

        {/* Inbound pending banner */}
        {inboundPending > 0 && (
          <button
            onClick={() => setTab('pending')}
            className="mb-5 w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary/8 border border-primary/20 hover:bg-primary/12 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">
                {inboundPending} proposal{inboundPending > 1 ? 's' : ''} waiting
              </p>
              <p className="text-xs text-primary/70">Tap to review</p>
            </div>
          </button>
        )}

        {/* Tabs */}
        <div className="mb-5">
          <DateTabs tab={tab} setTab={setTab} dates={dates} upcomingCount={upcoming} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-error/10 border border-error/20 text-sm font-medium text-error">
            {error}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-28 rounded-2xl sm:rounded-3xl bg-surface border border-border animate-pulse ${
                  i === 0 ? 'opacity-100' : i === 1 ? 'opacity-70' : 'opacity-40'
                }`}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center animate-fade-in-up">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-base font-black text-text mb-1">
              {tab === 'upcoming' && 'Nothing planned yet'}
              {tab === 'pending' && 'No pending proposals'}
              {tab === 'past' && 'No memories yet'}
              {tab === 'all' && 'Nothing here yet'}
            </p>
            <p className="text-sm text-text-muted max-w-xs">
              {tab === 'upcoming' && 'Propose a date to one of your matches.'}
              {tab === 'pending' && 'No proposals awaiting a response.'}
              {tab === 'past' && 'Your completed and past dates will appear here.'}
              {tab === 'all' && 'You have no dates yet.'}
            </p>
            {(tab === 'upcoming' || tab === 'all') && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-6 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/25"
              >
                <Plus className="w-3.5 h-3.5" /> Propose a date
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((d, i) => (
              <div key={d.id} className={`animate-fade-in-up ${DELAY_CLASSES[Math.min(i, DELAY_CLASSES.length - 1)]}`}>
                <DateCard date={d} onUpdate={fetchDates} />
              </div>
            ))}
          </div>
        )}
      </div>

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
