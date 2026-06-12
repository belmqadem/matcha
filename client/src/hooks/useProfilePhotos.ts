import { useState } from 'react';
import { profileService } from '../services/profileService';
import type { UserProfile, Photo } from '../types/user';

export function useProfilePhotos(user: UserProfile, onUpdate: (u: UserProfile) => void) {
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState('');

  // Cache-busting state to force the browser to reload the image when edited
  const [photoVersions, setPhotoVersions] = useState<Record<number, number>>({});

  const photos = user.photos ?? [];
  const sorted = photos.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const bumpVersion = (id: number) =>
    setPhotoVersions(v => ({ ...v, [id]: Date.now() }));

  const photoSrc = (photo: Photo) =>
    photoVersions[photo.id] ? `${photo.url}?v=${photoVersions[photo.id]}` : photo.url;

  const run = async (action: () => Promise<void>, opts: { edit?: boolean } = {}) => {
    const set = opts.edit ? setEditLoading : setLoading;
    set(true);
    setError('');
    try { await action(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Action failed.'); }
    finally { set(false); }
  };

  const upload = (files: File[]) => run(async () => {
    if (photos.length + files.length > 5) throw new Error('Maximum 5 photos allowed.');
    let updated = { ...user };
    for (const file of files) {
      const p = await profileService.uploadPhoto(file);
      updated = { ...updated, photos: [...(updated.photos ?? []), p] };
      if (!updated.profile_picture_id) updated.profile_picture_id = p.id;
    }
    onUpdate(updated);
  });

  const remove = (id: number) => run(async () => {
    await profileService.deletePhoto(id);
    const remaining = photos.filter(p => p.id !== id);
    const newPicId = id === user.profile_picture_id
      ? (remaining[0]?.id ?? null)
      : user.profile_picture_id;
    onUpdate({ ...user, photos: remaining, profile_picture_id: newPicId });
  });

  const setMain = (id: number) => run(async () => {
    await profileService.setMainPhoto(id);
    onUpdate({ ...user, profile_picture_id: id });
  });

  const shiftOrder = (index: number, direction: -1 | 1) => run(async () => {
    if (index + direction < 0 || index + direction >= sorted.length) return;
    const newArr = [...sorted];
    [newArr[index], newArr[index + direction]] = [newArr[index + direction], newArr[index]];
    const updatedPhotos = await profileService.reorderPhotos(newArr.map(p => p.id));
    onUpdate({ ...user, photos: updatedPhotos });
  });

  const applyEdit = (id: number, data: { rotate?: number; crop?: { left: number; top: number; width: number; height: number } }) => run(async () => {
    const p = await profileService.editPhoto(id, data);
    onUpdate({ ...user, photos: photos.map(x => (x.id === id ? p : x)) });
    bumpVersion(id);
  }, { edit: true });

  const applyFilter = (id: number, filter: string, intensity: number) => run(async () => {
    const p = await profileService.filterPhoto(id, { filter, intensity });
    onUpdate({ ...user, photos: photos.map(x => (x.id === id ? p : x)) });
    bumpVersion(id);
  }, { edit: true });

  return {
    sorted, loading, editLoading, error, setError,
    photoSrc,
    upload, remove, setMain, shiftOrder, applyEdit, applyFilter,
  };
}
