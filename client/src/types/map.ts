// src/types/map.ts

export interface MapUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id: number | null;
  profile_picture_url: string | null;
  fame_rating: string;
  is_online: boolean;
  lat: number;
  lng: number;
  location_city: string;
  distance_km: number;
  tags: string[];
}

export interface MapResponse {
  users: MapUser[];
  total: number;
  radius_km: number;
  center: { lat: number; lng: number };
}

export type MapFilter = 'all' | 'online';

export type RadiusKm = 10 | 25 | 50 | 100;
