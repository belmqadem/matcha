// src/components/profile/PhotosPanel.tsx
import { useRef, useState } from 'react';
import { Camera, Star, X, Loader2, AlertTriangle } from 'lucide-react';
import { userService } from '@/services/userService';
import type { UserProfile, Photo } from '@/types/user';

interface Props {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
}

export function PhotosPanel({ user, onUpdate }: Props) {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const photos = user.photos ?? [];
  const sorted = photos.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const slots: (Photo | null)[] = [...sorted, ...Array(5 - sorted.length).fill(null)].slice(0, 5);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    if (photos.length + files.length > 5) { setError('Max 5 photos.'); return; }

    setUploading(true);
    setError('');

    try {
      let updated = { ...user };
      for (const file of files) {
        const p = await userService.uploadPhoto(file);
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
      await userService.deletePhoto(id);
      const remaining = photos.filter(p => p.id !== id);
      const newPicId  = id === user.profile_picture_id ? (remaining[0]?.id ?? null) : user.profile_picture_id;
      onUpdate({ ...user, photos: remaining, profile_picture_id: newPicId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const handleSetMain = async (id: number) => {
    try {
      await userService.setMainPhoto(id);
      onUpdate({ ...user, profile_picture_id: id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    }
  };

  return (
    <div className="bg-surface rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-black text-text">Photos</h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-bold text-text-muted">{photos.length}/5</span>
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 sm:px-4 py-1.5 rounded-full cursor-pointer hover:bg-primary/20 transition-colors active:scale-95 disabled:opacity-50"
            >
              + Add photo
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 snap-x scrollbar-thin">
        {slots.map((photo, i) => (
          <div
            key={photo?.id ?? `empty-${i}`}
            className={`relative flex-shrink-0 w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden bg-background border-2 border-border snap-start group ${!photo ? 'cursor-pointer hover:border-primary transition-colors' : ''}`}
            onClick={() => !photo && fileRef.current?.click()}
          >
            {photo ? (
              <>
                <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                {photo.id === user.profile_picture_id && (
                  <span className="absolute top-2 left-2 bg-primary text-surface text-[0.65rem] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full tracking-widest shadow-md">MAIN</span>
                )}

                <div className="absolute inset-0 bg-text/0 group-hover:bg-text/30 transition-all duration-300">
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.id !== user.profile_picture_id && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSetMain(photo.id); }}
                        title="Set as main"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface flex items-center justify-center text-primary cursor-pointer shadow-sm hover:scale-110 transition-transform"
                      >
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface flex items-center justify-center text-text cursor-pointer shadow-sm hover:scale-110 hover:text-error transition-transform"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-text-muted opacity-60">
                {uploading && i === photos.length
                  ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
                  : <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                }
                <span className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider">Add</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} className="hidden" />

      {error && (
        <p className="text-xs sm:text-sm font-bold text-error mt-3 flex items-center gap-1.5 animate-fade-in-up">
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {error}
        </p>
      )}
    </div>
  );
}
