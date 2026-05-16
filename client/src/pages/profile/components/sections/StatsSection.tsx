import { useState, useEffect } from 'react';
import { Eye, Heart, Loader2 } from 'lucide-react';
import { Section } from '../ui';
import { api } from "../../../../api/MyProfileApi";
import { timeAgo } from '../../utils';
import type { UserProfile, Visitor, Liker } from '../../types';

interface StatsSectionProps {
  user: UserProfile;
}

function UserRow({ item }: { item: Visitor | Liker }) {
  const time = 'visited_at' in item ? item.visited_at : item.liked_at;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-(--color-border) last:border-0 hover:bg-(--color-background)/50 -mx-5 px-5 transition-colors">
      <div className="w-9 h-9 rounded-full bg-(--color-background) overflow-hidden flex-shrink-0 border border-(--color-border)">
        {item.profile_picture_url ? (
          <img src={item.profile_picture_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--color-primary) text-xs font-bold">
            {item.first_name[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--color-text) truncate">
          {item.first_name} {item.last_name}
        </p>
        <p className="text-[10px] text-(--color-text-muted)">@{item.username}</p>
      </div>
      <span className="text-[10px] text-(--color-text-muted)/60 flex-shrink-0">
        {timeAgo(time)}
      </span>
    </div>
  );
}

export function StatsSection({ user }: StatsSectionProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [likers, setLikers]     = useState<Liker[]>([]);
  const [tab, setTab]           = useState<'visitors' | 'likers'>('visitors');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([api.getVisitors(), api.getLikedBy()])
      .then(([v, l]) => { setVisitors(v ?? []); setLikers(l ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const fame = Math.min(100, Math.max(0, user.fame_rating ?? 0));

  return (
    <Section label="Fame & Activity">
      <div className="p-5">
        {/* Fame rating */}
        <div className="mb-5 p-4 rounded-2xl bg-(--color-background) border border-(--color-border)">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-(--color-text-muted) uppercase mb-1.5">
                Fame rating
              </p>
              <p className="text-[10px] text-(--color-text-muted)/60">
                Public score visible on your profile
              </p>
            </div>
            <span className="text-3xl font-bold text-(--color-primary) tabular-nums">{fame}</span>
          </div>
          <div className="h-2 rounded-full bg-white border border-(--color-border) overflow-hidden">
            <div
              className="h-full rounded-full bg-(--color-primary) transition-all duration-700"
              style={{ width: `${fame}%` }}
            />
          </div>
          <p className="text-[10px] text-(--color-text-muted)/50 mt-2">
            Influenced by likes received, profile views, and account activity.
          </p>
        </div>

        {/* Visitors / Likers tabs */}
        <div className="flex border-b border-(--color-border) mb-3">
          {[
            { key: 'visitors' as const, label: 'Profile visitors', Icon: Eye,   count: visitors.length },
            { key: 'likers'   as const, label: 'Liked me',         Icon: Heart, count: likers.length   },
          ].map(({ key, label, Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-1 py-2.5 mr-5 text-xs font-semibold border-b-2 transition-all -mb-px
                ${tab === key
                  ? 'border-(--color-primary) text-(--color-primary)'
                  : 'border-transparent text-(--color-text-muted)/50 hover:text-(--color-text-muted)'
                }`}
            >
              <Icon size={11} /> {label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                ${tab === key
                  ? 'bg-(--color-primary) text-white'
                  : 'bg-(--color-background) text-(--color-text-muted)'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={16} className="animate-spin text-(--color-text-muted)/30" />
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto -mx-5 px-5">
            {tab === 'visitors' ? (
              visitors.length > 0
                ? visitors.map((v) => <UserRow key={v.id} item={v} />)
                : <p className="text-xs text-(--color-text-muted)/50 italic text-center py-8">No one has visited your profile yet.</p>
            ) : (
              likers.length > 0
                ? likers.map((l) => <UserRow key={l.id} item={l} />)
                : <p className="text-xs text-(--color-text-muted)/50 italic text-center py-8">No likes received yet.</p>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
