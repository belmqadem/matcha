import type { Visitor } from '@/types/user';

interface VisitorStatsProps {
  visitors: Visitor[];
}

export function VisitorStats({ visitors }: VisitorStatsProps) {
  const DAY_MS = 86_400_000;

  const today = visitors.filter(
    (v) => Date.now() - new Date(v.visited_at).getTime() < DAY_MS,
  ).length;

  const week = visitors.filter(
    (v) => Date.now() - new Date(v.visited_at).getTime() < 7 * DAY_MS,
  ).length;

  const stats = [
    { label: 'Total visitors', value: visitors.length },
    { label: 'Last 24h', value: today },
    { label: 'Last 7 days', value: week },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-7">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-white rounded-2xl border border-border px-5 py-4">
          <p className="text-[11px] text-text-muted font-medium tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-black text-primary leading-none">{value}</p>
        </div>
      ))}
    </div>
  );
}
