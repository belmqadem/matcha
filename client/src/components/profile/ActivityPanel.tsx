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
    <div className="bg-white rounded-[32px] p-7 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-black text-text">Fame & Activity</h3>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
          <Star size={16} className="text-primary fill-current" />
          <span className="text-[15px] font-black text-primary">{fame}</span>
        </div>
      </div>

      <div className="h-2.5 rounded-full bg-background overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-pink-400 transition-all duration-1000 ease-out"
          style={{ width: `${fame}%` }}
        />
      </div>

      <div className="flex border-b-2 border-background mb-4">
        {([
          { key: 'visitors' as const, label: 'Profile Views',  icon: Eye,   count: visitors.length },
          { key: 'likers'   as const, label: 'Likes Received', icon: Heart, count: likers.length   },
        ]).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-1 py-3 mr-6 text-[14px] font-bold border-b-2 cursor-pointer transition-all ${
              tab === key
                ? 'text-primary border-primary'
                : 'text-text-muted border-transparent hover:text-text'
            }`}
          >
            <Icon size={16} /> {label}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              tab === key ? 'bg-primary text-white' : 'bg-background text-text-muted'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : list.length > 0 ? (
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          {list.map(item => {
            const time = 'visited_at' in item ? item.visited_at : item.liked_at;
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-background border border-transparent hover:border-border transition-colors">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-white text-primary flex items-center justify-center font-black text-lg">
                  {item.profile_picture_url
                    ? <img src={item.profile_picture_url} alt="" className="w-full h-full object-cover" />
                    : item.first_name[0]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-text truncate">{item.first_name} {item.last_name}</p>
                  <p className="text-[13px] font-medium text-text-muted">@{item.username}</p>
                </div>
                <span className="text-[12px] font-bold text-text-muted shrink-0">{timeAgo(time)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center flex flex-col items-center gap-2">
          <Eye size={32} className="text-border" />
          <p className="text-[14px] font-bold text-text-muted">No activity yet. Upload a great photo to get noticed!</p>
        </div>
      )}
    </div>
  );
}
