// src/components/profile/ActivityPanel.tsx
import { useState, useEffect } from 'react';
import { Eye, Heart, Star, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';
import type { UserProfile, Visitor, Liker } from '@/types/user';
import { timeAgo } from './profileConstants';

interface Props {
  user: UserProfile;
}

export function ActivityPanel({ user }: Props) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [likers,   setLikers]   = useState<Liker[]>([]);
  const [tab,      setTab]       = useState<'visitors' | 'likers'>('visitors');
  const [loading,  setLoading]   = useState(true);

  const fame = Math.min(100, Math.max(0, user.fame_rating ?? 0));

  useEffect(() => {
    Promise.all([userService.getVisitors(), userService.getLikedBy()])
      .then(([v, l]) => { setVisitors(v ?? []); setLikers(l ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const list = tab === 'visitors' ? visitors : likers;

  return (
    <div className="bg-surface rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-black text-text">Fame & Activity</h3>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-primary/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-current" />
          <span className="text-sm sm:text-base font-black text-primary">{fame}</span>
        </div>
      </div>

      {/* Passing dynamic value as a CSS Variable to adhere to no-inline styling strictly */}
      <div className="h-2 sm:h-2.5 rounded-full bg-background overflow-hidden mb-6 sm:mb-8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-1000 ease-out w-[var(--fame-width)]"
          style={{ '--fame-width': `${fame}%` } as React.CSSProperties}
        />
      </div>

      <div className="flex border-b-2 border-background mb-4 sm:mb-5">
        {([
          { key: 'visitors' as const, label: 'Profile Views',  icon: Eye,   count: visitors.length },
          { key: 'likers'   as const, label: 'Likes Received', icon: Heart, count: likers.length   },
        ]).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 sm:gap-2 px-1 py-3 mr-4 sm:mr-6 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-all active:scale-95 ${
              tab === key
                ? 'text-primary border-primary'
                : 'text-text-muted border-transparent hover:text-text'
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[0.65rem] sm:text-[11px] font-black ${
              tab === key ? 'bg-primary text-surface' : 'bg-background text-text-muted'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8 sm:py-10">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
        </div>
      ) : list.length > 0 ? (
        <div className="flex flex-col gap-2.5 sm:gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {list.map(item => {
            const time = 'visited_at' in item ? item.visited_at : item.liked_at;
            return (
              <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-background border border-transparent hover:border-border transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-surface text-primary flex items-center justify-center font-black text-base sm:text-lg">
                  {item.profile_picture_url
                    ? <img src={item.profile_picture_url} alt="" className="w-full h-full object-cover" />
                    : item.first_name[0]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-text truncate">{item.first_name} {item.last_name}</p>
                  <p className="text-xs sm:text-sm font-medium text-text-muted truncate">@{item.username}</p>
                </div>
                <span className="text-[0.65rem] sm:text-xs font-bold text-text-muted shrink-0">{timeAgo(time)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 sm:py-10 text-center flex flex-col items-center gap-2 sm:gap-3">
          <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-border" />
          <p className="text-xs sm:text-sm font-bold text-text-muted">No activity yet. Upload a great photo to get noticed!</p>
        </div>
      )}
    </div>
  );
}
