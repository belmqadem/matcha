import { useState, useEffect } from 'react';
import { mapService } from '@/services/mapService';

interface CityNameProps {
  lat: number;
  lng: number;
  fallback: string | null;
}

export function CityName({ lat, lng, fallback }: CityNameProps) {
  const [city, setCity] = useState<string | null>(fallback);

  useEffect(() => {
    if (!fallback && lat && lng) {
      mapService.reverseGeocode(lat, lng).then((c) => {
        if (c) setCity(c);
      });
    }
  }, [lat, lng, fallback]);

  return <span>{city ?? `${lat.toFixed(2)}, ${lng.toFixed(2)}`}</span>;
}
