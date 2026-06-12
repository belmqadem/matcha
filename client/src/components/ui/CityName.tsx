// src/components/ui/CityName.tsx
import { useState, useEffect } from 'react';

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } },
    );
    const data = await res.json();
    return (
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.county ??
      null
    );
  } catch {
    return null;
  }
}

interface CityNameProps {
  lat: number;
  lng: number;
  fallback: string | null;
}

export function CityName({ lat, lng, fallback }: CityNameProps) {
  const [city, setCity] = useState<string | null>(fallback);

  useEffect(() => {
    if (!fallback && lat && lng) {
      reverseGeocode(lat, lng).then((c) => {
        if (c) setCity(c);
      });
    }
  }, [lat, lng, fallback]);

  return <span>{city ?? `${lat.toFixed(2)}, ${lng.toFixed(2)}`}</span>;
}
