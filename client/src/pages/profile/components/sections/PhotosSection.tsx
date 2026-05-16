import { useRef, useState } from 'react';
import { Camera, X, Star, Loader2, AlertTriangle } from 'lucide-react';
import { Section } from '../ui';
import { api } from "../../../../api/MyProfileApi";
import type { UserProfile } from '../../types';

interface PhotosSectionProps {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}

export function PhotosSection({ user, onUpdate }: PhotosSectionProps) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const photos = user.photos ?? [];

  const hasProfilePic =
    photos.some((p) => p.id === user.profile_picture_id) || photos.length > 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    if (photos.length + files.length > 5) {
      setError('Maximum 5 photos allowed. Delete one first.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      let updated = { ...user };
      for (const file of files) {
        const p = await api.uploadPhoto(file);
        updated = { ...updated, photos: [...updated.photos, p] };
        if (!updated.profile_picture_id) updated.profile_picture_id = p.id;
      }
      onUpdate(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deletePhoto(id);
      const remaining = photos.filter((p) => p.id !== id);
      const newPicId =
        id === user.profile_picture_id
          ? (remaining[0]?.id ?? null)
          : user.profile_picture_id;
      onUpdate({ ...user, photos: remaining, profile_picture_id: newPicId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const handleSetMain = async (id: number) => {
    try {
      const u = await api.setMainPhoto(id);
      onUpdate(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set as profile picture.');
    }
  };

  const sorted     = photos.slice().sort((a, b) => a.order_index - b.order_index);
  const mainPhoto  = sorted.find((p) => p.id === user.profile_picture_id) ?? sorted[0] ?? null;
  const otherPhotos = sorted.filter((p) => p.id !== mainPhoto?.id);
  const slots = [mainPhoto, ...otherPhotos, ...Array(5 - sorted.length).fill(null)].slice(0, 5);

  return (
    <Section
      id="photos"
      label="Photos"
      badge={
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20">
          {photos.length} / 5
        </span>
      }
    >
      <div className="p-5">
        {!hasProfilePic && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              You need a profile picture to like other profiles. Upload at least one photo.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-xs text-(--color-text-muted)">
            Hover a photo to manage it · First one is your profile picture
          </p>
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold text-(--color-primary) hover:underline disabled:opacity-50"
            >
              + Upload
            </button>
          )}
        </div>

        <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
          {/* Main photo slot */}
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-(--color-background) border border-(--color-border) group">
            {mainPhoto ? (
              <>
                <img src={mainPhoto.url} alt="Profile picture" className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 rounded-full bg-(--color-primary) px-2 py-0.5 text-[9px] text-white font-semibold tracking-[0.2em] uppercase">
                  Profile pic
                </span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                <div className="absolute inset-0 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-(--color-primary)">
                    Main ✓
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(mainPhoto.id)}
                    className="rounded-full bg-white/90 p-2 text-(--color-text) hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-full flex flex-col items-center justify-center gap-2 text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
              >
                {uploading ? <Loader2 size={22} className="animate-spin" /> : <Camera size={24} />}
                <span className="text-sm font-medium">Add profile photo</span>
                <span className="text-xs opacity-60">Required to like others</span>
              </button>
            )}
          </div>

          {/* Thumbnail grid */}
          <div className="grid grid-cols-2 gap-2">
            {slots.slice(1).map((photo, index) => (
              <div
                key={photo?.id ?? `empty-${index}`}
                className="relative aspect-square rounded-3xl overflow-hidden bg-(--color-background) border border-(--color-border) group"
              >
                {photo ? (
                  <>
                    <img src={photo.url} alt={`Photo ${index + 2}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleSetMain(photo.id)}
                        title="Set as profile picture"
                        className="rounded-full bg-white/90 p-2 text-(--color-primary) hover:scale-110 transition-transform"
                      >
                        <Star size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(photo.id)}
                        className="rounded-full bg-white/90 p-2 text-(--color-text) hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-full flex flex-col items-center justify-center gap-1 text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
                  >
                    <Camera size={16} />
                    <span className="text-[10px] font-medium">Add</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-2.5 rounded-xl border border-dashed border-(--color-border) text-xs font-medium text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {uploading
              ? 'Uploading…'
              : `Upload more (${5 - photos.length} slot${5 - photos.length !== 1 ? 's' : ''} remaining)`}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        {error && (
          <p className="text-xs text-(--color-error) mt-2 flex items-center gap-1">
            <AlertTriangle size={11} /> {error}
          </p>
        )}
      </div>
    </Section>
  );
}
