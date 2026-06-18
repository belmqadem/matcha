// src/pages/MapPage.tsx
import { useState, useEffect } from 'react';
import { useMapData } from '@/hooks/useMapData';
import { useLeafletMap } from '@/hooks/useleafletMap';
import { useMapLikes } from '@/hooks/useMapLikes';
import MapHeader from '@/components/map/MapHeader';
import MapSidebar from '@/components/map/MapSidebar';
import MapPopup from '@/components/map/MapPopup';
import type { MapUser, RadiusKm } from '@/types/map';

export default function MapPage() {
  // Pure logic, managed completely by your separated custom hooks
  const { users, center, radiusKm, loading, gpsLoading, handleGps, handleRadiusChange } =
    useMapData();

  const { likeStates, handleLike, checkLikeStatus } = useMapLikes();

  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);

  useEffect(() => {
    if (selectedUser) {
      setTimeout(() => {
        checkLikeStatus(selectedUser.id);
      }, 0);
    }
  }, [selectedUser, checkLikeStatus]);

  const { containerRef, panTo } = useLeafletMap({
    users,
    center,
    radiusKm,
    onUserClick: setSelectedUser,
  });

  const handleUserSelect = (user: MapUser) => {
    setSelectedUser(user);
    panTo(user.lat, user.lng);
  };

  // Pure rendering layout - No inline styles anywhere
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <MapHeader
        userCount={users.length}
        loading={loading}
        radiusKm={radiusKm}
        gpsLoading={gpsLoading}
        onRadiusChange={(km) => handleRadiusChange(km as RadiusKm)}
        onGps={handleGps}
      />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        <div ref={containerRef} className="flex-1 min-h-0 z-0" />

        {loading && (
          <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-[13px] text-text-muted font-bold">Loading map…</span>
            </div>
          </div>
        )}

        <MapSidebar
          users={users}
          radiusKm={radiusKm}
          loading={loading}
          selectedUserId={selectedUser?.id}
          onUserSelect={handleUserSelect}
        />

        {selectedUser && (
          <MapPopup
            user={selectedUser}
            isLiked={likeStates[selectedUser.id] ?? false}
            onClose={() => setSelectedUser(null)}
            onLike={() => handleLike(selectedUser.id)}
          />
        )}
      </div>
    </div>
  );
}
