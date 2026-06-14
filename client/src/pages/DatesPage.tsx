import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Mail, Loader2, CalendarHeart } from 'lucide-react';
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
      Promise.resolve().then(() => {
        setTab(queryTab);
      });
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

  return (
    <div className="min-h-[100dvh] bg-background font-primary pb-10">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <CalendarHeart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-black text-text">Dates</h1>
          {upcoming > 0 && (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider">
              {upcoming} upcoming
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary text-surface text-xs sm:text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4 sm:w-4 sm:h-4" />{' '}
          <span className="hidden sm:inline">Propose a date</span>
          <span className="inline sm:hidden">Propose</span>
        </button>
      </header>

      {/* Inbound pending banner */}
      {inboundPending > 0 && (
        <div
          onClick={() => setTab('pending')}
          className="mx-4 sm:mx-6 mt-4 p-3 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2.5 sm:gap-3 cursor-pointer hover:bg-primary/15 transition-colors animate-fade-in-up"
        >
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
          <span className="text-xs sm:text-sm text-primary font-bold">
            You have {inboundPending} proposal{inboundPending > 1 ? 's' : ''} waiting for a response
          </span>
        </div>
      )}

      {/* Tabs */}
      <DateTabs tab={tab} setTab={setTab} dates={dates} upcomingCount={upcoming} />

      {/* Content Area */}
      <main className="p-4 sm:p-6 w-full max-w-3xl mx-auto">
        {error && (
          <div className="p-3 sm:p-4 rounded-xl bg-error/10 text-error border border-error/20 text-xs sm:text-sm font-bold mb-4 animate-fade-in-up">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16 sm:py-20">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-4 sm:px-5 bg-surface border border-border rounded-3xl shadow-sm animate-fade-in-up">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 opacity-40 grayscale">
              {tab === 'upcoming' ? '📅' : tab === 'pending' ? '⏳' : '🕰️'}
            </div>
            <p className="text-text-muted text-sm sm:text-base font-bold">
              {tab === 'upcoming' && 'No upcoming dates — propose one!'}
              {tab === 'pending' && 'No pending proposals'}
              {tab === 'past' && 'No past dates yet'}
              {tab === 'all' && 'No dates yet — propose one!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
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
