import type { Photo, UserProfile, Visitor, Liker } from './types';

export const api = {
  getMe: () =>
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.user as UserProfile),

  patchUser: (body: object) =>
    fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.user as UserProfile;
    }),

  patchProfile: (body: object) =>
    fetch('/api/profile/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.user as UserProfile;
    }),

  updateTags: (tags: string[]) =>
    fetch('/api/profile/me/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tags }),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.tags as string[];
    }),

  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return fetch('/api/profile/me/photos', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.photo as Photo;
    });
  },

  deletePhoto: (id: number) =>
    fetch(`/api/profile/me/photos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
    }),

  setMainPhoto: (id: number) =>
    fetch(`/api/profile/me/photos/${id}/set-main`, {
      method: 'PATCH',
      credentials: 'include',
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d.user as UserProfile;
    }),

  getVisitors: () =>
    fetch('/api/profile/me/visitors', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.visitors as Visitor[]),

  getLikedBy: () =>
    fetch('/api/profile/me/liked-by', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => d.likers as Liker[]),

  updateLocation: (body: object) =>
    fetch('/api/profile/me/location', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `Error (${r.status})`);
      return d;
    }),

  logout: () =>
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).then(async (r) => {
      if (!r.ok) throw new Error('Logout failed');
    }),
};
