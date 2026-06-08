import type {
  ProfileFormData,
  ProfileResponse,
  TagsResponse,
  PhotoResponse,
} from '../types/profileSetup';

const API_BASE = '/api';

/**
 * Update profile fields (birthdate, gender, sexual_preference, biography, location, coordinates)
 */
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
  if (!res.ok) {
    throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  }
  return json;
};

/**
 * Update user tags
 */
export const updateTags = async (tags: string[]): Promise<TagsResponse> => {
  const res = await fetch(`${API_BASE}/profile/me/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ tags }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  }
  return json;
};

/**
 * Upload a single photo
 */
export const uploadPhoto = async (file: File): Promise<PhotoResponse> => {
  const formData = new FormData();
  formData.append('photo', file);

  const res = await fetch(`${API_BASE}/profile/me/photos`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? json.message ?? `Error (${res.status})`);
  }
  return json;
};

/**
 * Save all profile data at once (birthdate, gender, preference, bio, location, photos, tags)
 * Used when completing the setup or skipping
 */
export const saveCompleteProfile = async (
  form: ProfileFormData
): Promise<void> => {
  // Update basic profile fields
  const profileBody: Record<string, unknown> = {};
  if (form.birthdate) profileBody.birth_date = form.birthdate;
  if (form.gender) profileBody.gender = form.gender;
  if (form.sexual_preference)
    profileBody.sexual_preference = form.sexual_preference;
  if (form.biography?.trim()) profileBody.biography = form.biography;
  if (form.location_city) profileBody.location_city = form.location_city;
  if (form.latitude !== null) profileBody.latitude = form.latitude;
  if (form.longitude !== null) profileBody.longitude = form.longitude;

  if (Object.keys(profileBody).length > 0) {
    await updateProfile(profileBody);
  }

  // Update tags
  if (form.tags.length > 0) {
    await updateTags(form.tags);
  }

  // Upload photos
  for (const file of form.photos) {
    await uploadPhoto(file);
  }
};
