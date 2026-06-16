import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

interface Props {
  value: Date | null;
  onChange: (_d: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const compareDateOnly = (d1: Date, d2: Date) => {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 - t2;
};

export default function DatePicker({ value, onChange, minDate, maxDate, className }: Props) {
  const today = new Date();
  const defaultYear = maxDate ? maxDate.getFullYear() : today.getFullYear();
  const defaultMonth = maxDate ? maxDate.getMonth() : today.getMonth();

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? defaultYear);
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? defaultMonth);
  const [showMonthPanel, setShowMonthPanel] = useState(false);
  const [showYearPanel, setShowYearPanel] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState<Date | null>(value);
  if (value?.getTime() !== prevValue?.getTime()) {
    setPrevValue(value);
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }

  const minYear = minDate ? minDate.getFullYear() : today.getFullYear() - 100;
  const maxYear = maxDate ? maxDate.getFullYear() : today.getFullYear();
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowMonthPanel(false);
      setShowYearPanel(false);
    }
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const label = value
    ? value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Select a date';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          className ||
          `flex items-center gap-2 w-full px-3.5 h-[42px] rounded-xl border bg-surface text-[13px] font-medium text-left transition-colors
          ${open ? 'border-primary' : 'border-border hover:border-border/80'}`
        }
      >
        <Calendar size={15} className="text-text-muted shrink-0" />
        <span className={value ? 'text-text' : 'text-text-muted'}>{label}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-[200] bg-surface border border-border rounded-2xl p-4 w-[272px] shadow-lg animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={prevMonth}
              disabled={showMonthPanel || showYearPanel}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <div className="flex items-center gap-1 min-w-0 flex-1 justify-center text-[13px] font-semibold text-text select-none">
              <button
                type="button"
                onClick={() => {
                  setShowMonthPanel(!showMonthPanel);
                  setShowYearPanel(false);
                }}
                className={`px-2 py-1 rounded-lg hover:bg-background transition-all cursor-pointer ${
                  showMonthPanel ? 'text-primary bg-primary/10' : ''
                }`}
              >
                {MONTH_NAMES[viewMonth]}
              </button>
              <span className="text-text-muted">/</span>
              <button
                type="button"
                onClick={() => {
                  setShowYearPanel(!showYearPanel);
                  setShowMonthPanel(false);
                }}
                className={`px-2 py-1 rounded-lg hover:bg-background transition-all cursor-pointer ${
                  showYearPanel ? 'text-primary bg-primary/10' : ''
                }`}
              >
                {viewYear}
              </button>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              disabled={showMonthPanel || showYearPanel}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>

          {/* Month Grid Panel */}
          {showMonthPanel && (
            <div className="grid grid-cols-3 gap-2 py-2 animate-fade-in">
              {MONTH_NAMES.map((m, idx) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setViewMonth(idx);
                    setShowMonthPanel(false);
                  }}
                  className={`py-2 text-[12px] font-semibold rounded-xl transition-all cursor-pointer active:scale-95
                    ${viewMonth === idx ? 'bg-primary text-text shadow-md shadow-primary/20' : 'text-text hover:bg-background'}
                  `}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Year Grid Panel */}
          {showYearPanel && (
            <div className="grid grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin py-2 animate-fade-in pr-1">
              {yearOptions.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setViewYear(y);
                    setShowYearPanel(false);
                  }}
                  className={`py-1.5 text-[12px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95
                    ${viewYear === y ? 'bg-primary text-text shadow-md shadow-primary/20' : 'text-text hover:bg-background'}
                  `}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Main Day Grid */}
          {!showMonthPanel && !showYearPanel && (
            <>
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-[11px] font-medium text-text-muted text-center py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-0.5 animate-fade-in">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const thisDate = new Date(viewYear, viewMonth, d);
                  const isMinDisabled = minDate ? compareDateOnly(thisDate, minDate) < 0 : false;
                  const isMaxDisabled = maxDate ? compareDateOnly(thisDate, maxDate) > 0 : false;
                  const isDisabled = isMinDisabled || isMaxDisabled;

                  const isToday = thisDate.toDateString() === today.toDateString();
                  const isSel = value && thisDate.toDateString() === value.toDateString();

                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        onChange(new Date(viewYear, viewMonth, d));
                        setOpen(false);
                      }}
                      className={`h-9 w-full rounded-lg text-[13px] font-medium transition-all active:scale-90
                        ${isSel ? 'bg-primary text-text shadow-sm shadow-primary/20' : ''}
                        ${!isSel && isToday ? 'text-primary' : ''}
                        ${!isSel && !isDisabled ? 'hover:bg-background' : ''}
                        ${isDisabled ? 'text-text-muted opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        ${!isSel && !isToday && !isDisabled ? 'text-text' : ''}
                      `}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
