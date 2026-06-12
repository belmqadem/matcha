// src/services/mapService.ts
import type { MapResponse } from '@/types/map';

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const mapService = {
  getBrowseMap: (maxKm: number) =>
    fetch(`/api/browse/map?max_km=${maxKm}`, { credentials: 'include' }).then((res) =>
      handleResponse<MapResponse>(res),
    ),

  updateGpsLocation: (latitude: number, longitude: number) =>
    fetch('/api/profile/me/location/gps', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    }).then((res) =>
      handleResponse<{ latitude: number; longitude: number; location_city: string }>(res),
    ),

  likeUser: (id: string) =>
    fetch(`/api/likes/${id}`, { method: 'POST', credentials: 'include' }).then((res) =>
      handleResponse<{ liked: boolean; connected: boolean }>(res),
    ),

  unlikeUser: (id: string) =>
    fetch(`/api/likes/${id}`, { method: 'DELETE', credentials: 'include' }).then((res) =>
      handleResponse<{ liked: false; connected: false }>(res),
    ),
};
