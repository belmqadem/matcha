import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface Props {
  value: Date | null;
  onChange: (d: Date) => void;
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

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState<Date | null>(value);
  if (value?.getTime() !== prevValue?.getTime()) {
    setPrevValue(value);
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        <div className="absolute top-full left-0 mt-1.5 z-[200] bg-surface border border-border rounded-2xl p-4 w-[272px] shadow-lg">
          {/* Nav */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors shrink-0"
            >
              ‹
            </button>
            <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-transparent border-0 text-[13px] font-semibold text-text outline-none cursor-pointer pr-1"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m.substring(0, 3)}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-transparent border-0 text-[13px] font-semibold text-text outline-none cursor-pointer pr-1"
              >
                {Array.from({ length: 150 }, (_, i) => today.getFullYear() + 10 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-background transition-colors shrink-0"
            >
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-[11px] font-medium text-text-muted text-center py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
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
                  className={`h-9 w-full rounded-lg text-[13px] font-medium transition-colors
                    ${isSel ? 'bg-primary text-white' : ''}
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
        </div>
      )}
    </div>
  );
}
