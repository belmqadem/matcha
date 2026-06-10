// src/components/map/MapSidebar.tsx
import { Star } from 'lucide-react';
import { getInitials, fmtDist } from '@/utils/map';
import type { MapUser, MapFilter } from '@/types/map';

interface MapSidebarProps {
  users: MapUser[];
  filter: MapFilter;
  radiusKm: number;
  loading: boolean;
  selectedUserId?: string;
  onUserSelect: (user: MapUser) => void;
}

export default function MapSidebar({
  users, filter, radiusKm, loading, selectedUserId, onUserSelect
}: MapSidebarProps) {
  return (
    <aside className="w-[280px] bg-surface border-l border-border flex flex-col overflow-hidden shrink-0 z-10 shadow-sm relative">
      <div className="px-4 py-3 border-b border-border text-[11px] font-bold text-text-muted">
        {users.length} {filter === 'online' ? 'online' : 'people'} within {radiusKm}km
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-thin flex flex-col">
        {users.length === 0 && !loading && (
          <div className="py-10 px-5 text-center text-text-muted text-[13px] font-medium">
            No {filter === 'online' ? 'online ' : ''}users nearby
          </div>
        )}

        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border transition-colors ${
              selectedUserId === user.id ? 'bg-primary/10' : 'bg-transparent hover:bg-surface-hover'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black bg-primary/10 text-primary border border-primary/20 overflow-hidden">
                {user.profile_picture_url && user.profile_picture_id && user.profile_picture_id > 0 ? (
                  <img
                    src={user.profile_picture_url}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user.first_name, user.last_name)
                )}
              </div>
              {user.is_online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-text truncate">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-[11px] font-medium text-text-muted mt-0.5 flex items-center gap-1.5 truncate">
                <span>{fmtDist(user.distance_km)}</span>
                <span>·</span>
                <span className="flex items-center"><Star size={10} className="text-primary mr-0.5" /> {parseFloat(user.fame_rating).toFixed(0)}</span>
                {user.location_city && (
                  <>
                    <span>·</span>
                    <span className="truncate">{user.location_city}</span>
                  </>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
