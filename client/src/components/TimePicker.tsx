import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  hour: number;
  minute: number;
  onChange: (h: number, m: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 5-min steps

function DrumColumn({
  items,
  selected,
  onSelect,
  label,
  format,
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  label: string;
  format: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector(`[data-sel="true"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [selected]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="text-[11px] font-medium text-text-muted text-center py-2 border-b border-border sticky top-0 bg-surface z-10">
        {label}
      </div>
      <div
        ref={ref}
        className="overflow-y-scroll flex-1 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
        {items.map((v) => (
          <div
            key={v}
            data-sel={v === selected ? 'true' : undefined}
            onClick={() => onSelect(v)}
            className={`h-11 flex items-center justify-center text-[15px] font-medium cursor-pointer transition-colors
              ${v === selected ? 'text-primary font-bold' : 'text-text-muted hover:text-text hover:bg-background'}`}
          >
            {format(v)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimePicker({ hour, minute, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pendingH, setPendingH] = useState(hour);
  const [pendingM, setPendingM] = useState(Math.floor(minute / 5) * 5);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openPicker = () => {
    setPendingH(hour);
    setPendingM(Math.floor(minute / 5) * 5);
    setOpen(true);
  };

  const confirm = () => {
    onChange(pendingH, pendingM);
    setOpen(false);
  };

  const pad = (v: number) => String(v).padStart(2, '0');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={open ? () => setOpen(false) : openPicker}
        className={`flex items-center gap-2 w-full px-3.5 h-[42px] rounded-xl border bg-surface text-[13px] font-medium transition-colors
          ${open ? 'border-primary' : 'border-border hover:border-border/80'}`}
      >
        <Clock size={15} className="text-text-muted shrink-0" />
        <span className="text-text tabular-nums">
          {pad(hour)}:{pad(minute)}
        </span>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-[200] bg-surface border border-border rounded-2xl overflow-hidden w-[180px]"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          <div className="flex h-52 border-b border-border divide-x divide-border">
            <DrumColumn
              items={HOURS}
              selected={pendingH}
              onSelect={setPendingH}
              label="Hour"
              format={pad}
            />
            <DrumColumn
              items={MINUTES}
              selected={pendingM}
              onSelect={setPendingM}
              label="Min"
              format={pad}
            />
          </div>
          <div className="flex justify-end p-3">
            <button
              type="button"
              onClick={confirm}
              className="px-4 py-1.5 rounded-lg bg-primary text-text text-[13px] font-bold hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
