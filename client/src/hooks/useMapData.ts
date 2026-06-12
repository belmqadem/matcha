// src/hooks/useMapData.ts
import { useState, useCallback, useEffect } from 'react';
import { mapService } from '@/services/mapService';
import type { MapUser, RadiusKm } from '@/types/map';

interface UseMapDataReturn {
  users: MapUser[];
  center: { lat: number; lng: number } | null;
  radiusKm: RadiusKm;
  loading: boolean;
  gpsLoading: boolean;
  error: string | null;
  clearError: () => void;
  fetchMapData: (km?: RadiusKm) => Promise<void>;
  handleGps: () => void;
  handleRadiusChange: (km: RadiusKm) => void;
}

export function useMapData(initialRadius: RadiusKm = 50): UseMapDataReturn {
  const [users, setUsers] = useState<MapUser[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(initialRadius);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMapData = useCallback(
    async (km: RadiusKm = radiusKm) => {
      setLoading(true);
      setError(null);
      try {
        const data = await mapService.getBrowseMap(km);
        setUsers(data.users);
        setCenter(data.center ?? null);
        setRadiusKm(data.radius_km as RadiusKm);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load map');
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
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await mapService.updateGpsLocation(coords.latitude, coords.longitude);
          await fetchMapData(radiusKm);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to update location');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setError(err.message);
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

  const clearError = useCallback(() => setError(null), []);

  return {
    users,
    center,
    radiusKm,
    loading,
    gpsLoading,
    error,
    clearError,
    fetchMapData,
    handleGps,
    handleRadiusChange,
  };
}
