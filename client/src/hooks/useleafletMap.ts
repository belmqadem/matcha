// src/hooks/useLeafletMap.ts
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { makeUserIcon, makeMeIcon } from '@/utils/map';
import type { MapUser } from '@/types/map';

interface UseLeafletMapParams {
  users: MapUser[];
  center: { lat: number; lng: number } | null;
  radiusKm: number;
  onUserClick: (user: MapUser) => void;
}

export function useLeafletMap({ users, center, radiusKm, onUserClick }: UseLeafletMapParams) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const meMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [48.8566, 2.3522],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Update "me" marker + radius circle ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !center) return;
    const map = mapRef.current;

    if (meMarkerRef.current) {
      meMarkerRef.current.setLatLng([center.lat, center.lng]);
    } else {
      meMarkerRef.current = L.marker([center.lat, center.lng], {
        icon: makeMeIcon(),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip('You', { direction: 'top', offset: [0, -10] });
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([center.lat, center.lng]);
      radiusCircleRef.current.setRadius(radiusKm * 1000);
    } else {
      radiusCircleRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: '#e94057',
        fillColor: '#e94057',
        fillOpacity: 0.04,
        weight: 1,
        dashArray: '6 4',
      }).addTo(map);
    }

    map.setView([center.lat, center.lng], 12, { animate: true });
  }, [center, radiusKm]);

  // ── Sync user markers ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const existing = markersRef.current;

    // Remove markers for users no longer in the list
    existing.forEach((marker, id) => {
      if (!users.find((u) => u.id === id)) {
        marker.remove();
        existing.delete(id);
      }
    });

    // Add or update markers
    users.forEach((user) => {
      if (existing.has(user.id)) {
        existing.get(user.id)!.setIcon(makeUserIcon(user));
      } else {
        const marker = L.marker([user.lat, user.lng], { icon: makeUserIcon(user) })
          .addTo(map)
          .on('click', () => onUserClick(user));
        existing.set(user.id, marker);
      }
    });
  }, [users, onUserClick]);

  // ── Pan to user ─────────────────────────────────────────────────────────────
  const panTo = (lat: number, lng: number, zoom = 14) => {
    mapRef.current?.setView([lat, lng], zoom, { animate: true });
  };

  return { containerRef, panTo };
}
