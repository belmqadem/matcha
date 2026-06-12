import type {
  BrowseResponse,
  LikeResponse,
  UserProfile,
  Photo,
  Visitor,
  Liker,
} from '@/types/user';
import type { PublicProfile } from '@/types/user';
import { photoBuster } from '@/utils/photoBuster';
async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
  return body as T;
}

export const userService = {
  // ─── Browse / Search ──────────────────────────────────────────────────────

  searchUsers: (params: Record<string, string | number>): Promise<BrowseResponse> => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) q.set(k, String(v));
    });
    return fetch(`/api/search?${q}`, { credentials: 'include' })
      .then((res) => handleResponse<BrowseResponse>(res))
      .then((data) => ({
        ...data,
        users: data.users.map(photoBuster.bustBrowseUser),
      }));
  },

  browseUsers: (params: Record<string, string | number>): Promise<BrowseResponse> => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) q.set(k, String(v));
    });
    return fetch(`/api/browse?${q}`, { credentials: 'include' })
      .then((res) => handleResponse<BrowseResponse>(res))
      .then((data) => ({
        ...data,
        users: data.users.map(photoBuster.bustBrowseUser),
      }));
  },

  like: (id: string): Promise<LikeResponse> =>
    fetch(`/api/likes/${id}`, { method: 'POST', credentials: 'include' }).then((res) =>
      handleResponse<LikeResponse>(res),
    ),

  unlike: (id: string): Promise<void> =>
    fetch(`/api/likes/${id}`, { method: 'DELETE', credentials: 'include' }).then((res) =>
      handleResponse<void>(res),
    ),

  // ─── My Profile ───────────────────────────────────────────────────────────

  getMe: (): Promise<UserProfile> =>
    fetch('/api/users/me', { credentials: 'include' }).then(async (res) => {
      const body = await handleResponse<{ user: UserProfile }>(res);
      return photoBuster.bustUser(body.user);
    }),

  patchUser: (
    body: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'username' | 'email'>>,
  ): Promise<UserProfile> =>
    fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (res) => {
      const d = await handleResponse<{ user: UserProfile }>(res);
      return photoBuster.bustUser(d.user);
    }),

  patchProfile: (body: Partial<UserProfile>): Promise<UserProfile> =>
    fetch('/api/profile/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async (res) => {
      const d = await handleResponse<{ user: UserProfile }>(res);
      return photoBuster.bustUser(d.user);
    }),

  updateTags: (tags: string[]): Promise<string[]> =>
    fetch('/api/profile/me/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tags }),
    }).then(async (res) => {
      const d = await handleResponse<{ tags: string[] }>(res);
      return d.tags;
    }),

  uploadPhoto: (file: File): Promise<Photo> => {
    const fd = new FormData();
    fd.append('photo', file);
    return fetch('/api/profile/me/photos', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    }).then(async (res) => {
      const d = await handleResponse<{ photo: Photo }>(res);
      return d.photo;
    });
  },

  deletePhoto: (id: number): Promise<void> =>
    fetch(`/api/profile/me/photos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((res) => handleResponse<void>(res)),

  setMainPhoto: (id: number): Promise<void> =>
    fetch(`/api/profile/me/photos/${id}/set-main`, {
      method: 'PATCH',
      credentials: 'include',
    }).then((res) => handleResponse<void>(res)),

  rotatePhoto: (photoId: number, rotate: number): Promise<Photo> =>
    fetch(`/api/profile/me/photos/${photoId}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rotate }),
    }).then(async (res) => {
      const d = await handleResponse<{ photo: Photo }>(res);
      return d.photo;
    }),

  applyFilter: (photoId: number, filter: string, intensity: number): Promise<Photo> =>
    fetch(`/api/profile/me/photos/${photoId}/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ filter, intensity }),
    }).then(async (res) => {
      const d = await handleResponse<{ photo: Photo }>(res);
      return d.photo;
    }),

  getVisitors: (): Promise<Visitor[]> =>
    fetch('/api/profile/me/visitors', { credentials: 'include' }).then(async (res) => {
      const d = await handleResponse<{ visitors: Visitor[] }>(res);
      return d.visitors.map(photoBuster.bustVisitor);
    }),

  getLikedBy: (): Promise<Liker[]> =>
    fetch('/api/profile/me/liked-by', { credentials: 'include' }).then(async (res) => {
      const d = await handleResponse<{ likers: Liker[] }>(res);
      return d.likers.map(photoBuster.bustLiker);
    }),

  updateLocation: (body: {
    latitude: number;
    longitude: number;
    location_city?: string;
  }): Promise<void> =>
    fetch('/api/profile/me/location', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then((res) => handleResponse<void>(res)),

  getPublicProfile: (id: string): Promise<PublicProfile> =>
    fetch(`/api/users/${id}`, { credentials: 'include' }).then(async (res) => {
      const body = await handleResponse<Record<string, unknown>>(res);
      const userData = (body.user ??
        (body.profile as Record<string, unknown>)?.user ??
        body.profile ??
        (body.id ? body : null)) as PublicProfile | null;
      if (!userData) throw new Error('Could not find user data in the API response.');
      if (!userData.photos) userData.photos = [];
      if (!userData.tags) userData.tags = [];
      if (userData.birth_date && !userData.age) {
        userData.age = Math.floor(
          (Date.now() - new Date(userData.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000),
        );
      }
      return photoBuster.bustUser(userData);
    }),

  block: (id: string): Promise<void> =>
    fetch(`/api/blocks/${id}`, { method: 'POST', credentials: 'include' }).then((res) =>
      handleResponse<void>(res),
    ),

  unblock: (id: string): Promise<void> =>
    fetch(`/api/blocks/${id}`, { method: 'DELETE', credentials: 'include' }).then((res) =>
      handleResponse<void>(res),
    ),

  report: (id: string): Promise<void> =>
    fetch(`/api/reports/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'fake account' }),
      credentials: 'include',
    }).then((res) => handleResponse<void>(res)),
};
