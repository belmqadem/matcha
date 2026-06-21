// src/hooks/useMapData.ts
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { mapService } from '@/services/mapService';
import type { MapUser, RadiusKm } from '@/types/map';

interface UseMapDataReturn {
  users: MapUser[];
  center: { lat: number; lng: number } | null;
  radiusKm: RadiusKm;
  loading: boolean;
  gpsLoading: boolean;
  fetchMapData: (_km?: RadiusKm) => Promise<void>;
  handleGps: () => void;
  handleRadiusChange: (_km: RadiusKm) => void;
}

export function useMapData(initialRadius: RadiusKm = 50): UseMapDataReturn {
  const [users, setUsers] = useState<MapUser[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(initialRadius);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);

  const fetchMapData = useCallback(
    async (km: RadiusKm = radiusKm) => {
      setLoading(true);
      try {
        const data = await mapService.getBrowseMap(km);
        setUsers(data.users);
        setCenter(data.center ?? null);
        setRadiusKm(data.radius_km as RadiusKm);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load map');
      } finally {
        setLoading(false);
      }
    },
    [radiusKm],
  );

  useEffect(() => {
    setTimeout(() => {
      fetchMapData();
    }, 0);
  }, [fetchMapData]);

  const handleGps = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const city = await mapService.reverseGeocode(coords.latitude, coords.longitude);
          await mapService.updateGpsLocation(coords.latitude, coords.longitude, city);
          await fetchMapData(radiusKm);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Failed to update location');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        toast.error(err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true },
    );
  }, [fetchMapData, radiusKm]);

  const handleRadiusChange = useCallback(
    (km: RadiusKm) => {
      setRadiusKm(km);
      fetchMapData(km);
    },
    [fetchMapData],
  );

  return {
    users,
    center,
    radiusKm,
    loading,
    gpsLoading,
    fetchMapData,
    handleGps,
    handleRadiusChange,
  };
}
