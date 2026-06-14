// src/utils/map.ts
import L from 'leaflet';
import type { MapUser } from '@/types/map';

export function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

export function makeUserIcon(user: MapUser): L.DivIcon {
  const initials = getInitials(user.first_name, user.last_name);

  // Use Tailwind classes right inside the template literal; Tailwind v4 will scan and compile them!
  const inner = user.profile_picture_url
    ? `<img src="${user.profile_picture_url}" class="w-full h-full object-cover rounded-full" />`
    : `<span class="text-[13px] font-black text-primary">${initials}</span>`;

  const onlineDot = user.is_online
    ? `<div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-surface"></div>`
    : '';

  return L.divIcon({
    html: `<div class="w-10 h-10 rounded-full bg-primary/10 border-2 border-surface flex items-center justify-center shadow-md relative cursor-pointer overflow-hidden backdrop-blur-sm">
             ${inner}
             ${onlineDot}
           </div>`,
    className: '', // Disables Leaflet's default white styling
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

export function makeMeIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div class="w-[46px] h-[46px] rounded-full bg-primary border-4 border-surface flex items-center justify-center shadow-lg shadow-primary/40">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
             </svg>
           </div>`,
    className: '',
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}
