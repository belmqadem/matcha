import type { BrowseUser } from '@/types/user';

export function getPhotoUrl(user: BrowseUser): string {
  if (user.photos && user.photos.length > 0) {
    const main = user.photos.find((p) => p.id === user.profile_picture_id);
    return (main ?? user.photos[0]).url;
  }
  return '';
}

export function getInitials(first: string, last: string): string {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}
