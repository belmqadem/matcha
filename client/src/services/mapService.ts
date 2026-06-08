// src/services/mapService.ts

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const mapService = {
  getMapUsers: (maxKm: number) =>
    fetch(`/api/browse/map?max_km=${maxKm}`, { credentials: 'include' }).then((res) => handleResponse<any>(res)),

  updateLocationGps: (latitude: number, longitude: number) =>
    fetch('/api/profile/me/location/gps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ latitude, longitude }),
    }).then((res) => handleResponse<any>(res)),
};
