import type { Photo, BrowseUser, Visitor, Liker } from '@/types/user';

let currentBuster = Date.now().toString();

export const photoBuster = {
  get: () => currentBuster,

  regenerate: () => {
    currentBuster = Date.now().toString();
  },

  bustUrl: (url: string | null | undefined): string => {
    if (!url) return '';
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?t=${currentBuster}`;
  },

  bustPhoto: (photo: Photo): Photo => {
    if (!photo || !photo.url) return photo;
    return {
      ...photo,
      url: photoBuster.bustUrl(photo.url),
    };
  },

  bustPhotos: (photos: Photo[] | null | undefined): Photo[] => {
    if (!photos) return [];
    return photos.map(photoBuster.bustPhoto);
  },

  bustUser: <T extends { photos?: Photo[] }>(user: T): T => {
    if (!user) return user;
    const updated = { ...user };
    if (updated.photos) {
      updated.photos = photoBuster.bustPhotos(updated.photos);
    }
    return updated;
  },

  bustBrowseUser: (user: BrowseUser): BrowseUser => {
    if (!user) return user;
    const updated = { ...user };
    if (updated.photos) {
      updated.photos = photoBuster.bustPhotos(updated.photos);
    }
    return updated;
  },

  bustVisitor: (v: Visitor): Visitor => {
    if (!v) return v;
    const updated = { ...v };
    if (updated.profile_picture_url) {
      updated.profile_picture_url = photoBuster.bustUrl(updated.profile_picture_url);
    }
    return updated;
  },

  bustLiker: (l: Liker): Liker => {
    if (!l) return l;
    const updated = { ...l };
    if (updated.profile_picture_url) {
      updated.profile_picture_url = photoBuster.bustUrl(updated.profile_picture_url);
    }
    return updated;
  },
};
