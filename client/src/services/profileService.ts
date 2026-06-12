import type {
  ProfileFormData,
  ProfileResponse,
  TagsResponse,
  PhotoResponse,
} from '../types/profileSetup';
import type { Photo } from '../types/user';

const API_BASE = '/api';

export const updateProfile = async (
  data: Partial<{
    birth_date: string;
    gender: string;
    sexual_preference: string;
    biography: string;
    location_city: string;
    latitude: number;
    longitude: number;
  }>
): Promise<ProfileResponse> => {
  const res = await fetch(`${API_BASE}/profile/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  return json;
};

export const updateTags = async (tags: string[]): Promise<TagsResponse> => {
  const res = await fetch(`${API_BASE}/profile/me/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ tags }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  return json;
};

export const uploadPhoto = async (file: File): Promise<Photo> => {
  const formData = new FormData();
  formData.append('photo', file);

  const res = await fetch(`${API_BASE}/profile/me/photos`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  return json.photo;
};

export const reorderPhotos = async (order: number[]): Promise<Photo[]> => {
  const res = await fetch(`${API_BASE}/profile/me/photos/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ order }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  return json.photos;
};

export const setMainPhoto = async (photoId: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/profile/me/photos/${photoId}/set-main`, {
    method: 'PATCH',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
};

export const deletePhoto = async (photoId: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/profile/me/photos/${photoId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
};

export const editPhoto = async (
  photoId: number,
  data: { rotate?: number; crop?: { left: number; top: number; width: number; height: number } }
): Promise<Photo> => {
  const res = await fetch(`${API_BASE}/profile/me/photos/${photoId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  return json.photo;
};

export const filterPhoto = async (
  photoId: number,
  data: { filter: string; intensity?: number }
): Promise<Photo> => {
  const res = await fetch(`${API_BASE}/profile/me/photos/${photoId}/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  return json.photo;
};

export const saveCompleteProfile = async (form: ProfileFormData): Promise<void> => {
  const profileBody: Record<string, unknown> = {};
  if (form.birthdate) profileBody.birth_date = form.birthdate;
  if (form.gender) profileBody.gender = form.gender;
  if (form.sexual_preference) profileBody.sexual_preference = form.sexual_preference;
  if (form.biography?.trim()) profileBody.biography = form.biography;
  if (form.location_city) profileBody.location_city = form.location_city;
  if (form.latitude !== null) profileBody.latitude = form.latitude;
  if (form.longitude !== null) profileBody.longitude = form.longitude;

  if (Object.keys(profileBody).length > 0) {
    await updateProfile(profileBody);
  }
  if (form.tags.length > 0) {
    await updateTags(form.tags);
  }
  for (const file of form.photos) {
    await uploadPhoto(file);
  }
};
