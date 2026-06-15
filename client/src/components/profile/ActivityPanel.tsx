// src/components/profile/ActivityPanel.tsx
import { useState, useEffect } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { userService } from '@/services/userService';
import type { Visitor } from '@/types/user';
import { timeAgo } from './profileConstants';

export function ActivityPanel() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getVisitors()
      .then((v) => {
        setVisitors(v ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full">
      {/* Title for the Profile Views section */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5 pb-2 border-b border-border/40">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-sm font-black text-text uppercase tracking-wider">Profile Views</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-primary text-surface">
          {visitors.length}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8 sm:py-10">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
        </div>
      ) : visitors.length > 0 ? (
        <div className="flex flex-col gap-2.5 sm:gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {visitors.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-background border border-transparent hover:border-border transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-surface text-primary flex items-center justify-center font-black text-base sm:text-lg">
                {item.profile_picture_url ? (
                  <img
                    src={item.profile_picture_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  item.first_name[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-bold text-text truncate">
                  {item.first_name} {item.last_name}
                </p>
                <p className="text-xs sm:text-sm font-medium text-text-muted truncate">
                  @{item.username}
                </p>
              </div>
              <span className="text-[0.65rem] sm:text-xs font-bold text-text-muted shrink-0">
                {timeAgo(item.visited_at)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 sm:py-10 text-center flex flex-col items-center gap-2 sm:gap-3">
          <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-border" />
          <p className="text-xs sm:text-sm font-bold text-text-muted">
            No profile views yet. Complete your profile to get noticed!
          </p>
        </div>
      )}
    </div>
  );
}
