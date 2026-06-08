// // src/services/userService.ts
// import type { BrowseUser, BrowseResponse, LikeResponse } from '@/types/user';

// async function handleResponse<T>(res: Response): Promise<T> {
//   const text = await res.text();
//   const body = text ? JSON.parse(text) : {};
//   if (!res.ok) throw new Error(body.error ?? body.message ?? `Request failed (${res.status})`);
//   return body as T;
// }

// export const userService = {
//   searchUsers: (params: Record<string, string | number>): Promise<BrowseResponse> => {
//     const q = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => {
//       if (v !== "" && v !== null && v !== undefined) q.set(k, String(v));
//     });
//     return fetch(`/api/search?${q}`, { credentials: "include" }).then(res => handleResponse<BrowseResponse>(res));
//   },

//   browseUsers: (params: Record<string, string | number>): Promise<BrowseResponse> => {
//     const q = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => {
//       if (v !== "" && v !== null && v !== undefined) q.set(k, String(v));
//     });
//     return fetch(`/api/browse?${q}`, { credentials: "include" }).then(res => handleResponse<BrowseResponse>(res));
//   },

//   like: (id: number): Promise<LikeResponse> =>
//     fetch(`/api/likes/${id}`, { method: "POST", credentials: "include" }).then(res => handleResponse<LikeResponse>(res)),

//   unlike: (id: number): Promise<void> =>
//     fetch(`/api/likes/${id}`, { method: "DELETE", credentials: "include" }).then(res => handleResponse<void>(res)),
// };
// src/services/userService.ts
import type { BrowseUser, BrowseResponse, LikeResponse, UserProfile, Photo, Visitor, Liker } from '@/types/user';

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
    return fetch(`/api/search?${q}`, { credentials: 'include' }).then(res =>
      handleResponse<BrowseResponse>(res),
    );
  },

  browseUsers: (params: Record<string, string | number>): Promise<BrowseResponse> => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) q.set(k, String(v));
    });
    return fetch(`/api/browse?${q}`, { credentials: 'include' }).then(res =>
      handleResponse<BrowseResponse>(res),
    );
  },

  like: (id: number): Promise<LikeResponse> =>
    fetch(`/api/likes/${id}`, { method: 'POST', credentials: 'include' }).then(res =>
      handleResponse<LikeResponse>(res),
    ),

  unlike: (id: number): Promise<void> =>
    fetch(`/api/likes/${id}`, { method: 'DELETE', credentials: 'include' }).then(res =>
      handleResponse<void>(res),
    ),

  // ─── My Profile ───────────────────────────────────────────────────────────

  getMe: (): Promise<UserProfile> =>
    fetch('/api/users/me', { credentials: 'include' }).then(async res => {
      const body = await handleResponse<{ user: UserProfile }>(res);
      return body.user;
    }),

  patchUser: (body: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'username' | 'email'>>): Promise<UserProfile> =>
    fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async res => {
      const d = await handleResponse<{ user: UserProfile }>(res);
      return d.user;
    }),

  patchProfile: (body: Partial<UserProfile>): Promise<UserProfile> =>
    fetch('/api/profile/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(async res => {
      const d = await handleResponse<{ user: UserProfile }>(res);
      return d.user;
    }),

  updateTags: (tags: string[]): Promise<string[]> =>
    fetch('/api/profile/me/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tags }),
    }).then(async res => {
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
    }).then(async res => {
      const d = await handleResponse<{ photo: Photo }>(res);
      return d.photo;
    });
  },

  deletePhoto: (id: number): Promise<void> =>
    fetch(`/api/profile/me/photos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(res => handleResponse<void>(res)),

  setMainPhoto: (id: number): Promise<void> =>
    fetch(`/api/profile/me/photos/${id}/set-main`, {
      method: 'PATCH',
      credentials: 'include',
    }).then(res => handleResponse<void>(res)),

  getVisitors: (): Promise<Visitor[]> =>
    fetch('/api/profile/me/visitors', { credentials: 'include' }).then(async res => {
      const d = await handleResponse<{ visitors: Visitor[] }>(res);
      return d.visitors;
    }),

  getLikedBy: (): Promise<Liker[]> =>
    fetch('/api/profile/me/liked-by', { credentials: 'include' }).then(async res => {
      const d = await handleResponse<{ likers: Liker[] }>(res);
      return d.likers;
    }),

  updateLocation: (body: { latitude: number; longitude: number; location_city?: string }): Promise<void> =>
    fetch('/api/profile/me/location', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(res => handleResponse<void>(res)),
};
